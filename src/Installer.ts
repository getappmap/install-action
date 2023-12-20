import {mkdir, readFile, writeFile} from 'fs/promises';
import {join} from 'path';
import {executeCommand, log, LogLevel} from '@appland/action-utils';
import * as actionUtils from '@appland/action-utils';

import loadAppMapConfig from './loadAppMapConfig';

export interface IgnoreEntry {
  path: string;
  comment: string;
  matchString: string;
}

export default class Installer {
  public appmapToolsPath: string;
  public projectType?: string;
  public installerName?: string;
  public buildFile?: string;
  public githubToken?: string;
  public diffPathSpec = `. :(exclude,top)vendor :(exclude,top)node_modules`;

  constructor(
    public appmapToolsURL?: string,
    appmapToolsPath?: string,
    public appmapConfig?: string,
    public shouldInstallLibrary?: boolean
  ) {
    this.appmapToolsPath = appmapToolsPath || '/usr/local/bin/appmap';
  }

  async gitignore(ignoreEntries: IgnoreEntry[]) {
    let gitignore: string[];
    try {
      gitignore = (await readFile('.gitignore', 'utf8')).split('\n');
    } catch {
      log(LogLevel.Info, `Project has no .gitignore file. Initializing an empty one.`);
      gitignore = [];
    }

    for (const entry of ignoreEntries) {
      log(LogLevel.Debug, `Checking whether ${entry.path} should be added to .gitignore`);
      if (!gitignore.find(line => line.includes(entry.matchString))) {
        log(LogLevel.Info, `Adding ${entry.path} to .gitignore`);
        gitignore.push('');
        gitignore.push(`# ${entry.comment}`);
        gitignore.push(entry.path);
      }

      await writeFile('.gitignore', gitignore.join('\n'));
    }
  }

  async installAppMapTools() {
    // If you run this github action, the tools will always be installed to the requested location,
    // even if there is a previous version installed. This is a way to force a known version of the tools package.
    // Other AppMap actions will use the installed tools if they already exist, and won't re-install.
    const options: actionUtils.InstallAppMapToolsOptions = {
      force: true,
      githubToken: this.githubToken
    };
    if (this.appmapToolsURL) options.toolsURL = this.appmapToolsURL;
    await actionUtils.installAppMapTools(this.appmapToolsPath, options);
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
    await executeCommand(`git diff --output=${patchFileName} -- ${this.diffPathSpec}`);
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
    const appmapConfig = await loadAppMapConfig(this.shouldInstallLibrary);
    let result = appmapConfig?.appmap_dir;
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
