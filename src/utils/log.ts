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

import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import debug from 'debug';

const errorsDebug = debug('pw:mcp:errors');

export function logUnhandledError(err: Error | unknown, ...args: any[]) {
  const error = err instanceof Error ? err : new Error(String(err));

  trace.getSpan(context.active())?.addEvent('error', {
    'error': error.message,
    'args': args,
  } as any).setAttributes({
    'error': error.message,
    'args': args,
  }).setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  }).recordException(error);

  errorsDebug(error, ...args);
}

const testDebugger = debug('pw:mcp:test');

export function testDebug(message: string, ...args: any[]) {
  trace.getSpan(context.active())?.addEvent('debug', {
    'message': message,
    'args': args,
  } as any).setAttributes({
    'message': message,
    'args': args,
  });

  testDebugger(message, ...args);
}

const relayDebugger = debug('pw:mcp:relay');

export function relayDebug(message: string, ...args: any[]) {
  trace.getSpan(context.active())?.addEvent('relay', {
    'message': message,
    'args': args,
  } as any).setAttributes({
    'message': message,
    'args': args,
  });

  relayDebugger(message, ...args);
}

const serverDebugger = debug('pw:mcp:server');

export function serverDebug(event: string, ...args: any[]) {
  trace.getSpan(context.active())?.addEvent(`server:${event}`, {
    'args': JSON.stringify(args),
  } as any);

  serverDebugger(event, ...args);
}
