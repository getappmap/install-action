export default interface ArtifactStore {
  uploadArtifact(name: string, files: string[]): Promise<void>;
}
