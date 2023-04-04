import {chmod, readFile, writeFile} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';
import {downloadFile} from './downloadFile';
import {executeCommand} from './executeCommand';
import log, {LogLevel} from './log';

export default class Installer {
  public appmapConfig?: string;
  public appmapToolsPath: string;

  constructor(public appmapToolsURL: string) {
    this.appmapToolsPath = join(tmpdir(), 'appmap');
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
    await executeCommand(
      `${this.appmapToolsPath} install --no-interactive --no-overwrite-appmap-config`
    );

    log(LogLevel.Info, `AppMap language library has been installed and configured.`);
  }

  async buildPatchFile() {
    await executeCommand(`git add -N .`);
    await executeCommand(`git diff > patch`);
    const patch = await readFile('patch', 'utf8');
    log(LogLevel.Debug, `Patch file contents:\n${patch}`);
    return patch;
  }
}
