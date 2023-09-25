import * as fetch from 'node-fetch';
import {verbose} from '@appland/action-utils';

import locateToolsRelease from '../src/locateToolsRelease';

if (process.env.VERBOSE) verbose(true);

describe('locateToolsRelease', () => {
  const githubToken = 'my-token';
  const preRelease = {
    name: '@appland/appmap-prerelease-v0.0.1',
    assets: [
      {
        name: 'appmap-linux-x64',
        browser_download_url: 'https://example.com/appmap-prerelease-linux-x64',
      },
    ],
  };
  const newRelease = {
    name: '@appland/appmap-v0.0.2',
    assets: [
      {name: 'appmap-macos', browser_download_url: 'https://example.com/appmap-macos'},
      {name: 'appmap-linux-x64', browser_download_url: 'https://example.com/appmap-linux-x64'},
    ],
  };
  const oldRelease = {
    name: '@appland/appmap-v0.0.1',
    assets: [
      {name: 'appmap-macos', browser_download_url: 'https://example.com/appmap-old-macos'},
      {name: 'appmap-linux-x64', browser_download_url: 'https://example.com/appmap-old-linux-x64'},
    ],
  };

  afterEach(() => jest.restoreAllMocks());

  it('selects the first occurring @appland/appmap release', async () => {
    const releases = [preRelease, newRelease, oldRelease, ,];

    const fetcher = jest.spyOn(fetch, 'default').mockResolvedValue({
      status: 200,
      json: async () => releases,
    } as fetch.Response);

    const toolsRelease = await locateToolsRelease('linux-x64', githubToken);
    expect(toolsRelease).toEqual('https://example.com/appmap-linux-x64');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('will paginate', async () => {
    const fetcher = jest.spyOn(fetch, 'default');
    fetcher.mockResolvedValueOnce({
      status: 200,
      json: async () => [preRelease],
    } as fetch.Response);
    fetcher.mockResolvedValueOnce({
      status: 200,
      json: async () => [newRelease],
    } as fetch.Response);

    const toolsRelease = await locateToolsRelease('linux-x64', githubToken);
    expect(toolsRelease).toEqual('https://example.com/appmap-linux-x64');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('searches all pages', async () => {
    const fetcher = jest.spyOn(fetch, 'default');
    fetcher.mockResolvedValueOnce({
      status: 200,
      json: async () => [preRelease],
    } as fetch.Response);
    fetcher.mockResolvedValueOnce({
      status: 200,
      json: async () => [preRelease],
    } as fetch.Response);
    fetcher.mockResolvedValueOnce({
      status: 200,
      json: async () => [],
    } as fetch.Response);

    const toolsRelease = await locateToolsRelease('linux-x64', githubToken);
    expect(toolsRelease).toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
});
