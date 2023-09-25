import * as core from '@actions/core';
import {ActionLogger, setLogger, verbose} from '@appland/action-utils';
import {ArgumentParser} from 'argparse';
import assert from 'assert';

import Installer from './Installer';
import run from './run';
import {GitHubArtifactStore} from './GitHubArtifactStore';
import {DirectoryArtifactStore} from './DirectoryArtifactStore';

const Options: Record<string, keyof Installer> = {
  'appmap-config': 'appmapConfig',
  'project-type': 'projectType',
  'installer-name': 'installerName',
  'build-file': 'buildFile',
};

export async function runInGitHub(): Promise<void> {
  verbose(core.getBooleanInput('verbose'));
  setLogger(new ActionLogger());

  const outputs = await run(new GitHubArtifactStore(), {
    appmapConfig: core.getInput('appmap-config'),
    projectType: core.getInput('project-type'),
    buildFile: core.getInput('build-file'),
    installerName: core.getInput('installer-name'),
    toolsUrl: core.getInput('tools-url'),
    githubToken: core.getInput('github-token'),
    expectedAppMapDir: core.getInput('expected-appmap-dir'),
    ignoreDotAppMap: core.getBooleanInput('ignore-dot-appmap'),
    installAppMapTools: core.getBooleanInput('install-appmap-tools'),
    installAppMapLibrary: core.getBooleanInput('install-appmap-library'),
    buildPatchFile: core.getBooleanInput('build-patch-file'),
    diffPathSpec: core.getInput('diff-path-spec'),
  });

  core.setOutput('appmap-dir', outputs.appmapDir);
  core.setOutput('patch-file', outputs.patchFile || '');
}

async function runLocally() {
  const parser = new ArgumentParser({
    description: 'AppMap Analysis command',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', {help: 'Program working directory'});
  parser.add_argument('--artifact-dir', {default: '.appmap/artifacts'});
  parser.add_argument('--tools-url');
  parser.add_argument('--tools-path');
  parser.add_argument('--appmap-config');
  parser.add_argument('--project-type');
  parser.add_argument('--build-file');
  parser.add_argument('--installer-name');
  parser.add_argument('--github-token');
  parser.add_argument('--expected-appmap-dir');
  parser.add_argument('--ignore-dot-appmap', {default: true});
  parser.add_argument('--install-appmap-tools', {default: true});
  parser.add_argument('--install-appmap-library', {default: true});
  parser.add_argument('--build-patch-file', {default: true});
  parser.add_argument('--diff-path-spec');

  const options = parser.parse_args();

  verbose(options.verbose === 'true' || options.verbose === true);
  const directory = options.directory;
  if (directory) process.chdir(directory);
  const artifactDir = options.artifact_dir;
  assert(artifactDir);

  const outputs = await run(new DirectoryArtifactStore(artifactDir), {
    appmapConfig: options.appmap_config,
    projectType: options.project_type,
    buildFile: options.build_file,
    installerName: options.installer_name,
    githubToken: options.github_token || process.env.GITHUB_TOKEN,
    toolsUrl: options.tools_url,
    toolsPath: options.tools_path,
    expectedAppMapDir: options.expected_appmap_dir,
    ignoreDotAppMap: options.ignore_dot_appmap !== 'false',
    installAppMapTools: options.install_appmap_tools !== 'false',
    installAppMapLibrary: options.install_appmap_library !== 'false',
    buildPatchFile: options.build_patch_file !== 'false',
    diffPathSpec: options.diff_path_spec,
  });
  console.log(`appmap_dir: ${outputs.appmapDir}`);
}

if (require.main === module) {
  if (process.env.CI) runInGitHub();
  else runLocally();
}
