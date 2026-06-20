const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function slugify(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object') out[key] = deepMerge(target[key], source[key]);
    else out[key] = source[key];
  }
  return out;
}
async function ensureDir(p) { await fs.promises.mkdir(p, { recursive: true }); }
async function readFile(p) { return fs.promises.readFile(p, 'utf-8'); }
async function writeFile(p, c) { await ensureDir(path.dirname(p)); return fs.promises.writeFile(p, c, 'utf-8'); }
function fileExists(p) { return fs.promises.access(p, fs.constants.F_OK).then(() => true).catch(() => false); }
function listFiles(dir, ext) { return fs.promises.readdir(dir).then(files => files.filter(f => !ext || f.endsWith(ext)).map(f => path.join(dir, f))); }
function safeYAMLParse(text) { try { return { data: require('yaml').parse(text), error: null }; } catch (e) { return { data: null, error: e.message }; } }
function safeJSONParse(text) { try { return { data: JSON.parse(text), error: null }; } catch (e) { return { data: null, error: e.message }; } }
function generateId() { return crypto.randomUUID().slice(0, 12); }
module.exports = { slugify, deepMerge, ensureDir, readFile, writeFile, fileExists, listFiles, safeYAMLParse, safeJSONParse, generateId };
