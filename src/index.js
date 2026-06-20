const { AgentManager } = require('./manager');
const { AgentRegistry } = require('./registry');
const { AgentLoader } = require('./loader');
const { AgentMarketplace } = require('./marketplace');
const { AgentTemplate } = require('./templates');
const { AgentDiscovery } = require('./discovery');
const { AgentProfile } = require('./profiles');
const { AgentRouter } = require('./routing');
const { AgentOrchestrator } = require('./orchestration');
const { WorkflowEngine } = require('./workflows');
const { MCPIntegration } = require('./mcp');
const { CommandRegistry } = require('./commands');
const { MultiAgentSystem } = require('./multiagent');
const { config } = require('./utils/config');
const { defaultLogger, Logger } = require('./utils/logger');
class FangCode {
  constructor(agentsDir) {
    this.agentsDir = agentsDir; this.manager = null;
    this.marketplace = new AgentMarketplace(); this.template = new AgentTemplate();
    this.discovery = new AgentDiscovery(); this.profile = new AgentProfile();
    this.mcp = new MCPIntegration(); this.router = null; this.orchestrator = null;
    this.workflowEngine = null; this.multiagent = null; this.commands = null;
    this.log = defaultLogger.child('fangcode');
  }
  async init() {
    await config.load();
    const dir = this.agentsDir || config.get('agents_dir');
    this.manager = new AgentManager(dir); await this.manager.init();
    this.router = new AgentRouter(this.manager.registry);
    this.orchestrator = new AgentOrchestrator(this.manager);
    this.workflowEngine = new WorkflowEngine(this.orchestrator);
    this.multiagent = new MultiAgentSystem(this.orchestrator);
    this.commands = new CommandRegistry(this.manager, this.multiagent);
    await this.profile.load();
    this.log.info('FangCode initialized');
    return this;
  }
  async route(request, ctx) { return this.router.route(request, ctx); }
  async executeWorkflow(wf) { return this.workflowEngine.run(wf); }
  async command(name, args) { return this.commands.execute(name, args); }
  status() {
    return { agents: this.manager?.count() || 0, mcp: this.mcp.getStatus(), workflows: this.workflowEngine?.listWorkflows().length || 0, commands: this.commands?.list().length || 0, multiAgent: this.multiagent ? { agents: this.multiagent.listAgents().length, teams: this.multiagent.listTeams().length } : null };
  }
}
module.exports = { FangCode, AgentManager, AgentRegistry, AgentLoader, AgentMarketplace, AgentTemplate, AgentDiscovery, AgentProfile, AgentRouter, AgentOrchestrator, WorkflowEngine, MCPIntegration, CommandRegistry, MultiAgentSystem, config, Logger };
