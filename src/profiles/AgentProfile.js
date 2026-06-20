const path = require('path');
const os = require('os');
const { ensureDir, readFile, writeFile } = require('../utils/helpers');
const { defaultLogger } = require('../utils/logger');
const PROFILES_DIR = path.join(os.homedir(), '.fangcode', 'profiles');
const DEFAULT_PROFILE = { favorites: [], recent: [], history: [], preferences: { theme: 'default', auto_route: true } };
class AgentProfile {
  constructor() { this.log = defaultLogger.child('profile'); this._profile = null; }
  async load() { const pp = path.join(PROFILES_DIR, 'default.yaml'); try { this._profile = require('yaml').parse(await readFile(pp)) || { ...DEFAULT_PROFILE }; } catch { this._profile = { ...DEFAULT_PROFILE }; await this.save(); } return this._profile; }
  async save() { await ensureDir(PROFILES_DIR); await writeFile(path.join(PROFILES_DIR, 'default.yaml'), require('yaml').stringify(this._profile)); }
  async get() { if (!this._profile) await this.load(); return this._profile; }
  async set(key, value) { if (!this._profile) await this.load(); const keys = key.split('.'); let obj = this._profile; for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; } obj[keys[keys.length - 1]] = value; await this.save(); }
  async addFavorite(slug) { if (!this._profile) await this.load(); if (!this._profile.favorites.includes(slug)) { this._profile.favorites.push(slug); await this.save(); } return this._profile.favorites; }
  async removeFavorite(slug) { if (!this._profile) await this.load(); this._profile.favorites = this._profile.favorites.filter(s => s !== slug); await this.save(); return this._profile.favorites; }
  async addRecent(slug) { if (!this._profile) await this.load(); this._profile.recent = this._profile.recent.filter(r => r.slug !== slug); this._profile.recent.unshift({ slug, usedAt: new Date().toISOString() }); if (this._profile.recent.length > 20) this._profile.recent = this._profile.recent.slice(0, 20); await this.save(); }
  async recent(limit = 10) { if (!this._profile) await this.load(); return this._profile.recent.slice(0, limit); }
}
module.exports = { AgentProfile };
