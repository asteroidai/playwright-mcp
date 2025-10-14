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

import type * as playwright from 'playwright';
import type { ModalState } from './context.js';
import type { Context } from './context.js';

/**
 * Console message type
 */
export type ConsoleMessage = {
  type: ReturnType<playwright.ConsoleMessage['type']> | undefined;
  text: string;
  toString(): string;
};

/**
 * Tab snapshot type
 */
export type TabSnapshot = {
  url: string;
  title: string;
  ariaSnapshot: string;
  modalStates: ModalState[];
  consoleMessages: ConsoleMessage[];
  downloads: { download: playwright.Download; finished: boolean; outputFile: string }[];
};

/**
 * Tab class type definition
 */
export type Tab = {
  readonly context: Context;
  readonly page: playwright.Page;

  modalStates(): ModalState[];
  setModalState(modalState: ModalState): void;
  clearModalState(modalState: ModalState): void;
  modalStatesMarkdown(): string[];
  updateTitle(): Promise<void>;
  lastTitle(): string;
  isCurrentTab(): boolean;
  waitForLoadState(state: 'load', options?: { timeout?: number }): Promise<void>;
  navigate(url: string): Promise<void>;
  consoleMessages(): ConsoleMessage[];
  requests(): Map<playwright.Request, playwright.Response | null>;
  captureSnapshot(): Promise<TabSnapshot>;
  refLocator(params: { element: string; ref: string }): Promise<playwright.Locator>;
  refLocators(params: { element: string; ref: string }[]): Promise<playwright.Locator[]>;
  waitForTimeout(time: number): Promise<void>;
  waitForCompletion(callback: () => Promise<void>): Promise<void>;
};
