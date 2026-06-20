const path = require('path');
const fs = require('fs');
const { safeYAMLParse, safeJSONParse, listFiles, readFile } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
class AgentLoader {
  constructor(agentsDir) { this.agentsDir = agentsDir; this.log = defaultLogger.child('loader'); }
  async loadAll() {
    const agents = [];
    if (!fs.existsSync(this.agentsDir)) { this.log.warn(`Dir not found: ${this.agentsDir}`); return agents; }
    const files = [...await listFiles(this.agentsDir, '.yaml').catch(() => []), ...await listFiles(this.agentsDir, '.yml').catch(() => []), ...await listFiles(this.agentsDir, '.json').catch(() => [])];
    this.log.debug(`Found ${files.length} files`);
    for (const file of files) { try { const a = await this.loadFile(file); if (a) agents.push(a); } catch (err) { this.log.error(`Failed ${path.basename(file)}: ${err.message}`); } }
    this.log.info(`Loaded ${agents.length}/${files.length} agents`);
    return agents;
  }
  async loadFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const raw = await readFile(filePath);
    let result;
    if (ext === '.yaml' || ext === '.yml') result = safeYAMLParse(raw);
    else if (ext === '.json') result = safeJSONParse(raw);
    else return null;
    if (result.error) { this.log.error(`Parse error: ${result.error}`); return null; }
    const agent = result.data; agent._sourceFile = filePath; agent._sourceFormat = ext.slice(1);
    return agent;
  }
}
module.exports = { AgentLoader };
