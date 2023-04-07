import {createWriteStream} from 'fs';
import {open} from 'fs/promises';
import fetch from 'node-fetch';

export async function downloadFile(url: URL, path: string) {
  let readStream: NodeJS.ReadableStream;
  if (url.protocol === 'file:') {
    readStream = (await open(url.pathname, 'r')).createReadStream();
  } else {
    const res = await fetch(url);
    if (!res) throw new Error(`Could not download ${url}`);
    if (!res.body) throw new Error(`Response body for ${url} is empty`);
    if (res.status !== 200) throw new Error(`Could not download ${url}: ${res.statusText}`);

    readStream = res.body;
  }

  const writeStream = createWriteStream(path);

  await new Promise((resolve, reject) => {
    readStream.on('error', reject).pipe(writeStream).on('error', reject).on('finish', resolve);
  });
}
