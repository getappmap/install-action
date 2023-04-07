import {copyFile, mkdir} from 'fs/promises';
import {basename, join} from 'path';
import log, {LogLevel} from './log';
import ArtifactStore from './ArtifactStore';

export class DirectoryArtifactStore implements ArtifactStore {
  constructor(public directory: string) {}

  async uploadArtifact(name: string, files: string[]): Promise<void> {
    await mkdir(this.directory, {recursive: true});

    log(LogLevel.Info, `Storing artifact ${name} in ${this.directory}`);
    for (const file of files) {
      log(LogLevel.Info, `\tFile ${file}`);
      const target = join(this.directory, basename(file));
      await copyFile(file, target);
    }
  }
}
