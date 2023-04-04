import {join} from 'path';
import verbose from '../src/verbose';
import Installer from '../src/Installer';
import {readFileSync} from 'fs';
import {readFile, writeFile} from 'fs/promises';

const pwd = process.cwd();

const appmapToolsURL = ['file://', join(__dirname, 'fixture', 'installer')].join('');
const appmapConfig = `name: install-appmap-action-test
`;
const FixtureFiles = ['install.log', 'appmap.yml'].reduce(
  (memo, fileName) => (
    (memo[fileName] = readFileSync(join(__dirname, 'fixture', 'app', fileName), 'utf8')), memo
  ),
  {} as Record<string, string>
);
async function restoreFixtureFiles() {
  await Promise.all(
    Object.entries(FixtureFiles).map(([fileName, contents]) => {
      writeFile(fileName, contents);
    })
  );
}

if (process.env.VERBOSE) verbose(true);

describe('install-appmap-action', () => {
  beforeEach(() => process.chdir(join(__dirname, 'fixture', 'app')));
  afterEach(() => restoreFixtureFiles);
  afterEach(() => process.chdir(pwd));

  it('installs AppMap tools', async () => {
    const installer = new Installer(appmapToolsURL);
    installer.appmapToolsPath = join(__dirname, '..', 'tmp', 'appmap-tools');
    installer.appmapConfig = appmapConfig;

    await installer.installAppMapTools();
    await installer.installAppMapLibrary();
    const patch = await installer.buildPatchFile();

    expect((await readFile('install.log', 'utf8')).trim()).toEqual(
      'install --no-interactive --no-overwrite-appmap-config'
    );
    expect(await readFile('appmap.yml', 'utf8')).toEqual(appmapConfig);
    expect(patch).toMatch(/\+install --no-interactive/);
  });
});
