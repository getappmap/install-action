import assert from 'assert';
import {createWriteStream} from 'fs';
import fetch from 'node-fetch';

export async function downloadFile(url: URL, path: string) {
  const res = await fetch(url);
  if (!res) throw new Error(`Could not download ${url}`);
  if (!res.body) throw new Error(`Response body for ${url} is empty`);

  const fileStream = createWriteStream(path);
  await new Promise((resolve, reject) => {
    assert(res.body);
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
}
