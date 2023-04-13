import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import Installer from './Installer';
import verbose from './verbose';
import {ArgumentParser} from 'argparse';
import {parse} from 'yaml';
import {readFile} from 'fs/promises';
import {join} from 'path';
import assert from 'assert';
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

  await run(new GitHubArtifactStore(), {
    appmapConfig: core.getInput('appmap-config'),
    projectType: core.getInput('project-type'),
    buildFile: core.getInput('build-file'),
    installerName: core.getInput('installer-name'),
    toolsUrl: core.getInput('tools-url'),
  });
}

async function runLocally() {
  const parser = new ArgumentParser({
    description: 'Preflight command',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', {help: 'Program working directory'});
  parser.add_argument('--artifact-dir', {default: '.appmap/artifacts'});
  parser.add_argument('--tools-url');
  parser.add_argument('--appmap-config');
  parser.add_argument('--project-type');
  parser.add_argument('--build-file');
  parser.add_argument('--installer-name');

  const options = parser.parse_args();

  verbose(options.verbose === 'true' || options.verbose === true);
  const directory = options.directory;
  if (directory) process.chdir(directory);
  const artifactDir = options.artifact_dir;
  assert(artifactDir);

  await run(new DirectoryArtifactStore(artifactDir), {
    appmapConfig: options.appmap_config,
    projectType: options.project_type,
    buildFile: options.build_file,
    installerName: options.installer_name,
    toolsUrl: options.tools_url,
  });
}

if (require.main === module) {
  if (process.env.CI) runInGitHub();
  else runLocally();
}
