import {chmod, writeFile} from 'fs/promises';
import {tmpdir} from 'os';
import {join} from 'path';
import {downloadFile} from './downloadFile';
import {executeCommand} from './executeCommand';

export interface Logger {
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
      await writeFile('.appmap.yml', this.appmapConfig);
    }
    await executeCommand(
      `${this.appmapToolsPath} install --no-interactive --no-overwrite-appmap-config`
    );

    this.logger.info(`AppMap language library has been installed and configured.`);
  }
}
