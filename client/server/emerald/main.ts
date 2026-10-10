// Entry point of the Emerald Nightmare MCP server (stdio transport).
// Works without the Vite dev server: it reads and writes the same files.
// stdout carries the MCP protocol, so log only to stderr.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createEmeraldStore } from './fileStore';
import { createEmeraldMcpServer } from './mcpServer';

const clientRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const server = createEmeraldMcpServer(createEmeraldStore(clientRoot));
await server.connect(new StdioServerTransport());
console.error(`emerald-nightmare-characters MCP ready (data: ${clientRoot})`);
