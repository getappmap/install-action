import Installer from '../src/Installer';
import * as actionUtils from '@appland/action-utils';

if (process.env.VERBOSE) actionUtils.verbose(true);

describe('install-action.install-appmap-library', () => {
  let installer: Installer;
  const toolsUrl = '/dummy/path/tools-url';
  const toolsPath = '/dummy/path/tools-path';

  beforeEach(() => (installer = new Installer(toolsUrl, toolsPath)));
  afterEach(() => jest.restoreAllMocks());

  it('runs when configured with project-type', async () => {
    const installCommandFn = jest.spyOn(actionUtils, 'executeCommand').mockResolvedValue('ok');

    installer.projectType = 'yarn';
    await installer.installAppMapLibrary();

    expect(installCommandFn).toHaveBeenCalledTimes(1);
    expect(installCommandFn).toHaveBeenCalledWith(
      '/dummy/path/tools-path install --no-interactive --no-overwrite-appmap-config --project-type yarn'
    );
  });

  it('requires project-type', async () => {
    let err: any;
    try {
      await installer.installAppMapLibrary();
    } catch (error) {
      err = error as any;
      expect(err.toString()).toMatch(/project-type is required/);
    }
    expect(err).toBeTruthy();
  });
});
