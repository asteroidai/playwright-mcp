/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as playwright from 'playwright';
import { logUnhandledError } from './utils/log.js';
import type { Context } from './context.js';
import type { ConsoleMessage } from './tab.js';

export interface SerializedState {
  version: number;
  browserStorageState: {
    cookies: playwright.Cookie[];
    origins: Array<{
      origin: string;
      localStorage: Array<{ name: string; value: string }>;
    }>;
  } | null;
  tabs: Array<{
    url: string;
    title: string;
    index: number;
    recentConsoleMessages: ConsoleMessage[];
  }>;
  currentTabIndex: number;
  metadata: {
    lastUpdated: string;
    serializedBy: string;
  };
}

export class StateManager {
  /**
   * Serializes the current state of a Context for persistence.
   * Extracts browser storage state (cookies, localStorage) and tab state (URLs, titles, console messages).
   *
   * @param context - The Context to serialize
   * @param maxTabsToTrack - Optional maximum number of tabs to serialize. If provided, only the first N tabs will be serialized.
   *                         This is useful for stateless pools where extra pages may exist in the browser context
   *                         but should not be persisted. The assumption is that legitimate tabs will be in the first N positions.
   */
  static async serialize(context: Context, maxTabsToTrack?: number): Promise<SerializedState> {
    const currentTab = context.currentTab();
    let tabs = context.tabs();

    // If a maximum tab count is provided, limit to first N tabs
    // This allows stateless pools to ignore extra pages that were discovered but aren't part of the stored state
    // The assumption is that legitimate tabs will be discovered in order and extras will be beyond the limit
    if (maxTabsToTrack !== undefined && maxTabsToTrack > 0)
      tabs = tabs.slice(0, maxTabsToTrack);

    // Get browser context to extract storage state
    let browserStorageState: SerializedState['browserStorageState'] = null;
    try {
      if (currentTab) {
        const browserContext = currentTab.page.context();
        const storageState = await browserContext.storageState();
        browserStorageState = {
          cookies: storageState.cookies,
          origins: storageState.origins || [],
        };
      }
    } catch (error) {
      // If storage state cannot be retrieved, continue with null
      // This can happen if the browser context is already closed
      logUnhandledError(error instanceof Error ? error : new Error(String(error)), 'Failed to get browser storage state');
    }

    // Serialize tab state
    const serializedTabs = tabs.map((tab, index) => ({
      url: tab.page.url(),
      title: tab.lastTitle(),
      index,
      recentConsoleMessages: tab.consoleMessages().slice(-50), // Keep last 50 messages
    }));

    // Get current tab index (based on filtered tabs)
    const currentTabIndex = currentTab && tabs.includes(currentTab) ? tabs.indexOf(currentTab) : -1;

    return {
      version: 1,
      browserStorageState,
      tabs: serializedTabs,
      currentTabIndex,
      metadata: {
        lastUpdated: new Date().toISOString(),
        serializedBy: process.env.HOSTNAME || process.env.USER || 'unknown',
      },
    };
  }

  /**
   * Hydrates a browser context and Context with serialized state.
   *
   * IMPORTANT: This method does NOT manipulate browser pages/tabs.
   * We restore in-memory state (console messages, titles) but don't touch the browser.
   *
   * What we do:
   * - Ensure at least one page exists (critical for keeping remote browsers alive)
   * - Restore tab state (console messages, titles) to Context's Tab objects
   * - Set the current tab based on stored index
   * - Storage state (cookies, localStorage) is applied when creating the context via contextOptions
   *
   * What we DON'T do:
   * - Close or open pages/tabs in the browser
   * - Navigate pages to specific URLs
   * - Recreate the tab structure
   *
   * The Context class will automatically discover and track existing pages
   * via the browserContext.pages() call in _setupBrowserContext.
   * After discovery, this method restores the in-memory state to those tabs.
   */
  static async hydrate(
    browserContext: playwright.BrowserContext,
    state: SerializedState,
    context?: Context
  ): Promise<void> {
    // Ensure at least one page exists (critical for keeping remote browsers alive)
    // This prevents the browser from being shut down by remote services
    const existingPages = browserContext.pages();
    if (existingPages.length === 0)
      await browserContext.newPage();

    // If Context is provided, restore tab state (console messages, titles, current tab)
    // Limit hydration to the number of tabs in stored state to avoid touching extra discovered pages
    if (context && state.tabs.length > 0)
      await context.hydrateTabState(state.tabs, state.currentTabIndex, state.tabs.length);
  }

  /**
   * Validates that a serialized state has the expected structure.
   * Returns true if valid, false otherwise.
   */
  static isValidState(state: any): state is SerializedState {
    if (!state || typeof state !== 'object')
      return false;
    if (typeof state.version !== 'number')
      return false;
    if (!Array.isArray(state.tabs))
      return false;
    if (typeof state.currentTabIndex !== 'number')
      return false;
    if (!state.metadata || typeof state.metadata.lastUpdated !== 'string')
      return false;

    // Validate tabs structure
    for (const tab of state.tabs) {
      if (typeof tab.url !== 'string')
        return false;
      if (typeof tab.title !== 'string')
        return false;
      if (typeof tab.index !== 'number')
        return false;
      if (!Array.isArray(tab.recentConsoleMessages))
        return false;
    }

    return true;
  }
}
