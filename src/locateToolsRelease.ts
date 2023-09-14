import fetch from 'node-fetch';
import {log, LogLevel} from '@appland/action-utils';

export default async function locateToolsRelease(
  platform: string,
  githubToken?: string
): Promise<string | undefined> {
  let result: string | undefined;
  let page = 1;
  while (!result) {
    const url = `https://api.github.com/repos/applandinc/appmap-js/releases?page=${page}&per_page=100`;
    log(LogLevel.Debug, `Enumerating appmap-js releases: ${url}`);
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
    };
    if (githubToken) headers['Authorization'] = `Bearer ${githubToken}`;
    const response = await fetch(url, {
      headers,
    });
    if (response.status === 403) {
      let message: string;
      try {
        message = (await response.json()).message;
      } catch (e) {
        log(LogLevel.Warn, (e as Error).toString());
        message = 'GitHub API rate limit exceeded.';
      }
      log(LogLevel.Info, message);
      log(LogLevel.Info, `Waiting for 3 seconds.`);
      log(
        LogLevel.Info,
        `You can avoid the rate limit by setting 'github-token: \${{ secrets.GITHUB_TOKEN }}'`
      );
      await new Promise(resolve => setTimeout(resolve, 3 * 1000));
      continue;
    } else if (response.status > 400) {
      throw new Error(`GitHub API returned ${response.status} ${response.statusText}`);
    }

    const releases = await response.json();
    if (releases.length === 0) break;

    page += 1;
    const release = releases.find((release: any) => /^@appland\/appmap-v\d+\./.test(release.name));

    if (release) {
      log(LogLevel.Info, `Using @appland/appmap release ${release.name} for ${platform}`);
      result = release.assets.find(
        (asset: any) => asset.name === `appmap-${platform}`
      ).browser_download_url;
    }
  }

  return result;
}
