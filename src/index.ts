import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import assert from 'assert';
import Installer from './Installer';
import verbose from './verbose';
import {readFile} from 'fs/promises';

async function uploadPatchFile(path: string) {
  core.setOutput('patch', await readFile(path, 'utf8'));
  const upload = artifact.create();
  await upload.uploadArtifact('patch', [path], '.');
}

export interface InstallerResults {
  patchFile: string;
}

export async function runInGitHub(): Promise<InstallerResults> {
  verbose(core.getBooleanInput('verbose'));
  const appmapConfig = core.getInput('appmap-config');
  const appmapToolsURL = core.getInput('tools-url');
  const installer = new Installer(appmapToolsURL);
  if (appmapConfig) installer.appmapConfig = appmapConfig;

  await installer.installAppMapTools();
  await installer.installAppMapLibrary();
  const patchFile = await installer.buildPatchFile();
  await uploadPatchFile(patchFile);
  return {patchFile};
}

if (require.main === module) {
  runInGitHub();
}
