const { generateId } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
class AgentMessage {
  constructor(from, to, type, payload) { this.id = generateId(); this.from = from; this.to = to; this.type = type; this.payload = payload; this.timestamp = new Date().toISOString(); this.status = 'pending'; }
}
class MessageBus {
  constructor() { this._channels = new Map(); this._inbox = new Map(); this.log = defaultLogger.child('messagebus'); }
  subscribe(slug, handler) { this._inbox.set(slug, this._inbox.get(slug) || []); this._channels.set(slug, handler); }
  unsubscribe(slug) { this._channels.delete(slug); this._inbox.delete(slug); }
  async publish(msg) {
    const h = this._channels.get(msg.to);
    if (h) { msg.status = 'delivered'; try { await h(msg); } catch (e) { msg.status = 'failed'; msg.error = e.message; } }
    else { if (!this._inbox.has(msg.to)) this._inbox.set(msg.to, []); this._inbox.get(msg.to).push(msg); msg.status = 'queued'; }
    return msg;
  }
  async flush(slug) { const msgs = this._inbox.get(slug) || []; this._inbox.delete(slug); const h = this._channels.get(slug); if (h) for (const m of msgs) { try { await h(m); m.status = 'delivered'; } catch { m.status = 'failed'; } } return msgs; }
  getPending(slug) { return this._inbox.get(slug) || []; }
}
class MultiAgentSystem {
  constructor(orch) {
    this.orch = orch; this.bus = new MessageBus(); this.log = defaultLogger.child('multiagent');
    this._agents = new Map(); this._teams = new Map();
  }
  registerAgent(slug, cfg = {}) {
    this._agents.set(slug, { slug, role: cfg.role || 'worker', capabilities: cfg.capabilities || [], state: 'idle', registeredAt: new Date().toISOString() });
    this.bus.subscribe(slug, async msg => { this.log.debug(`[${slug}] ${msg.type} from ${msg.from}`); });
    this.log.debug(`Registered: ${slug}`); return slug;
  }
  unregisterAgent(slug) { this._agents.delete(slug); this.bus.unsubscribe(slug); }
  createTeam(name, slugs, cfg = {}) {
    const team = { name, agents: slugs, leader: cfg.leader || slugs[0], strategy: cfg.strategy || 'sequential', createdAt: new Date().toISOString() };
    this._teams.set(name, team); this.log.info(`Team: ${name} (${slugs.length} agents)`); return name;
  }
  async send(from, to, type, payload) { return this.bus.publish(new AgentMessage(from, to, type, payload)); }
  async broadcast(from, type, payload) { const r = []; for (const [slug] of this._agents) { if (slug !== from) r.push(await this.send(from, slug, type, payload)); } return r; }
  async teamExecute(teamName, task) {
    const team = this._teams.get(teamName); if (!team) throw new Error(`Team not found: ${teamName}`);
    this.log.info(`Team executing: ${teamName}`);
    const strategies = { sequential: this._seq.bind(this), parallel: this._par.bind(this), 'leader-follower': this._lf.bind(this), debate: this._debate.bind(this) };
    return (strategies[team.strategy] || strategies.sequential)(team, task);
  }
  async _seq(team, task) { const r = []; let ctx = { task }; for (const s of team.agents) { this._setState(s, 'working'); try { const res = await this.orch.delegate(s, task, ctx); r.push({ agent: s, result: res, status: 'success' }); ctx = { ...ctx, [`result_${s}`]: res }; } catch (e) { r.push({ agent: s, error: e.message, status: 'failed' }); } this._setState(s, 'idle'); } return r; }
  async _par(team, task) { return Promise.all(team.agents.map(async s => { this._setState(s, 'working'); try { const res = await this.orch.delegate(s, task); this._setState(s, 'idle'); return { agent: s, result: res, status: 'success' }; } catch (e) { this._setState(s, 'idle'); return { agent: s, error: e.message, status: 'failed' }; } })); }
  async _lf(team, task) {
    this._setState(team.leader, 'working');
    const lr = await this.orch.delegate(team.leader, task); this._setState(team.leader, 'idle');
    const r = [{ agent: team.leader, result: lr, status: 'success', role: 'leader' }];
    for (const s of team.agents.filter(a => a !== team.leader)) {
      this._setState(s, 'working');
      try { const res = await this.orch.delegate(s, task, { leaderResult: lr }); r.push({ agent: s, result: res, status: 'success', role: 'follower' }); }
      catch (e) { r.push({ agent: s, error: e.message, status: 'failed', role: 'follower' }); }
      this._setState(s, 'idle');
    }
    return r;
  }
  async _debate(team, task) {
    const rounds = []; let ctx = { task };
    for (let round = 0; round < 3; round++) {
      const rr = [];
      for (const s of team.agents) { this._setState(s, 'debating');
        try { const res = await this.orch.delegate(s, task, { ...ctx, round, prevArgs: rounds }); rr.push({ agent: s, argument: res, round }); await this.send(s, team.leader, 'argument', res); } catch {}
        this._setState(s, 'idle');
      }
      rounds.push(rr); ctx = { ...ctx, debateRounds: rounds };
    }
    this._setState(team.leader, 'synthesizing');
    const fr = await this.orch.delegate(team.leader, task, { ...ctx, finalSynthesis: true });
    this._setState(team.leader, 'idle');
    return { debateRounds: rounds, finalResult: fr, consensus: true };
  }
  async requestConsensus(teamName, proposal) {
    const team = this._teams.get(teamName); if (!team) throw new Error(`Team not found: ${teamName}`);
    const votes = [];
    for (const s of team.agents) {
      this._setState(s, 'voting');
      try { const v = await this.orch.delegate(s, `Vote: ${proposal}`, { proposal, voteRequest: true }); votes.push({ agent: s, vote: v, status: 'voted' }); }
      catch { votes.push({ agent: s, vote: 'abstain', status: 'failed' }); }
      this._setState(s, 'idle');
    }
    return { proposal, votes, approved: votes.length > 0, totalVotes: votes.length };
  }
  _setState(slug, state) { const a = this._agents.get(slug); if (a) a.state = state; }
  getAgentState(slug) { return this._agents.get(slug) || null; }
  listAgents() { return Array.from(this._agents.values()); }
  listTeams() { return Array.from(this._teams.values()); }
  getTeam(name) { return this._teams.get(name) || null; }
}
module.exports = { MultiAgentSystem, MessageBus, AgentMessage };
