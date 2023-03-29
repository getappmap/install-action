import {chmod, readFile, writeFile} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';
import {downloadFile} from './downloadFile';
import {executeCommand} from './executeCommand';

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
}

export default class Installer {
  public appmapConfig?: string;
  public appmapToolsPath: string;

  constructor(public appmapToolsURL: string, public logger: Logger = console) {
    this.appmapToolsPath = join(tmpdir(), 'appmap');
  }

  async installAppMapTools() {
    await downloadFile(new URL(this.appmapToolsURL), this.appmapToolsPath);
    await chmod(this.appmapToolsPath, 0o755);
    this.logger.info(`AppMap tools are installed at ${this.appmapToolsPath}`);
  }

  async installAppMapLibrary() {
    if (this.appmapConfig) {
      this.logger.info(`Installing the appmap.yml configuration provided by action input.`);
      await writeFile('appmap.yml', this.appmapConfig);
    }
    await executeCommand(
      `${this.appmapToolsPath} install --no-interactive --no-overwrite-appmap-config`
    );

    this.logger.info(`AppMap language library has been installed and configured.`);
  }

  async buildPatchFile() {
    await executeCommand(`git add -N .`);
    await executeCommand(`git diff > patch`);
    const patch = await readFile('patch', 'utf8');
    this.logger.debug(`Patch file contents:\n${patch}`);
    return 'patch';
  }
}
