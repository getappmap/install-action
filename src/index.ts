import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import assert from 'assert';
import Installer, {Logger} from './Installer';
import verbose from './verbose';
import {readFile} from 'fs/promises';

type UploadArtifact = (path: string) => Promise<void>;

let uploadArtifact: UploadArtifact | undefined;

class ActionLogger implements Logger {
  debug(message: string): void {
    core.debug(message);
  }

  info(message: string): void {
    core.info(message);
  }

  warn(message: string): void {
    core.warning(message);
  }
}

function usage(): string {
  return `Usage: node ${process.argv[1]} <appmap-tools-url>`;
}

async function uploadPatchFile(path: string) {
  core.setOutput('patch', await readFile(path, 'utf8'));
  const upload = artifact.create();
  await upload.uploadArtifact('patch', [path], '.');
}

function runInGitHub(): Installer {
  core.debug(`Env var 'CI' is set. Running as a GitHub action.`);
  verbose(core.getBooleanInput('verbose'));
  const appmapConfig = core.getInput('appmap-config');
  const appmapToolsURL = core.getInput('tools-url');
  const installer = new Installer(appmapToolsURL, new ActionLogger());
  if (appmapConfig) installer.appmapConfig = appmapConfig;

  uploadArtifact = uploadPatchFile;

  return installer;
}

function runAsScript(appmapToolsURL: string): Installer {
  console.log(`Env var 'CI' is not set. Running as a local script.`);
  const installer = new Installer(appmapToolsURL);

  uploadArtifact = (path: string) =>
    Promise.resolve(console.log(`Repository changes stored in patch file: ${path}`));

  return installer;
}

export interface InstallerOptions {
  appmapToolsURL: string;
}

export interface InstallerResults {
  patchFile: string;
}

export default async function main(options: InstallerOptions): Promise<InstallerResults> {
  let installer: Installer;
  if (process.env.CI) installer = runInGitHub();
  else installer = runAsScript(options.appmapToolsURL);

  await installer.installAppMapTools();
  await installer.installAppMapLibrary();
  const patchFile = await installer.buildPatchFile();
  assert(uploadArtifact);
  await uploadArtifact(patchFile);
  return {patchFile};
}

if (require.main === module) {
  const appmapToolsURL = process.argv[2];
  if (!appmapToolsURL) throw new Error(usage());
  main({appmapToolsURL});
}
