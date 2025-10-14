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
import type { Tab } from './tab.js';
import type { Config, ToolCapability } from './config.js';
import type { Response } from './response.js';
import type { z } from 'zod';

/**
 * Re-export ToolCapability from config
 */
export type { ToolCapability } from './config.js';

/**
 * Re-export Response from response
 */
export type { Response } from './response.js';

/**
 * Full resolved configuration for the MCP server
 */
export type FullConfig = Config & {
  browser: Omit<NonNullable<Config['browser']>, 'browserName'> & {
    browserName: 'chromium' | 'firefox' | 'webkit';
    launchOptions: NonNullable<NonNullable<Config['browser']>['launchOptions']>;
    contextOptions: NonNullable<NonNullable<Config['browser']>['contextOptions']>;
  };
  network: NonNullable<Config['network']>;
  saveTrace: boolean;
  server: NonNullable<Config['server']>;
};

/**
 * Modal state types for handling dialogs and file choosers
 */
export type FileUploadModalState = {
  type: 'fileChooser';
  description: string;
  fileChooser: playwright.FileChooser;
};

export type DialogModalState = {
  type: 'dialog';
  description: string;
  dialog: playwright.Dialog;
};

export type ModalState = FileUploadModalState | DialogModalState;

/**
 * Tool schema type
 */
export type ToolSchema<Input extends z.Schema = z.Schema> = {
  name: string;
  title: string;
  description: string;
  inputSchema: Input;
  type: 'readOnly' | 'destructive';
};

/**
 * Tool type definition
 */
export type Tool<Input extends z.Schema = z.Schema> = {
  capability: ToolCapability;
  schema: ToolSchema<Input>;
  handle: (context: Context, params: z.output<Input>, response: Response) => Promise<void>;
};

/**
 * Context class type definition
 */
export type Context = {
  readonly tools: Tool[];
  readonly config: FullConfig;

  tabs(): Tab[];
  currentTab(): Tab | undefined;
  currentTabOrDie(): Tab;
  newTab(): Promise<Tab>;
  selectTab(index: number): Promise<Tab>;
  ensureTab(): Promise<Tab>;
  closeTab(index: number | undefined): Promise<string>;
  outputFile(name: string): Promise<string>;
  closeBrowserContext(): Promise<void>;
  isRunningTool(): boolean;
  setRunningTool(name: string | undefined): void;
  dispose(): Promise<void>;
};
