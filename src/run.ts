import Installer from './Installer';
import {CommandOptions} from './CommandOptions';
import ArtifactStore from './ArtifactStore';

const INSTALLER_OPTIONS = [
  'appmapConfig',
  'appmapToolsPath',
  'projectType',
  'installerName',
  'githubToken',
  'buildFile',
];

export default async function run(
  artifactStore: ArtifactStore,
  options: CommandOptions
): Promise<void> {
  const installer = new Installer(options.toolsUrl, options.toolsPath);

  for (const [propertyName, propertyValue] of Object.entries(options)) {
    if (!INSTALLER_OPTIONS.includes(propertyName)) continue;

    if (propertyValue) (installer as any)[propertyName] = propertyValue;
  }

  if (options.ignoreDotAppMap !== false) await installer.ignoreDotAppmap();
  if (options.installAppMapTools !== false) await installer.installAppMapTools();
  if (options.installAppMapLibrary !== false) await installer.installAppMapLibrary();
  if (options.buildPatchFile !== false) {
    const patch = await installer.buildPatchFile();
    if (patch.contents.length > 0) {
      await artifactStore.uploadArtifact('appmap-install.patch', [patch.filename]);
    }
  }
}
