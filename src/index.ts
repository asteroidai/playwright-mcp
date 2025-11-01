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

import { BrowserServerBackend } from './browserServerBackend.js';
import { resolveConfig } from './config.js';
import { contextFactory } from './browserContextFactory.js';
import * as mcpServer from './mcp/server.js';
import { packageJSON } from './utils/package.js';

import { Context } from './context.js';
import type { Config } from '../config.js';
import type { BrowserContext } from 'playwright';
import type { BrowserContextFactory } from './browserContextFactory.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

// Export Response class for external use
export { Response } from './response.js';
// Export StateManager for stateless proxy implementations
export { StateManager, type SerializedState } from './stateManager.js';

export interface Connection {
  server: Server;
  context: Context;
}

export async function createConnection(
  userConfig: Config = {},
  contextGetter?: () => Promise<BrowserContext>,
  options?: { keepContextAlive?: boolean }
): Promise<Connection> {
  const config = await resolveConfig(userConfig);
  const factory = contextGetter
    ? new SimpleBrowserContextFactory(contextGetter, options?.keepContextAlive ?? false)
    : contextFactory(config);
  const backend = new BrowserServerBackend(config, factory);
  const server = await mcpServer.createServer('Playwright', packageJSON.version, backend, false);
  return {
    server,
    context: await backend.getContext()
  };
}

class SimpleBrowserContextFactory implements BrowserContextFactory {
  name = 'custom';
  description = 'Connect to a browser using a custom context getter';

  private readonly _contextGetter: () => Promise<BrowserContext>;
  private readonly _keepContextAlive: boolean;
  // Keep a reference to the browser context to prevent GC when keepContextAlive is true
  private _cachedContext: BrowserContext | undefined;

  constructor(contextGetter: () => Promise<BrowserContext>, keepContextAlive: boolean = false) {
    this._contextGetter = contextGetter;
    this._keepContextAlive = keepContextAlive;
  }

  async createContext(): Promise<{ browserContext: BrowserContext, close: () => Promise<void> }> {
    const browserContext = await this._contextGetter();

    // For keepContextAlive, cache the context to prevent GC
    if (this._keepContextAlive)
      this._cachedContext = browserContext;

    return {
      browserContext,
      // If keepContextAlive is true, return a no-op close function to prevent closing the context
      // This is important for remote browsers (CDP/WS) that should remain alive between requests
      close: this._keepContextAlive
        ? async () => {
          // No-op: Don't close the context, let it remain alive for future use
          // The context is cached to prevent garbage collection
        }
        : () => browserContext.close()
    };
  }
}
