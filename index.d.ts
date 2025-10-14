#!/usr/bin/env node
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

import type { Context } from './context.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Config } from './config.js';
import type { BrowserContext } from 'playwright';

export interface Connection {
  server: Server;
  context: Context;
}

export declare function createConnection(config?: Config, contextGetter?: () => Promise<BrowserContext>): Promise<Connection>;

// Export Response class
export { Response } from './response.js';

// Re-export types from context.d.ts
export type {
  Context,
  Tool,
  ToolCapability,
  ToolSchema,
  ModalState,
  FileUploadModalState,
  DialogModalState,
  FullConfig,
} from './context.js';

// Re-export types from tab.d.ts
export type {
  Tab,
  TabSnapshot,
  ConsoleMessage,
} from './tab.js';

// Re-export Config type
export type { Config } from './config.js';

export {};
