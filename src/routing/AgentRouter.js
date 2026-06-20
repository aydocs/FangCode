const { defaultLogger } = require('../utils/logger');
const KEYWORD_MAP = {
  react: ['frontend-developer'], vue: ['frontend-developer'], angular: ['frontend-developer'],
  html: ['web-developer', 'frontend-developer'], css: ['web-developer', 'frontend-developer'],
  javascript: ['web-developer', 'nodejs-developer'], typescript: ['web-developer', 'nodejs-developer', 'backend-developer'],
  python: ['python-developer', 'backend-developer'], rust: ['rust-developer'],
  go: ['go-developer', 'backend-developer'], kotlin: ['android-developer'],
  swift: ['ios-developer'], dart: ['flutter-developer'], flutter: ['flutter-developer'],
  docker: ['devops-engineer'], kubernetes: ['kubernetes-engineer', 'devops-engineer'],
  terraform: ['devops-engineer', 'cloud-architect'], aws: ['cloud-architect'],
  security: ['security-auditor'], malware: ['malware-analyst'], reverse: ['reverse-engineer'],
  incident: ['incident-responder'], soc: ['soc-analyst'],
  ml: ['ai-engineer'], ai: ['ai-engineer'], llm: ['ai-engineer', 'prompt-engineer'],
  prompt: ['prompt-engineer'], agent: ['agent-builder'], mcp: ['mcp-engineer'],
  database: ['database-engineer'], sql: ['database-engineer'],
  linux: ['linux-engineer'], shell: ['linux-engineer'],
  startup: ['startup-cto'], architecture: ['architect'],
  api: ['backend-developer'], microservices: ['backend-developer', 'architect'],
  desktop: ['desktop-developer'], electron: ['desktop-developer'],
};
class AgentRouter {
  constructor(registry) { this.registry = registry; this.log = defaultLogger.child('router'); }
  route(request, options = {}) {
    const query = (request || '').toLowerCase();
    const matches = this.matchAgent(query, this.registry.list());
    if (matches.length === 0) return options.fallback || null;
    const ranked = this.rankAgents(matches);
    this.log.debug(`Routed to: ${ranked[0].slug} (score: ${ranked[0].score})`);
    return ranked[0];
  }
  matchAgent(request, agents) {
    const q = request.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const matched = [];
    for (const agent of agents) {
      let score = 0;
      for (const w of words) {
        if (agent.name?.toLowerCase().includes(w)) score += 3;
        if (agent.description?.toLowerCase().includes(w)) score += 1;
        for (const s of agent.skills || []) { if (s.toLowerCase().includes(w)) score += 2; }
        for (const t of agent.tags || []) { if (t.toLowerCase().includes(w)) score += 1.5; }
      }
      for (const [kw, slugs] of Object.entries(KEYWORD_MAP)) { if (q.includes(kw) && slugs.includes(agent.slug || '')) score += 4; }
      if (score > 0) matched.push({ agent, slug: agent.slug, score });
    }
    return matched;
  }
  rankAgents(m) { return m.sort((a, b) => b.score - a.score); }
  async getRecommendations(ctx) {
    const recent = ctx.recentAgents || [];
    return this.registry.list().map(a => { let s = 0; for (const sk of ctx.currentSkills || []) { if ((a.skills || []).includes(sk)) s += 2; } if (!recent.includes(a.slug)) s += 1; return { slug: a.slug, name: a.name, score: s }; }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  }
}
module.exports = { AgentRouter, KEYWORD_MAP };
