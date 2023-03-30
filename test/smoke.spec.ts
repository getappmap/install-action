import {join} from 'path';
import {runAsScript} from '../src/index';

const pwd = process.cwd();

const platformName = process.platform === 'darwin' ? 'macos-arm64' : 'linux-x64';
const scriptUrl = `https://github.com/getappmap/appmap-js/releases/download/%40appland%2Fappmap-preflight-v1.0-pre.1/appmap-preflight-${platformName}`;

describe('install-appmap-action', () => {
  beforeEach(() => process.chdir(join(__dirname, 'fixture')));
  afterEach(() => process.chdir(pwd));

  it('installs AppMap tools', async () => {
    const results = await runAsScript(scriptUrl);
    expect(results.patchFile).toBeTruthy();
  });
});
