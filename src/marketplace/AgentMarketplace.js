const path = require('path');
const { ensureDir, readFile, writeFile, safeJSONParse } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
const INDEX_PATH = path.join(__dirname, '../../.marketplace-index.json');
class AgentMarketplace {
  constructor() { this.log = defaultLogger.child('marketplace'); this._index = null; }
  async _load() { if (this._index) return this._index; try { this._index = safeJSONParse(await readFile(INDEX_PATH)).data || { agents: [], meta: {} }; } catch { this._index = { agents: [], meta: { updated: null, total: 0 } }; } return this._index; }
  async _save() { this._index.meta.updated = new Date().toISOString(); this._index.meta.total = this._index.agents.length; await writeFile(INDEX_PATH, JSON.stringify(this._index, null, 2)); }
  async list(o = {}) { await this._load(); let a = this._index.agents; if (o.category) a = a.filter(x => x.category === o.category); if (o.sort === 'downloads') a.sort((x, y) => (y.downloads || 0) - (x.downloads || 0)); else a.sort((x, y) => x.name.localeCompare(y.name)); if (o.limit) a = a.slice(0, o.limit); return a; }
  async search(q, f = {}) { await this._load(); let r = this._index.agents.filter(a => [a.name, a.description, a.category, ...(a.tags || [])].join(' ').toLowerCase().includes(q.toLowerCase())); if (f.category) r = r.filter(a => a.category === f.category); return r; }
  async info(slug) { await this._load(); return this._index.agents.find(a => a.slug === slug) || null; }
  async install(slug) { const i = await this.info(slug); if (!i) throw new Error(`Not found: ${slug}`); i.downloads = (i.downloads || 0) + 1; await this._save(); return i; }
  async rate(slug, stars) { if (stars < 1 || stars > 5) throw new Error('Stars 1-5'); const i = await this.info(slug); if (!i) throw new Error(`Not found: ${slug}`); i.ratingCount = (i.ratingCount || 0) + 1; i.rating = ((i.rating || 0) * (i.ratingCount - 1) + stars) / i.ratingCount; await this._save(); return i; }
}
module.exports = { AgentMarketplace };
