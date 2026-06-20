const os = require('os');
const path = require('path');
const { ensureDir, readFile, writeFile, deepMerge } = require('./helpers');
const CONFIG_DIR = path.join(os.homedir(), '.fangcode');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yaml');
const DEFAULT_CONFIG = {
  version: '1.0.0', log_level: 'info',
  agents_dir: path.resolve(__dirname, '../../agents'),
  templates_dir: path.resolve(__dirname, '../../templates'),
  marketplace: { registry_url: 'https://registry.fangcode.dev' },
  mcp: { enabled: true, servers: {} },
  routing: { auto_route: true, fallback_agent: 'full-stack-developer' },
  multiagent: { max_concurrent: 8, timeout_ms: 300000, protocol: 'async' },
  plugins: { enabled: true, dir: path.join(CONFIG_DIR, 'plugins') },
};
class Config {
  constructor() { this._config = null; this._path = CONFIG_FILE; }
  async load() {
    try {
      await ensureDir(CONFIG_DIR);
      const raw = await readFile(this._path).catch(() => null);
      this._config = raw ? deepMerge(DEFAULT_CONFIG, require('yaml').parse(raw) || {}) : { ...DEFAULT_CONFIG };
      if (!raw) await this.save();
    } catch { this._config = { ...DEFAULT_CONFIG }; }
    return this._config;
  }
  async save() { await ensureDir(CONFIG_DIR); await writeFile(this._path, require('yaml').stringify(this._config)); }
  get(key) { if (!this._config) throw new Error('Config not loaded'); return key.split('.').reduce((o, k) => o?.[k], this._config); }
  async set(key, value) {
    if (!this._config) await this.load();
    const keys = key.split('.'); let obj = this._config;
    for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
    obj[keys[keys.length - 1]] = value; await this.save();
  }
  getAll() { return this._config || { ...DEFAULT_CONFIG }; }
  defaults() { return DEFAULT_CONFIG; }
}
const config = new Config();
module.exports = { Config, config, DEFAULT_CONFIG };
