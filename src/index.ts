import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import Installer from './Installer';
import verbose from './verbose';
import {readFile} from 'fs/promises';

async function uploadPatchFile(path: string) {
  const patch = await readFile(path, 'utf8');
  core.setOutput('patch', patch);
  const upload = artifact.create();
  await upload.uploadArtifact('appmap-install.patch', [path], '.');
}

export async function runInGitHub(): Promise<void> {
  verbose(core.getBooleanInput('verbose'));
  const appmapConfig = core.getInput('appmap-config');
  const appmapToolsURL = core.getInput('tools-url');

  const installer = new Installer(appmapToolsURL);
  if (appmapConfig) installer.appmapConfig = appmapConfig;

  await installer.installAppMapTools();
  await installer.installAppMapLibrary();
  const patch = await installer.buildPatchFile();
  if (patch.length > 0) {
    await uploadPatchFile(patch);
  }
}

if (require.main === module) {
  runInGitHub();
}
