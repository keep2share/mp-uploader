/* eslint no-underscore-dangle: 0 */
import os from 'os'
import path from 'path'
import { Config } from '@oclif/config'
import PrePlugin from './plugin'

function channelFromVersion(version) {
  const m = version.match(/[^-]+(?:-([^.]+))?/);
  return (m && m[1]) || 'stable';
}

class PreConfig extends Config {
  async load(opts) {
    const plugin = new PrePlugin({
      root: this.options.root,
      commands: opts.commands
    });
    await plugin.load();
    this.plugins.push(plugin);
    this.root = plugin.root;
    this.pjson = plugin.pjson;
    this.name = this.pjson.name;
    this.version = this.options.version || this.pjson.version || '0.0.0';
    this.channel = this.options.channel || channelFromVersion(this.version);
    this.valid = plugin.valid;
    this.arch = (os.arch() === 'ia32' ? 'x86' : os.arch());
    this.platform = os.platform();
    this.windows = this.platform === 'win32';
    this.bin = this.pjson.oclif.bin || this.name;
    this.dirname = this.pjson.oclif.dirname || this.name;
    if (this.platform === 'win32')
      this.dirname = this.dirname.replace('/', '\\');
    this.userAgent = `${this.name}/${this.version} ${this.platform}-${this.arch} node-${process.version}`;
    this.shell = this._shell();
    this.debug = this._debug();
    this.home = process.env.HOME || (this.windows && this.windowsHome()) || os.homedir() || os.tmpdir();
    this.cacheDir = this.scopedEnvVar('CACHE_DIR') || this.macosCacheDir() || this.dir('cache');
    this.configDir = this.scopedEnvVar('CONFIG_DIR') || this.dir('config');
    this.dataDir = this.scopedEnvVar('DATA_DIR') || this.dir('data');
    this.errlog = path.join(this.cacheDir, 'error.log');
    this.binPath = this.scopedEnvVar('BINPATH');
    this.npmRegistry = this.scopedEnvVar('NPM_REGISTRY') || this.pjson.oclif.npmRegistry;
    this.pjson.oclif.update = this.pjson.oclif.update || {};
    this.pjson.oclif.update.node = this.pjson.oclif.update.node || {};

    this.pjson.oclif.plugins = opts.corePlugins;
    const s3 = this.pjson.oclif.update.s3 = this.pjson.oclif.update.s3 || {};
    s3.bucket = this.scopedEnvVar('S3_BUCKET') || s3.bucket;
    if (s3.bucket && !s3.host)
      s3.host = `https://${s3.bucket}.s3.amazonaws.com`;
    s3.templates = { ...s3.templates, target: {baseDir: '<%- bin %>', unversioned: "<%- channel === 'stable' ? '' : 'channels/' + channel + '/' %><%- bin %>-<%- platform %>-<%- arch %><%- ext %>", versioned: "<%- channel === 'stable' ? '' : 'channels/' + channel + '/' %><%- bin %>-v<%- version %>/<%- bin %>-v<%- version %>-<%- platform %>-<%- arch %><%- ext %>", manifest: "<%- channel === 'stable' ? '' : 'channels/' + channel + '/' %><%- platform %>-<%- arch %>", ...s3.templates && s3.templates.target}, vanilla: {unversioned: "<%- channel === 'stable' ? '' : 'channels/' + channel + '/' %><%- bin %><%- ext %>", versioned: "<%- channel === 'stable' ? '' : 'channels/' + channel + '/' %><%- bin %>-v<%- version %>/<%- bin %>-v<%- version %><%- ext %>", baseDir: '<%- bin %>', manifest: "<%- channel === 'stable' ? '' : 'channels/' + channel + '/' %>version", ...s3.templates && s3.templates.vanilla}};
    await this.loadUserPlugins();
    await this.loadDevPlugins();
    await this.loadCorePlugins();
  }
}

function isConfig(o) {
  return o && !!o._base;
}

async function load(opts) {
  if (isConfig(opts)){
    return opts;
  }
  const config = new PreConfig(opts);
  await config.load(opts);
  return config;
}

export { PreConfig, load }
