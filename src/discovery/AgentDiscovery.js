const { AgentLoader } = require('../loader');
const { defaultLogger } = require('../utils/logger');
class AgentDiscovery {
  constructor() { this.log = defaultLogger.child('discovery'); this._results = []; }
  async discoverLocal(dirPath) { const loader = new AgentLoader(dirPath); return (await loader.loadAll()).map(a => ({ ...a, _source: 'local', _sourcePath: dirPath })); }
  async discoverRemote(url) { try { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); const d = await r.json(); return (Array.isArray(d) ? d : d.agents || []).map(a => ({ ...a, _source: 'remote' })); } catch { return []; } }
  async scan(dirs = [], urls = []) { this._results = []; for (const d of dirs) this._results.push(...await this.discoverLocal(d)); for (const u of urls) this._results.push(...await this.discoverRemote(u)); return this._results; }
  mergeResults(results) { const seen = new Map(); for (const a of results) { const s = a.slug || a.name?.toLowerCase().replace(/\s+/g, '-'); if (s && !seen.has(s)) seen.set(s, a); } return Array.from(seen.values()); }
  getResults() { return this._results; }
}
module.exports = { AgentDiscovery };
