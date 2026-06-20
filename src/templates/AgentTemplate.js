const path = require('path');
const { slugify, writeFile, readFile, listFiles } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');
const BUILTIN_TEMPLATES = {
  'web-developer': { category: 'web', skills: ['html', 'css', 'javascript'], tools: ['bash', 'read', 'write', 'edit', 'grep', 'glob', 'webfetch'] },
  'mobile-developer': { category: 'mobile', skills: ['flutter', 'react-native', 'ios', 'android'], tools: ['bash', 'read', 'write', 'edit', 'grep', 'glob'] },
  'devops': { category: 'devops', skills: ['docker', 'kubernetes', 'ci-cd'], tools: ['bash', 'read', 'write', 'edit', 'grep', 'glob', 'webfetch'] },
  'security': { category: 'security', skills: ['penetration-testing', 'code-audit'], tools: ['bash', 'read', 'write', 'edit', 'grep', 'glob'] },
  'ai-engineer': { category: 'ai', skills: ['machine-learning', 'deep-learning'], tools: ['bash', 'read', 'write', 'edit', 'grep', 'glob'] },
};
class AgentTemplate {
  constructor() { this.log = defaultLogger.child('template'); }
  async create(name, options = {}) {
    const slug = slugify(name);
    const base = BUILTIN_TEMPLATES[options.template || 'web-developer'] || BUILTIN_TEMPLATES['web-developer'];
    return { name, slug, version: options.version || '1.0.0', description: options.description || `A ${name} agent`, category: options.category || base.category, tags: options.tags || [], author: { name: options.author || 'Community' }, license: 'MIT', system_prompt: options.system_prompt || `You are ${name}, a specialized agent for FangCode.\nExpertise: ${(options.skills || base.skills).join(', ')}.\nProvide expert-level, actionable advice.`, skills: options.skills || base.skills, tools: options.tools || base.tools, recommended_models: options.models || ['mimo-v2.5-pro'], examples: options.examples || [] };
  }
  async fromTemplate(tn) { try { return require('yaml').parse(await readFile(path.join(TEMPLATES_DIR, `${tn}.yaml`))); } catch { return BUILTIN_TEMPLATES[tn] || null; } }
  async listTemplates() { const b = Object.keys(BUILTIN_TEMPLATES); let c = []; try { c = (await listFiles(TEMPLATES_DIR, '.yaml')).map(f => path.basename(f, '.yaml')); } catch {} return { builtins: b, customs: c, all: [...b, ...c] }; }
}
module.exports = { AgentTemplate, BUILTIN_TEMPLATES };
