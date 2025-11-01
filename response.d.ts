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
import type { TabSnapshot } from './tab.js';
import type { ImageContent, TextContent } from '@modelcontextprotocol/sdk/types.js';
import type { Context } from './context.js';
export declare class Response {
    private _result;
    private _code;
    private _images;
    private _context;
    private _includeSnapshot;
    private _includeTabs;
    private _tabSnapshot;
    readonly toolName: string;
    readonly toolArgs: Record<string, any>;
    private _isError;
    constructor(context: Context, toolName: string, toolArgs: Record<string, any>);
    addResult(result: string): void;
    addError(error: string): void;
    isError(): boolean;
    result(): string;
    addCode(code: string): void;
    code(): string;
    addImage(image: {
        contentType: string;
        data: Buffer;
    }): void;
    images(): {
        contentType: string;
        data: Buffer;
    }[];
    setIncludeSnapshot(): void;
    setIncludeTabs(): void;
    finish(): Promise<void>;
    tabSnapshot(): TabSnapshot | undefined;
    serialize(): {
        content: (TextContent | ImageContent)[];
        isError?: boolean;
    };
}
