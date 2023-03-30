import {join} from 'path';
import {default as installer} from '../src/index';

const pwd = process.cwd();

describe('install-appmap-action', () => {
  beforeEach(() => process.chdir(join(__dirname, 'fixture')));
  afterEach(() => process.chdir(pwd));

  it('installs AppMap tools', async () => {
    const results = await installer({
      appmapToolsURL: `https://github.com/getappmap/appmap-js/releases/download/%40appland%2Fappmap-preflight-v1.0-pre.1/appmap-preflight-macos-arm64`,
    });
    expect(results.patchFile).toBeTruthy();
  });
});
