import {readFile} from 'fs/promises';
import {load} from 'js-yaml';

export type AppMapConfig = {
  language: string;
  appmap_dir: string;
};

export default async function loadAppMapConfig(mustFind = true): Promise<AppMapConfig | undefined> {
  try {
    const appmapConfigData = await readFile('appmap.yml', 'utf8');
    return load(appmapConfigData) as AppMapConfig;
  } catch (e) {
    const err = e as Error;
    if (mustFind) throw new Error(`${err.message}\nERROR: appmap.yml not found or unreadable`);
  }
}
