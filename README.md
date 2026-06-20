<div align="center">

# FangCode

**Agent-first, MCP-native multi-agent framework for MiMoCode.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MiMoCode](https://img.shields.io/badge/MiMoCode-Compatible-blue.svg)](https://mimocode.dev)
[![MCP](https://img.shields.io/badge/MCP-Native-orange.svg)](https://modelcontextprotocol.io)

</div>

---

FangCode enables a single developer to perform the work of an entire engineering team. It provides 31 specialized agents, multi-agent orchestration with team-based execution, consensus voting, and seamless MiMoCode integration through slash commands.

---

## Installation

### Quick Start

```bash
git clone https://github.com/aydocs/FangCode.git
cd FangCode
npm install
node bin/fc.js agents
```

### Global Install

```bash
npm install -g .
fc agents
```

### MiMoCode Integration

Copy the skills to your MiMoCode config directory:

```bash
# Windows
copy skills\* %USERPROFILE%\.config\mimocode\skills\

# macOS / Linux
cp -r skills/* ~/.config/mimocode/skills/
```

Then add FangCode to `~/.config/mimocode/mimocode.json`:

```json
{
  "skills": {
    "fangcode": "C:\\path\\to\\FangCode"
  }
}
```

Restart MiMoCode. All skills load automatically.

---

## Features

### 13 Core Modules

| Module | Purpose |
|--------|---------|
| Agent Registry | Store, index, and query agents by category, tag, or full-text search |
| Agent Manager | Install, remove, update, run, export, and import agents |
| Agent Loader | Parse YAML and JSON agent definitions with error handling |
| Agent Marketplace | Discover, rate, and track agent downloads |
| Agent Templates | Generate new agents from predefined templates |
| Agent Discovery | Scan local directories, remote registries, and MCP servers |
| Agent Profiles | Persist user preferences, favorites, and usage history |
| Agent Routing | Match requests to the most suitable agent using keyword and skill analysis |
| Agent Orchestration | Chain, parallel, fan-out, and fan-in execution patterns |
| Agent Workflows | Define and execute DAG-based multi-step pipelines |
| MCP Integration | Connect to MCP servers, invoke tools, and manage resources |
| Multi-Agent System | Create teams, send messages, and reach consensus through voting |
| Custom Commands | 14 slash commands for direct MiMoCode integration |

### 14 Slash Commands

| Command | Description |
|---------|-------------|
| `/agents` | List all registered agents |
| `/list-agents` | List agents with detailed information |
| `/install-agent` | Install an agent from a file or URL |
| `/remove-agent` | Remove an installed agent |
| `/update-agent` | Update an agent to its latest version |
| `/run-agent` | Execute an agent with a given task |
| `/search-agent` | Search agents by keyword |
| `/export-agent` | Export an agent definition to a file |
| `/import-agent` | Import an agent from a file |
| `/team-create` | Create a multi-agent team |
| `/team-execute` | Execute a task using a team of agents |
| `/team-list` | List all active teams |
| `/team-agents` | List agents participating in multi-agent workflows |
| `/consensus` | Request a team vote on a proposal |

---

## 31 Agents

### Web and Frontend

| Agent | Category | Expertise |
|-------|----------|-----------|
| `web-developer` | web | HTML, CSS, JavaScript, TypeScript, responsive design, accessibility, SEO |
| `frontend-developer` | frontend | React, Vue, Angular, Svelte, component architecture, state management |
| `full-stack-developer` | fullstack | Frontend, backend, databases, DevOps, testing, authentication |

### Backend and API

| Agent | Category | Expertise |
|-------|----------|-----------|
| `backend-developer` | backend | REST, GraphQL, gRPC, databases, authentication, microservices, caching |
| `database-engineer` | database | PostgreSQL, MySQL, MongoDB, Redis, data modeling, query optimization |
| `architect` | fullstack | System design, DDD, CQRS, event-driven architecture, scalability |

### Mobile

| Agent | Category | Expertise |
|-------|----------|-----------|
| `mobile-developer` | mobile | Flutter, React Native, Swift, Kotlin, Dart, mobile architecture |
| `flutter-developer` | mobile | Flutter, Dart, widgets, state management, animations, platform channels |
| `android-developer` | mobile | Kotlin, Jetpack Compose, Android architecture, Gradle, Room, Coroutines |
| `ios-developer` | mobile | Swift, SwiftUI, UIKit, Combine, Core Data, Xcode |

### DevOps and Cloud

| Agent | Category | Expertise |
|-------|----------|-----------|
| `devops-engineer` | devops | Docker, Kubernetes, Terraform, Ansible, CI/CD, monitoring, GitHub Actions |
| `cloud-architect` | cloud | AWS, GCP, Azure, serverless, microservices, IAM, networking |
| `kubernetes-engineer` | devops | Kubernetes, Helm, Kustomize, Istio, container security, RBAC, observability |

### Security

| Agent | Category | Expertise |
|-------|----------|-----------|
| `security-auditor` | security | OWASP, SAST, DAST, dependency scanning, compliance |
| `secure-code-reviewer` | security | Code review, static analysis, secure coding, cryptography |
| `threat-modeler` | security | STRIDE, PASTA, attack trees, risk analysis, MITRE ATT&CK |
| `soc-analyst` | security | SIEM, Sigma rules, threat hunting, forensics |
| `incident-responder` | security | Incident response, digital forensics, breach management |
| `malware-analyst` | security | Malware analysis, YARA rules, threat intelligence |
| `reverse-engineer` | security | Binary analysis, Ghidra, IDA, x86, ARM, RISC-V |

### Artificial Intelligence

| Agent | Category | Expertise |
|-------|----------|-----------|
| `ai-engineer` | ai | PyTorch, TensorFlow, MLOps, model deployment, NLP |
| `prompt-engineer` | ai | Prompt engineering, chain-of-thought, few-shot learning, LLM optimization |
| `agent-builder` | ai | Agent design, tool use, memory systems, multi-agent orchestration |
| `mcp-engineer` | ai | MCP server development, tool schemas, JSON-RPC, transports |

### Programming Languages

| Agent | Category | Expertise |
|-------|----------|-----------|
| `rust-developer` | language | Ownership, lifetimes, async Rust, Cargo, WASM |
| `go-developer` | language | Goroutines, channels, interfaces, Cobra, gRPC |
| `python-developer` | language | Django, Flask, FastAPI, type hints, asyncio, packaging |
| `nodejs-developer` | language | Express, Fastify, NestJS, TypeScript, streams |

### Leadership

| Agent | Category | Expertise |
|-------|----------|-----------|
| `linux-engineer` | linux | Shell scripting, systemd, networking, security hardening |
| `startup-cto` | leadership | Architecture, team building, technical debt, hiring, agile |

---

## Multi-Agent System

FangCode includes a full multi-agent system with team-based execution.

### Create a Team

```javascript
const { FangCode } = require('./src');
const fc = new FangCode();
await fc.init();

fc.multiagent.createTeam('backend-team', [
  'go-developer',
  'python-developer',
  'database-engineer'
], { strategy: 'parallel' });

const results = await fc.multiagent.teamExecute('backend-team', 'Build a microservice API');
```

### Four Strategies

| Strategy | Description |
|----------|-------------|
| `sequential` | Agents execute one after another, passing context between steps |
| `parallel` | All agents execute simultaneously for maximum throughput |
| `leader-follower` | A designated leader makes decisions; followers implement |
| `debate` | Agents argue different perspectives; the leader synthesizes a final answer |

### Consensus Voting

```javascript
const consensus = await fc.multiagent.requestConsensus('backend-team',
  'Should we use PostgreSQL instead of MongoDB?'
);
console.log(consensus.approved ? 'APPROVED' : 'REJECTED');
```

---

## Programmatic API

```javascript
const { FangCode } = require('./src');

const fc = new FangCode();
await fc.init();

// List agents by category
const securityAgents = fc.manager.list({ category: 'security' });

// Search agents
const pythonAgents = fc.manager.search('python');

// Run an agent
const config = await fc.manager.run('devops-engineer', {
  task: 'Set up monitoring for production'
});

// Route a request to the best agent
const match = fc.route('I need help with a React dashboard');

// Execute a workflow
await fc.executeWorkflow({
  name: 'fullstack-build',
  steps: [
    { id: 'design', agent: 'architect', task: 'System design' },
    { id: 'frontend', agent: 'frontend-developer', task: 'Build UI', depends_on: ['design'] },
    { id: 'backend', agent: 'backend-developer', task: 'Build API', depends_on: ['design'] },
    { id: 'deploy', agent: 'devops-engineer', task: 'Deploy', depends_on: ['frontend', 'backend'] },
  ]
});
```

---

## Design Skills

FangCode ships with production-grade design skills from leading open-source projects.

| Skill | Source | Description |
|-------|--------|-------------|
| `taste-skill` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Anti-slop frontend framework with adjustable design dials |
| `taste-soft` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | High-end agency design with double-bezel architecture |
| `taste-minimalist` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Editorial minimalist UI with warm monochrome palette |
| `emil-design-eng` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Animation philosophy and UI polish principles |
| `review-animations` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | Motion code review against a strict craft bar |

---

## Project Structure

```
fangcode/
├── agents/                  # 31 agent definitions (YAML)
├── bin/
│   └── fc.js               # CLI entry point
├── src/
│   ├── index.js             # Main framework export
│   ├── registry/            # Agent storage and indexing
│   ├── manager/             # Install, remove, run, export, import
│   ├── loader/              # YAML/JSON parsing
│   ├── marketplace/         # Discovery, ratings, downloads
│   ├── templates/           # Agent creation templates
│   ├── discovery/           # Local, remote, and MCP scanning
│   ├── profiles/            # User preferences and history
│   ├── routing/             # Request-to-agent matching
│   ├── orchestration/       # Chain, parallel, fan-out, fan-in
│   ├── workflows/           # DAG-based pipeline engine
│   ├── mcp/                 # MCP server connections
│   ├── multiagent/          # Teams, messaging, consensus
│   ├── commands/            # 14 slash commands
│   └── schemas/             # YAML and JSON agent schemas
├── skills/                  # Design engineering skills
├── templates/               # Agent creation templates
├── docs/
├── examples/
└── tests/
```

---

## Configuration

FangCode stores its configuration at `~/.fangcode/config.yaml`:

```yaml
version: "1.0.0"
log_level: info
agents_dir: ./agents

mcp:
  enabled: true
  servers: {}

routing:
  auto_route: true
  fallback_agent: full-stack-developer

multiagent:
  max_concurrent: 8
  timeout_ms: 300000
  protocol: async
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

To add a new agent, place a YAML file in the `agents/` directory following the schema in `src/schemas/agent-schema.yaml`.

To add a new skill, create a `SKILL.md` file in the `skills/` directory following the MiMoCode skill format.

---

## License

MIT © [FangCode Community](https://github.com/aydocs/FangCode)
