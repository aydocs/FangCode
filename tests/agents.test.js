const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { AgentRegistry } = require('../src/registry');
const { AgentLoader } = require('../src/loader');
const { AgentManager } = require('../src/manager');
const { AgentRouter } = require('../src/routing');
const { AgentTemplate } = require('../src/templates');
const { MultiAgentSystem } = require('../src/multiagent');
const { AgentOrchestrator } = require('../src/orchestration');
const AGENTS_DIR = path.resolve(__dirname, '../agents');
describe('AgentRegistry', () => {
  it('register and retrieve', () => { const r = new AgentRegistry(); r.register({ name: 'Test', slug: 'test', version: '1.0.0', description: 'A test agent for testing', category: 'web', system_prompt: 'Test prompt' }); assert.ok(r.has('test')); assert.strictEqual(r.count(), 1); });
  it('reject invalid', () => { const r = new AgentRegistry(); assert.throws(() => r.register({ name: 'Bad' }), /validation/i); });
  it('search', () => { const r = new AgentRegistry(); r.register({ name: 'Web Dev', slug: 'web-dev', version: '1.0.0', description: 'Web development agent', category: 'web', system_prompt: 'Web prompt' }); r.register({ name: 'Security', slug: 'security', version: '1.0.0', description: 'Security audit agent', category: 'security', system_prompt: 'Security prompt' }); assert.strictEqual(r.search('web').length, 1); });
});
describe('AgentLoader', () => {
  it('load agents', async () => { const loader = new AgentLoader(AGENTS_DIR); const agents = await loader.loadAll(); assert.ok(agents.length > 0); });
});
describe('AgentManager', () => {
  it('init with agents', async () => { const mgr = new AgentManager(AGENTS_DIR); await mgr.init(); assert.ok(mgr.count() > 0); });
  it('search', async () => { const mgr = new AgentManager(AGENTS_DIR); await mgr.init(); assert.ok(mgr.search('python').length > 0); });
});
describe('AgentRouter', () => {
  it('route to correct agent', async () => { const mgr = new AgentManager(AGENTS_DIR); await mgr.init(); const router = new AgentRouter(mgr.registry); const match = router.route('I need help with Docker'); assert.ok(match); assert.ok(match.slug.includes('devops') || match.slug.includes('kubernetes')); });
});
describe('AgentTemplate', () => {
  it('list templates', async () => { const t = new AgentTemplate(); const templates = await t.listTemplates(); assert.ok(templates.builtins.length > 0); });
  it('create agent', async () => { const t = new AgentTemplate(); const agent = await t.create('My Agent', { category: 'web', skills: ['html'] }); assert.strictEqual(agent.name, 'My Agent'); });
});
describe('MultiAgentSystem', () => {
  it('register agents and create teams', async () => { const mgr = new AgentManager(AGENTS_DIR); await mgr.init(); const orch = new AgentOrchestrator(mgr); const multi = new MultiAgentSystem(orch); multi.registerAgent('web-developer', { role: 'worker' }); multi.registerAgent('backend-developer', { role: 'worker' }); multi.createTeam('fullstack-team', ['web-developer', 'backend-developer'], { strategy: 'parallel' }); assert.strictEqual(multi.listAgents().length, 2); assert.strictEqual(multi.listTeams().length, 1); });
});
