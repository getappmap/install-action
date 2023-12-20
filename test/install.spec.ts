import {join} from 'path';
import * as actionUtils from '@appland/action-utils';
import {readFileSync, readdirSync, unlinkSync} from 'fs';
import {mkdir, readFile, writeFile} from 'fs/promises';

import Installer from '../src/Installer';

const pwd = process.cwd();

const appmapToolsURL = ['file://', join(__dirname, 'fixture', 'installer')].join('');
const appmapConfig = `name: install-appmap-action-test
appmap_dir: tmp/appmap
`;
const githubToken = 'your-github-token';
const FixtureFiles = ['install.log', 'appmap.yml'].reduce(
  (memo, fileName) => (
    (memo[fileName] = readFileSync(join(__dirname, 'fixture', 'app', fileName), 'utf8')), memo
  ),
  {} as Record<string, string>
);
async function restoreFixtureFiles() {
  await Promise.all(
    Object.entries(FixtureFiles).map(async ([fileName, contents]) => {
      await writeFile(fileName, contents);
    })
  );
}

if (process.env.VERBOSE) actionUtils.verbose(true);

describe('install-action', () => {
  let installer: Installer;

  beforeEach(() => mkdir('tmp', {recursive: true}));
  beforeEach(() => process.chdir(join(__dirname, 'fixture', 'app')));
  beforeEach(() => {
    installer = new Installer(appmapToolsURL);
    installer.projectType = 'dummy-project-type';
    installer.appmapToolsPath = join(__dirname, '..', 'tmp', 'appmap-tools');
    installer.appmapConfig = appmapConfig;
    installer.shouldInstallLibrary = true;
    installer.githubToken = githubToken;
  });
  afterEach(restoreFixtureFiles);
  afterEach(() => process.chdir(pwd));

  it('installs AppMap tools', async () => {
    const mockInstallAppMapTools = jest.spyOn(actionUtils, 'installAppMapTools').mockImplementation(() => Promise.resolve());
    await installer.installAppMapTools();
    await installer.installAppMapLibrary();
    const patch = await installer.buildPatchFile();

    expect((await readFile('install.log', 'utf8')).trim()).toEqual(
      'install --no-interactive --no-overwrite-appmap-config --project-type dummy-project-type'
    );
    expect(await readFile('appmap.yml', 'utf8')).toEqual(appmapConfig);
    expect(patch.contents).toContain(`-# AppMap config will be written here`);

    expect(await installer.detectAppMapDir()).toEqual('tmp/appmap');

    expect(mockInstallAppMapTools).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ githubToken })
    );
    mockInstallAppMapTools.mockRestore();
  });

  it('verifies appmap_dir', async () => {
    await installer.installAppMapLibrary();

    let exception: Error | undefined;
    try {
      await installer.verifyAppMapDir('foo/appmaps');
    } catch (e) {
      exception = e as Error;
    }
    expect(exception).toBeDefined();
    expect(exception?.message).toEqual(`Configured appmap_dir is tmp/appmap, expected foo/appmaps`);
  });

  it('diff path spec can be configured', async () => {
    installer.diffPathSpec = `. :(exclude)install.log`;
    await installer.installAppMapTools();
    await installer.installAppMapLibrary();
    const patch = await installer.buildPatchFile();

    expect(patch.contents).not.toMatch(/\+install --no-interactive/);
  });

  describe('when appmap.yml is not found', () => {
    it('and install-appmap-library is false, it uses tmp/appmap as the appmap-dir', async () => {
      unlinkSync('appmap.yml');
      installer.shouldInstallLibrary = false;
      const result = await installer.detectAppMapDir();
      expect(result).toEqual('tmp/appmap');
    });

    it('and install-appmap-library is true, it throws an error', async () => {
      unlinkSync('appmap.yml');
      let exception: Error | undefined;
      try {
        await installer.detectAppMapDir();
      } catch (e) {
        exception = e as Error;
      }
      expect(exception).toBeDefined();
      expect(exception?.message).toContain(`ENOENT: no such file or directory, open 'appmap.yml'`);
    });
  });
});
