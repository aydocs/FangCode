const path = require('path');
const fs = require('fs');
const { AgentRegistry } = require('../registry');
const { AgentLoader } = require('../loader');
const { ensureDir, readFile, writeFile, fileExists, slugify } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
class AgentManager {
  constructor(agentsDir) {
    this.agentsDir = agentsDir || path.resolve(__dirname, '../../agents');
    this.registry = new AgentRegistry();
    this.loader = new AgentLoader(this.agentsDir);
    this.log = defaultLogger.child('manager');
    this._initialized = false;
  }
  async init() {
    if (this._initialized) return this;
    await ensureDir(this.agentsDir);
    const agents = await this.loader.loadAll();
    for (const agent of agents) { try { this.registry.register(agent); } catch (err) { this.log.warn(`Skipped ${agent.name}: ${err.message}`); } }
    this._initialized = true;
    this.log.info(`Initialized with ${this.registry.count()} agents`);
    return this;
  }
  async install(source) {
    let agent;
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const response = await fetch(source);
      const text = await response.text();
      const ext = source.endsWith('.json') ? '.json' : '.yaml';
      const tmpPath = path.join(this.agentsDir, `_tmp${ext}`);
      await writeFile(tmpPath, text); agent = await this.loader.loadFile(tmpPath); fs.unlinkSync(tmpPath);
    } else if (fs.existsSync(source)) { agent = await this.loader.loadFile(source); }
    else throw new Error(`Source not found: ${source}`);
    if (!agent) throw new Error('Failed to load agent');
    const slug = agent.slug || slugify(agent.name);
    const dest = path.join(this.agentsDir, `${slug}.yaml`);
    if (await fileExists(dest)) fs.copyFileSync(dest, `${dest}.backup.${Date.now()}`);
    await writeFile(dest, require('yaml').stringify(agent));
    this.registry.register(agent);
    this.log.info(`Installed: ${slug}`);
    return slug;
  }
  async remove(slug) {
    if (!this.registry.has(slug)) throw new Error(`Not found: ${slug}`);
    const agent = this.registry.get(slug);
    const fp = agent._sourceFile || path.join(this.agentsDir, `${slug}.yaml`);
    if (fs.existsSync(fp)) fs.renameSync(fp, `${fp}.removed.${Date.now()}`);
    this.registry.unregister(slug);
    this.log.info(`Removed: ${slug}`);
    return true;
  }
  async update(slug) {
    if (!this.registry.has(slug)) throw new Error(`Not found: ${slug}`);
    const agent = this.registry.get(slug);
    if (agent._sourceFile && fs.existsSync(agent._sourceFile)) { const fresh = await this.loader.loadFile(agent._sourceFile); if (fresh) { this.registry.register(fresh); return fresh; } }
    return agent;
  }
  async run(slug, context = {}) {
    if (!this.registry.has(slug)) throw new Error(`Not found: ${slug}`);
    const agent = this.registry.get(slug);
    return { agent: slug, system_prompt: agent.system_prompt, config: { model: context.model || agent.recommended_models?.[0] || 'mimo-v2.5-pro', temperature: agent.config?.temperature || 0.7, max_tokens: agent.config?.max_tokens || 4096 }, skills: agent.skills || [], tools: agent.tools || [], mcp_servers: agent.mcp_servers || [], context };
  }
  async exportAgent(slug, destPath) {
    if (!this.registry.has(slug)) throw new Error(`Not found: ${slug}`);
    const agent = { ...this.registry.get(slug) };
    delete agent._registeredAt; delete agent._sourceFile; delete agent._sourceFormat;
    const dest = destPath || path.join(this.agentsDir, `${slug}-export.yaml`);
    await writeFile(dest, require('yaml').stringify(agent));
    return dest;
  }
  async importAgent(sourcePath) { return this.install(sourcePath); }
  list(f) { return this.registry.list(f); }
  search(q) { return this.registry.search(q); }
  get(slug) { return this.registry.get(slug); }
  count() { return this.registry.count(); }
}
module.exports = { AgentManager };
