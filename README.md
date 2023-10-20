# getappmap/install-appmap <!-- omit in toc -->

> To get started with AppMap in GitHub actions, you need to start by installing the [AppMap App on the official GitHub Marketplace](https://github.com/marketplace/get-appmap)

> To see a step-by-step example of how to install this action into your software project, [review the official AppMap Documentation](http://appmap.io/docs/analysis/in-github-actions).

This is a GitHub action to install and configure AppMap. It will do the following things:

- Install the AppMap tools (CLI)
- (Optional) Install the AppMap library for the language and build system (e.g. Java + Maven, Ruby + Bundler,
  JS + yarn, etc).
- (Optional) Configure the AppMap library by creating a default _appmap.yml_.

## Table of contents <!-- omit in toc -->

- [Prerequisites](#prerequisites)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Examples](#examples)
- [Development](#development)

## Prerequisites

Before running this action, ensure that the programming language and package manager used by your
project are installed and available.  This action **needs** to run **before** your tests execute inside your GitHub Action workflow file. 

## Inputs

Add a step like this to your workflow:

```yaml
- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    # Choose the type of your project here: e.g. bundler, maven, gradle, pip, pipenv, poetry, yarn, npm, etc.
    # Consult https://appmap.io/docs/add-appmap-to-a-project.html for more information.
    project-type: 'pip'

    # Command working directory. Change this if your project lives in a subdirectory or for monorepo / multi-project support
    # Default: '.'
    directory: /path/to/code
    
    # Contents of appmap.yml configuration in a multi-line yaml file. 
    # Default: Automatically generated appmap.yml content identified based on project type (aka build framework)
    appmap-config: |
      name: project-name
        packages:
          - path: src
        language: python
        appmap_dir: custom/appmap/dir

    # Build file to be configured, in case of ambiguity.
    # Default: Automatically identified based on project language
    build-file: requirements-dev.txt
    
    # URL to the AppMap tools. By default, the latest version will be downloaded and installed.
    # Default: Latest release downloaded from https://github.com/getappmap/appmap-js/releases/
    tools-url: https://github.com/getappmap/appmap-js/releases/download/%40appland%2Fappmap-v3.104.0/appmap-linux-x64

    # The GitHub token to use with the GitHub API to enumerate AppMap Tools releases.
    # Default: `${{ github.token }}`
    github-token: secrets.CUSTOM_GITHUB_TOKEN

    # Add the .appmap directory to .gitignore, if it's not already present.
    # Default: true
    ignore-dot-appmap: false

    # Install the AppMap command-line tools.
    # Default: true
    install-appmap-tools: false

    # Install the and configure the AppMap language library. This can be set to false if your project already has AppMap libraries included in your project build dependency file.
    # Default: true
    install-appmap-library: false

    # Create a patch file of changes made by the installer. This patch file will be stored as a build artifact and made available for download.
    # Default: true
    build-patch-file: false

    # Path specification to use when creating the patch file. If the patch file includes files that you don't want to commit, you can use this option to exclude them.
    # Default: ". ':(exclude,top)vendor' ':(exclude,top)node_modules'"
    diff-path-spec: "':(exclude,top)virtualenv'"

    # Enable verbose logging.
    # Default: false
    verbose: true
```

## Outputs

The action provides these outputs:

- `patch`: Patch file of changes made by the installer.
- `appmap-dir`: Directory containing recorded AppMaps; this information can also be obtained from the appmap_dir entry in the `appmap.yml` configuration file.

## Examples

Set the `project-type` to ensure the AppMap library is installed via the correct package manager.

```
- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    project-type: bundler
```

If your project alrady has the AppMap software libraries and configuration files installed, use `install-appmap-library: false` to skip the install of the libraries and only install the CLI tools which are required for later steps:

```
- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    install-appmap-library: false
```

## Development

```
# Remove build artifacts
$ yarn clean

# Build the project
$ yarn build

# Run tests
$ yarn test

# Package the project into a distributable GitHub action
$ yarn package
```
