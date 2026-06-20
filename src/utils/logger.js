const chalk = require('chalk');
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
class Logger {
  constructor(name = 'fc', level = 'info') { this.name = name; this.level = LEVELS[level] ?? LEVELS.info; }
  _ts() { return new Date().toISOString().slice(11, 23); }
  _log(level, msg, ...args) {
    if (LEVELS[level] < this.level) return;
    const tag = { debug: chalk.gray, info: chalk.cyan, warn: chalk.yellow, error: chalk.red }[level];
    console.log(`${chalk.gray(this._ts())} ${tag(`[${level.toUpperCase()}]`)} ${chalk.magenta(`[${this.name}]`)} ${msg}`, ...args);
  }
  debug(m, ...a) { this._log('debug', m, ...a); }
  info(m, ...a) { this._log('info', m, ...a); }
  warn(m, ...a) { this._log('warn', m, ...a); }
  error(m, ...a) { this._log('error', m, ...a); }
  child(name) { return new Logger(`${this.name}:${name}`, Object.keys(LEVELS)[this.level]); }
}
const defaultLogger = new Logger('fc', process.env.FC_LOG_LEVEL || 'info');
module.exports = { Logger, defaultLogger };
