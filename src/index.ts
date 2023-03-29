import * as core from '@actions/core';
import Installer, {Logger} from './Installer';
import verbose from './verbose';

class ActionLogger implements Logger {
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

function runInGitHub(): Installer {
  core.debug(`Env var 'CI' is set. Running as a GitHub action.`);
  verbose(core.getBooleanInput('verbose'));
  const appmapConfig = core.getInput('appmap-config');
  const appmapToolsURL = core.getInput('tools-url');
  const installer = new Installer(appmapToolsURL, new ActionLogger());
  if (appmapConfig) installer.appmapConfig = appmapConfig;
  return installer;
}

function runAsScript(): Installer {
  console.log(`Env var 'CI' is not set. Running as a local script.`);
  const appmapToolsURL = process.argv[2];
  if (!appmapToolsURL) throw new Error(usage());
  const installer = new Installer(appmapToolsURL);
  return installer;
}

(async () => {
  let installer: Installer;
  if (process.env.CI) installer = runInGitHub();
  else installer = runAsScript();

  await installer.installAppMapTools();
  await installer.installAppMapLibrary();
})();
