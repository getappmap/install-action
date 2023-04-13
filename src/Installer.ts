import {chmod, mkdir, readFile, writeFile} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';
import {downloadFile} from './downloadFile';
import {executeCommand} from './executeCommand';
import log, {LogLevel} from './log';

export default class Installer {
  public appmapConfig?: string;
  public appmapToolsPath: string;
  public projectType?: string;
  public installerName?: string;
  public buildFile?: string;

  constructor(public appmapToolsURL: string) {
    this.appmapToolsPath = join(tmpdir(), 'appmap');
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
      await executeCommand('git add .gitignore');
      await executeCommand(
        `git commit -c user.email='${
          process.env.GITHUB_ACTOR || 'github-action'
        }@users.noreply.github.com' -c user.name='${
          process.env.GITHUB_ACTOR || 'github-action'
        }' -m 'Ignore AppMap archives and working files'`
      );
    }
  }

  async installAppMapTools() {
    await downloadFile(new URL(this.appmapToolsURL), this.appmapToolsPath);
    await chmod(this.appmapToolsPath, 0o755);
    log(LogLevel.Info, `AppMap tools are installed at ${this.appmapToolsPath}`);
  }

  async installAppMapLibrary() {
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
    await executeCommand(`git diff > ${patchFileName}`);
    const patch = await readFile(patchFileName, 'utf8');
    log(LogLevel.Debug, `Patch file contents:\n${patch}`);
    return {filename: patchFileName, contents: patch};
  }
}
