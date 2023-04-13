import Installer from './Installer';
import {CommandOptions} from './CommandOptions';
import ArtifactStore from './ArtifactStore';

export default async function run(
  artifactStore: ArtifactStore,
  options: CommandOptions
): Promise<void> {
  const installer = new Installer(options.toolsUrl);

  for (const [propertyName, propertyValue] of Object.entries(options)) {
    if (propertyValue) (installer as any)[propertyName] = propertyValue;
  }

  await installer.ignoreDotAppmap();
  await installer.installAppMapTools();
  await installer.installAppMapLibrary();
  const patch = await installer.buildPatchFile();
  if (patch.contents.length > 0) {
    await artifactStore.uploadArtifact('appmap-install.patch', [patch.filename]);
  }
}
