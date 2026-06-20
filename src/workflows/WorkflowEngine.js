const { generateId } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
function slugify(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
class WorkflowEngine {
  constructor(orch) { this.orch = orch; this.log = defaultLogger.child('workflow'); this._wf = new Map(); this._runs = new Map(); }
  define(wf) { const id = wf.id || slugify(wf.name); const e = this.validate(wf); if (e.length) throw new Error(e.join('; ')); this._wf.set(id, { ...wf, id, createdAt: new Date().toISOString() }); return id; }
  async run(id, ctx = {}) {
    const wf = this._wf.get(id); if (!wf) throw new Error(`Not found: ${id}`);
    const rid = generateId(); const run = { id: rid, workflowId: id, status: 'running', steps: [], startedAt: new Date().toISOString(), ctx }; this._runs.set(rid, run);
    for (const step of this._resolveOrder(wf.steps)) {
      try { const deps = (step.depends_on || []).map(d => run.steps.find(s => s.id === d)).filter(Boolean).map(s => s.result); const result = await this.orch.delegate(step.agent, step.task, { ...ctx, deps, stepId: step.id }); run.steps.push({ id: step.id, agent: step.agent, result, status: 'success' }); }
      catch (err) { run.steps.push({ id: step.id, agent: step.agent, error: err.message, status: 'failed' }); if (step.required !== false) { run.status = 'failed'; run.error = err.message; run.completedAt = new Date().toISOString(); return run; } }
    }
    run.status = 'completed'; run.completedAt = new Date().toISOString(); return run;
  }
  getStepResult(rid, sid) { return this._runs.get(rid)?.steps.find(s => s.id === sid) || null; }
  listWorkflows() { return Array.from(this._wf.values()); }
  listRuns(wid) { return Array.from(this._runs.values()).filter(r => !wid || r.workflowId === wid); }
  validate(wf) { const e = []; if (!wf.name) e.push('Missing name'); if (!wf.steps?.length) { e.push('Steps required'); return e; } const ids = new Set(); for (const s of wf.steps) { if (!s.id) e.push('Step missing id'); else if (ids.has(s.id)) e.push(`Duplicate: ${s.id}`); else ids.add(s.id); if (!s.agent) e.push(`'${s.id}' missing agent`); if (!s.task) e.push(`'${s.id}' missing task`); } return e; }
  _resolveOrder(steps) { const v = new Set(); const r = []; const m = new Map(steps.map(s => [s.id, s])); function visit(id) { if (v.has(id)) return; v.add(id); const s = m.get(id); if (!s) return; for (const d of s.depends_on || []) visit(d); r.push(s); } for (const s of steps) visit(s.id); return r; }
}
module.exports = { WorkflowEngine };
