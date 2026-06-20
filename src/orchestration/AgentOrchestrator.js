const { generateId } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
class AgentOrchestrator {
  constructor(manager) { this.manager = manager; this.log = defaultLogger.child('orchestrator'); this._executions = new Map(); }
  async execute(wf) {
    const eid = generateId();
    this.log.info(`Workflow: ${eid}`);
    this._executions.set(eid, { status: 'running', steps: [], startedAt: new Date().toISOString() });
    const exec = this._executions.get(eid);
    for (const step of wf.steps || []) {
      try { const result = await this.delegate(step.agent, step.task, step.context); exec.steps.push({ ...step, result, status: 'success' }); }
      catch (err) { exec.steps.push({ ...step, error: err.message, status: 'failed' }); if (step.required !== false) { exec.status = 'failed'; exec.error = err.message; exec.completedAt = new Date().toISOString(); return exec; } }
    }
    exec.status = 'completed'; exec.completedAt = new Date().toISOString();
    return exec;
  }
  async delegate(slug, task, ctx = {}) {
    if (!this.manager.registry.has(slug)) throw new Error(`Agent not found: ${slug}`);
    const cfg = await this.manager.run(slug, { ...ctx, task, delegatedBy: 'orchestrator' });
    return { agent: slug, task, prompt: cfg.system_prompt, config: cfg.config, context: ctx };
  }
  async chain(slugs, task) { const r = []; let ctx = { task }; for (const s of slugs) { const res = await this.delegate(s, task, ctx); r.push(res); ctx = { ...ctx, prev: s, prevResult: res }; } return r; }
  async parallel(slugs, task) { return Promise.all(slugs.map(s => this.delegate(s, task).catch(e => ({ agent: s, error: e.message, status: 'failed' })))); }
  async fanOut(slugs, tasks) { const p = []; for (let i = 0; i < Math.max(slugs.length, tasks.length); i++) p.push(this.delegate(slugs[i % slugs.length], tasks[i] || tasks[0]).catch(e => ({ error: e.message }))); return Promise.all(p); }
  async fanIn(results, agg) { return typeof agg === 'function' ? agg(results) : { results, summary: results.map(r => ({ agent: r.agent, status: r.error ? 'failed' : 'success' })) }; }
  getExecution(id) { return this._executions.get(id) || null; }
  listExecutions() { return Array.from(this._executions.entries()).map(([id, e]) => ({ id, ...e })); }
}
module.exports = { AgentOrchestrator };
