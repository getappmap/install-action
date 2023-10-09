import Installer, {IgnoreEntry} from './Installer';
import {CommandOptions} from './CommandOptions';
import ArtifactStore from './ArtifactStore';
import loadAppMapConfig from './loadAppMapConfig';
import assert from 'assert';

const INSTALLER_OPTIONS = [
  'appmapConfig',
  'appmapToolsPath',
  'projectType',
  'installerName',
  'githubToken',
  'buildFile',
];

type CommandOutputs = {
  appmapDir: string;
  patchFile?: string;
};

export default async function run(
  artifactStore: ArtifactStore,
  options: CommandOptions
): Promise<CommandOutputs> {
  const installer = new Installer(
    options.toolsUrl,
    options.toolsPath,
    options.appmapConfig,
    options.installAppMapLibrary
  );

  for (const [propertyName, propertyValue] of Object.entries(options)) {
    if (!INSTALLER_OPTIONS.includes(propertyName)) continue;

    if (propertyValue) (installer as any)[propertyName] = propertyValue;
  }

  if (options.installAppMapTools !== false) await installer.installAppMapTools();

  if (options.ignoreDotAppMap !== false)
    await installer.gitignore([
      {
        path: '/.appmap',
        comment: 'AppMap artifacts',
        matchString: '.appmap',
      },
    ]);

  if (options.installAppMapLibrary !== false) {
    await installer.installAppMapLibrary();

    const gitignores: IgnoreEntry[] = [
      {
        path: '/node_modules',
        comment: 'Node modules',
        matchString: 'node_modules',
      },
    ];

    const appmapConfig = await loadAppMapConfig(true);
    assert(appmapConfig);
    if (appmapConfig.language === 'ruby') {
      gitignores.push({
        path: '/vendor',
        comment: 'Vendored Ruby gems',
        matchString: 'vendor',
      });
    }
    await installer.gitignore(gitignores);
  }

  if (options.expectedAppMapDir) await installer.verifyAppMapDir(options.expectedAppMapDir);

  const outputs: CommandOutputs = {appmapDir: await installer.detectAppMapDir()};
  if (options.buildPatchFile !== false) {
    const patch = await installer.buildPatchFile();
    outputs.patchFile = patch.contents;
    if (patch.contents.length > 0) {
      await artifactStore.uploadArtifact('appmap-install.patch', [patch.filename]);
    }
  }
  return outputs;
}
