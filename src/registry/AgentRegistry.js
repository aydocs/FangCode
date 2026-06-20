const { slugify } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
const REQUIRED_FIELDS = ['name', 'description', 'version', 'system_prompt', 'category'];
const VALID_CATEGORIES = ['web', 'frontend', 'backend', 'fullstack', 'mobile', 'desktop', 'devops', 'cloud', 'security', 'ai', 'data', 'database', 'language', 'linux', 'leadership'];
class AgentRegistry {
  constructor() { this._agents = new Map(); this._byCategory = new Map(); this._byTag = new Map(); this.log = defaultLogger.child('registry'); }
  register(agent) {
    const errors = this.validate(agent);
    if (errors.length > 0) throw new Error(`Validation failed: ${errors.join('; ')}`);
    const slug = agent.slug || slugify(agent.name);
    if (this._agents.has(slug)) this.log.warn(`Agent '${slug}' exists, updating`);
    const record = { ...agent, slug, _registeredAt: this._agents.get(slug)?._registeredAt || new Date().toISOString() };
    this._agents.set(slug, record);
    if (!this._byCategory.has(agent.category)) this._byCategory.set(agent.category, new Set());
    this._byCategory.get(agent.category).add(slug);
    for (const tag of agent.tags || []) { if (!this._byTag.has(tag)) this._byTag.set(tag, new Set()); this._byTag.get(tag).add(slug); }
    return slug;
  }
  unregister(slug) { const a = this._agents.get(slug); if (!a) return false; this._agents.delete(slug); this._byCategory.get(a.category)?.delete(slug); for (const t of a.tags || []) this._byTag.get(t)?.delete(slug); return true; }
  get(slug) { return this._agents.get(slug) || null; }
  has(slug) { return this._agents.has(slug); }
  count() { return this._agents.size; }
  list(f = {}) {
    let r = Array.from(this._agents.values());
    if (f.category) r = r.filter(a => a.category === f.category);
    if (f.tag) { const s = this._byTag.get(f.tag); r = s ? r.filter(a => s.has(a.slug)) : []; }
    if (f.model) r = r.filter(a => (a.recommended_models || []).includes(f.model));
    return r.sort((a, b) => a.name.localeCompare(b.name));
  }
  search(query) {
    const q = query.toLowerCase();
    return Array.from(this._agents.values()).filter(a => [a.name, a.description, a.category, ...(a.skills || []), ...(a.tags || [])].join(' ').toLowerCase().includes(q));
  }
  validate(agent) {
    const e = [];
    for (const f of REQUIRED_FIELDS) { if (!agent[f]) e.push(`Missing: ${f}`); }
    if (agent.category && !VALID_CATEGORIES.includes(agent.category)) e.push(`Invalid category: ${agent.category}`);
    if (agent.version && !/^\d+\.\d+\.\d+$/.test(agent.version)) e.push('Version must be semver');
    return e;
  }
  exportAll() { return Array.from(this._agents.values()); }
  clear() { this._agents.clear(); this._byCategory.clear(); this._byTag.clear(); }
}
module.exports = { AgentRegistry, VALID_CATEGORIES };
