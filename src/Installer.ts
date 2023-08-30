import {chmod, mkdir, readFile, writeFile} from 'fs/promises';
import os from 'os';
import {tmpdir} from 'os';
import {join} from 'path';
import {load} from 'js-yaml';

import {downloadFile} from './downloadFile';
import {executeCommand} from './executeCommand';
import log, {LogLevel} from './log';
import locateToolsRelease from './locateToolsRelease';

export default class Installer {
  public appmapConfig?: string;
  public appmapToolsPath: string;
  public projectType?: string;
  public installerName?: string;
  public buildFile?: string;
  public githubToken?: string;
  public diffPathSpec = `. ':(exclude,top)vendor' ':(exclude,top)node_modules'`;

  constructor(public appmapToolsURL?: string, appmapToolsPath?: string) {
    this.appmapToolsPath = appmapToolsPath || '/usr/local/bin/appmap';
  }

  async ignoreDotAppmap() {
    let gitignore: string[];
    try {
      gitignore = (await readFile('.gitignore', 'utf8')).split('\n');
    } catch {
      log(LogLevel.Info, `Project has no .gitignore file. Initializing an empty one.`);
      gitignore = [];
    }
    if (!gitignore.includes('/.appmap')) {
      log(LogLevel.Info, `Adding .appmap to .gitignore`);
      gitignore.push('');
      gitignore.push('# Ignore AppMap archives and working files');
      gitignore.push('/.appmap');
      gitignore.push('');
      await writeFile('.gitignore', gitignore.join('\n'));
    }
  }

  async installAppMapTools() {
    const platform = [os.platform() === 'darwin' ? 'macos' : os.platform(), os.arch()].join('-');
    const toolsReleaseURL =
      this.appmapToolsURL || (await locateToolsRelease(platform, this.githubToken));
    if (!toolsReleaseURL) throw new Error('Could not find @appland/appmap release');

    log(LogLevel.Info, `Installing AppMap tools from ${toolsReleaseURL}`);
    const appmapTempPath = join(tmpdir(), 'appmap');
    await downloadFile(new URL(toolsReleaseURL), appmapTempPath);
    try {
      await executeCommand(`mv ${appmapTempPath} ${this.appmapToolsPath}`);
    } catch (e) {
      await executeCommand(`sudo mv ${appmapTempPath} ${this.appmapToolsPath}`);
    }
    await chmod(this.appmapToolsPath, 0o755);

    log(LogLevel.Info, `AppMap tools are installed at ${this.appmapToolsPath}`);
  }

  async installAppMapLibrary() {
    if (!this.projectType)
      throw new Error('project-type is required when install-appmap-library is true');

    if (this.appmapConfig) {
      log(LogLevel.Info, `Installing the appmap.yml configuration provided by action input.`);
      await writeFile('appmap.yml', this.appmapConfig);
    }

    let cmd = `${this.appmapToolsPath} install --no-interactive --no-overwrite-appmap-config`;
    if (this.projectType) cmd += ` --project-type ${this.projectType}`;
    if (this.buildFile) cmd += ` --build-file ${this.buildFile}`;
    if (this.installerName) cmd += ` --installer-name ${this.installerName}`;
    await executeCommand(cmd);

    log(LogLevel.Info, `AppMap language library has been installed and configured.`);
  }

  async buildPatchFile(): Promise<{filename: string; contents: string}> {
    const patchFileName = join('.appmap', 'appmap-install.patch');
    await executeCommand(`git add -N .`);
    await mkdir('.appmap', {recursive: true});
    await executeCommand(`git diff -- ${this.diffPathSpec} > ${patchFileName}`);
    const patch = await readFile(patchFileName, 'utf8');
    log(LogLevel.Debug, `Patch file contents:\n${patch}`);
    return {filename: patchFileName, contents: patch};
  }

  async verifyAppMapDir(expectedAppMapDir: string) {
    const appmapDir = await this.detectAppMapDir();
    if (appmapDir !== expectedAppMapDir) {
      const msg = `Configured appmap_dir is ${appmapDir}, expected ${expectedAppMapDir}`;
      log(LogLevel.Warn, msg);
      throw new Error(msg);
    }
  }

  async detectAppMapDir(): Promise<string> {
    const appmapConfigData = await readFile('appmap.yml', 'utf8');
    const appmapConfig = load(appmapConfigData) as any;
    let result = appmapConfig.appmap_dir;
    if (!result) {
      log(
        LogLevel.Warn,
        `config.appmap_dir not found in appmap.yml, using default value tmp/appmap`
      );
      result = 'tmp/appmap';
    }
    return result;
  }
}
