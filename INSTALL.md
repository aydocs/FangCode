# FangCode Installation Guide

This guide covers installing FangCode and integrating it with MiMoCode.

---

## Prerequisites

- Node.js 18.0 or later
- npm (included with Node.js)
- Git
- MiMoCode (for slash command integration)

---

## Installation

### Option 1: Clone from GitHub

```bash
git clone https://github.com/aydocs/FangCode.git
cd FangCode
npm install
```

Verify the installation:

```bash
node bin/fc.js agents
```

You should see a table listing all 31 agents.

### Option 2: Global Install

```bash
git clone https://github.com/aydocs/FangCode.git
cd FangCode
npm install -g .
fc agents
```

After global install, the `fc` command is available from any directory.

---

## MiMoCode Integration

### Step 1: Copy Skills

Copy the FangCode skills to your MiMoCode configuration directory:

**Windows:**

```cmd
xcopy /E /I skills %USERPROFILE%\.config\mimocode\skills
```

**macOS / Linux:**

```bash
cp -r skills/* ~/.config/mimocode/skills/
```

This copies the following skills:

- `fangcode.md` — Multi-agent orchestration and 31 specialized agents
- `taste-skill.md` — Anti-slop frontend framework (47.6k GitHub stars)
- `taste-soft.md` — High-end agency design patterns
- `taste-minimalist.md` — Editorial minimalist UI
- `emil-design-eng.md` — Animation philosophy and UI polish
- `review-animations.md` — Motion code review standards

### Step 2: Update MiMoCode Configuration

Open `~/.config/mimocode/mimocode.json` and add FangCode to the skills section:

```json
{
  "skills": {
    "fangcode": "C:\\Users\\yourname\\Desktop\\fangcode",
    "taste-skill": "C:\\Users\\yourname\\Desktop\\fangcode\\skills\\taste-skill",
    "taste-soft": "C:\\Users\\yourname\\Desktop\\fangcode\\skills\\taste-soft",
    "taste-minimalist": "C:\\Users\\yourname\\Desktop\\fangcode\\skills\\taste-minimalist",
    "emil-design-eng": "C:\\Users\\yourname\\Desktop\\fangcode\\skills\\emil-design-eng",
    "review-animations": "C:\\Users\\yourname\\Desktop\\fangcode\\skills\\review-animations"
  }
}
```

Replace `C:\\Users\\yourname\\Desktop\\fangcode` with the actual path to your FangCode installation.

### Step 3: Restart MiMoCode

Close and reopen MiMoCode. All skills are now available.

---

## Usage

### CLI Commands

```bash
# List all agents
fc agents

# Search for agents
fc search "security"

# Run a specific agent
fc run devops-engineer

# Route a request to the best agent
fc route "build a REST API with authentication"

# Create a team
fc team-create fullstack "architect,frontend-developer,backend-developer,devops-engineer"

# Execute with a team
fc team-execute fullstack "Build an e-commerce MVP"

# List all teams
fc team-list

# Request consensus
fc consensus fullstack "Should we use PostgreSQL?"
```

### Slash Commands in MiMoCode

Once integrated, use these commands directly in MiMoCode:

```
/fangcode agents
/fangcode search "python"
/fangcode run web-developer
/fangcode team-create backend "go-developer,python-developer"
/fangcode team-execute backend "Build user authentication API"
/fangcode consensus backend "Use Redis for caching?"
```

---

## Agent Categories

| Category | Agents | Use Case |
|----------|--------|----------|
| Web | `web-developer`, `frontend-developer`, `full-stack-developer` | Web applications and interfaces |
| Backend | `backend-developer`, `database-engineer`, `architect` | APIs, databases, system design |
| Mobile | `mobile-developer`, `flutter-developer`, `android-developer`, `ios-developer` | Mobile applications |
| DevOps | `devops-engineer`, `cloud-architect`, `kubernetes-engineer` | Infrastructure and deployment |
| Security | 7 agents covering auditing, code review, threat modeling, SOC, incident response, malware analysis, reverse engineering | Security operations |
| AI | `ai-engineer`, `prompt-engineer`, `agent-builder`, `mcp-engineer` | Machine learning and AI systems |
| Languages | `rust-developer`, `go-developer`, `python-developer`, `nodejs-developer` | Language-specific expertise |
| Leadership | `linux-engineer`, `startup-cto` | Operations and strategy |

---

## Multi-Agent Strategies

| Strategy | When to Use |
|----------|-------------|
| `sequential` | Tasks with dependencies where context must pass between agents |
| `parallel` | Independent tasks that can run simultaneously for speed |
| `leader-follower` | Scenarios requiring a clear decision-maker and implementers |
| `debate` | Complex decisions where multiple expert perspectives are valuable |

---

## Troubleshooting

### Skills not loading

Verify the skills directory contains the expected files:

```bash
ls ~/.config/mimocode/skills/
```

You should see `fangcode.md`, `taste-skill.md`, and other skill files.

### CLI command not found

If using global install, ensure npm global bin is in your PATH:

```bash
npm config get prefix
```

Add the resulting path's `bin` directory to your PATH environment variable.

### Tests failing

Run the test suite to verify everything works:

```bash
cd FangCode
npm test
```

All 10 tests should pass.

---

## Updating

```bash
cd FangCode
git pull origin main
npm install

# Re-copy skills to MiMoCode
xcopy /E /I /Y skills %USERPROFILE%\.config\mimocode\skills
```

Restart MiMoCode to load the updated skills.

---

## Uninstalling

```bash
# Remove FangCode
rm -rf FangCode

# Remove global install
npm uninstall -g fangcode

# Remove MiMoCode integration
rm ~/.config/mimocode/skills/fangcode.md
rm ~/.config/mimocode/skills/taste-*.md
rm ~/.config/mimocode/skills/emil-*.md
rm ~/.config/mimocode/skills/review-animations.md
```

Then remove the `fangcode` entry from `~/.config/mimocode/mimocode.json`.

---

## Resources

- [FangCode GitHub](https://github.com/aydocs/FangCode)
- [MiMoCode](https://mimocode.dev)
- [MCP Protocol](https://modelcontextprotocol.io)
- [taste-skill](https://github.com/Leonxlnx/taste-skill)
- [emilkowalski/skills](https://github.com/emilkowalski/skills)
