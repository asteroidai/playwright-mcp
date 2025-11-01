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

export declare class StateManager {
  /**
   * Serializes the current state of a Context for persistence.
   * Extracts browser storage state (cookies, localStorage) and tab state (URLs, titles, console messages).
   */
  static serialize(context: Context): Promise<SerializedState>;
  /**
   * Hydrates a browser context with serialized state.
   * Restores browser storage state (via newContext options) and recreates tabs.
   * Note: Browser storage state should be applied when creating the context,
   * so this method primarily restores tab state.
   */
  static hydrate(browserContext: playwright.BrowserContext, state: SerializedState): Promise<void>;
  /**
   * Validates that a serialized state has the expected structure.
   * Returns true if valid, false otherwise.
   */
  static isValidState(state: any): state is SerializedState;
}
