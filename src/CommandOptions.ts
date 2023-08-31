export interface CommandOptions {
  toolsUrl: string;
  toolsPath?: string;
  appmapConfig?: string;
  projectType?: string;
  githubToken?: string;
  buildFile?: string;
  expectedAppMapDir?: string;
  installerName?: string;
  ignoreDotAppMap?: boolean;
  installAppMapTools?: boolean;
  installAppMapLibrary?: boolean;
  buildPatchFile?: boolean;
  diffPathSpec?: string;
}
