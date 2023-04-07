import {chmod, readFile, writeFile} from 'fs/promises';
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
    const patchFileName = join(tmpdir(), 'appmap-install.patch');
    await executeCommand(`git add -N .`);
    await executeCommand(`git diff > ${patchFileName}`);
    const patch = await readFile(patchFileName, 'utf8');
    log(LogLevel.Debug, `Patch file contents:\n${patch}`);
    return {filename: patchFileName, contents: patch};
  }
}
