const { defaultLogger } = require('../utils/logger');
class MCPIntegration {
  constructor() { this.log = defaultLogger.child('mcp'); this._servers = new Map(); this._agentMCP = new Map(); }
  async connect(config) {
    const { name, command, args = [], env = {} } = config;
    const server = { name, command, args, env, status: 'connecting', tools: [], connectedAt: null, process: null };
    try {
      const { spawn } = require('child_process');
      const proc = spawn(command, args, { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
      server.process = proc; server.status = 'connected'; server.connectedAt = new Date().toISOString();
      proc.stdout.on('data', () => {}); proc.stderr.on('data', d => this.log.debug(`[${name}] ${d}`));
      proc.on('close', () => { server.status = 'disconnected'; });
      this._servers.set(name, server); return server;
    } catch (err) { server.status = 'error'; server.error = err.message; return server; }
  }
  async disconnect(name) { const s = this._servers.get(name); if (!s) return false; if (s.process && !s.process.killed) s.process.kill(); this._servers.delete(name); return true; }
  listServers() { return Array.from(this._servers.values()).map(s => ({ name: s.name, status: s.status, command: s.command })); }
  isHealthy(n) { return this._servers.get(n)?.status === 'connected'; }
  async callTool(serverName, toolName, args = {}) {
    const s = this._servers.get(serverName); if (!s || s.status !== 'connected') throw new Error(`Not connected: ${serverName}`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
      let response = '';
      const onData = chunk => { response += chunk.toString(); try { const p = JSON.parse(response); clearTimeout(timeout); s.process.stdout.removeListener('data', onData); p.error ? reject(new Error(p.error.message)) : resolve(p.result); } catch {} };
      s.process.stdout.on('data', onData);
      s.process.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/call', params: { name: toolName, arguments: args } }) + '\n');
    });
  }
  async listTools(serverName) {
    const s = this._servers.get(serverName); if (!s || s.status !== 'connected') throw new Error(`Not connected: ${serverName}`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
      let response = '';
      const onData = chunk => { response += chunk.toString(); try { const p = JSON.parse(response); clearTimeout(timeout); s.process.stdout.removeListener('data', onData); resolve(p.result?.tools || []); } catch {} };
      s.process.stdout.on('data', onData);
      s.process.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'tools/list', params: {} }) + '\n');
    });
  }
  registerAgentMCP(slug, names) { this._agentMCP.set(slug, names); }
  getAgentMCP(slug) { return (this._agentMCP.get(slug) || []).filter(n => this.isHealthy(n)); }
  getStatus() { const s = this.listServers(); return { total: s.length, connected: s.filter(x => x.status === 'connected').length, servers: s }; }
}
module.exports = { MCPIntegration };
