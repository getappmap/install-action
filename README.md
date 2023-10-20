# getappmap/install-appmap <!-- omit in toc -->

> To get started with AppMap in GitHub actions, you need to start by installing the [AppMap App on the official GitHub Marketplace](https://github.com/marketplace/get-appmap)
> 
> To see a step-by-step example of how to install this action into your software project, [review the official AppMap Documentation](http://appmap.io/docs/analysis/in-github-actions).

This is a GitHub action to install and configure AppMap. By default, it will do the following three things:

1. Install the AppMap tools (CLI)
2. Install the AppMap language library for the language and build system (e.g. Java + Maven, Ruby + Bundler,
  JS + yarn, etc).
3. Configure the AppMap integration with your project by creating _appmap.yml_.

Once a workflow run has completed successfully with `install-action` enabled, you have two choices:

1) If no subsequent workflow steps require the AppMap CLI, you may remove the `install-action` step from your workflow.
2) If any subsequent workflow step does require the AppMap CLI, leave the `install-action` in place but set
   `install-appmap-library: false`.

## Table of contents <!-- omit in toc -->

- [Requirements](#requirements)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Examples](#examples)
- [Development](#development)

## Requirements

You must make sure that all of the following conditions are satisfied:

1. `install-action` must run **after** the workflow steps that install your programming language and package manager.
2. `install-action` must run **before** the workflow step that runs your test cases. 
3. The `project-type` input is **required** unless `install-appmap-library` is `false`.

## Inputs

Add a step like this to your workflow:

```yaml
- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    # Choose the type of your project here: e.g. bundler, maven, gradle, pip, 
    # pipenv, poetry, yarn, npm, etc.
    # Consult https://appmap.io/docs/add-appmap-to-a-project.html for more 
    # information.
    project-type: 'pip'

    # Command working directory. Use this option this to install AppMap to a 
    # subdirectory of a monorepo / multi-folder project. When this input is specified,
    # AppMaps that project will be written to the directory `$directory/tmp/appmap`.
    # Be aware of this in any subsequent steps.
    # Default: '.'
    directory: ./projects/backend
    
    # Contents of appmap.yml configuration in a multi-line yaml file. 
    # Default: Automatically generated appmap.yml content identified based on 
    # project type (aka build framework)
    appmap-config: |
      name: project-name
      packages:
        - path: src
      language: python
      appmap_dir: tmp/appmap

    # Build file to be configured, in case of ambiguity.
    # Default: Automatically identified based on project language
    build-file: requirements-dev.txt
    
    # URL to the AppMap tools. By default, the latest version will be downloaded 
    # and installed.
    # Default: Latest release downloaded from:
    # https://github.com/getappmap/appmap-js/releases/
    tools-url: https://github.com/getappmap/appmap-js/releases/download/%40appland%2Fappmap-v3.104.0/appmap-linux-x64

    # The GitHub token to use with the GitHub API to enumerate AppMap Tools 
    # releases.
    # Default: `${{ github.token }}`
    github-token: secrets.CUSTOM_GITHUB_TOKEN

    # Add the .appmap directory to .gitignore, if it's not already present.
    # Default: true
    ignore-dot-appmap: false

    # Install the AppMap command-line tools.
    # Default: true
    install-appmap-tools: false

    # Install the and configure the AppMap language library. This can be set to 
    # false if your project already has AppMap libraries included in your project 
    # build dependency file.
    # Default: true
    install-appmap-library: false

    # Create a patch file of changes made by the installer. This patch file will 
    # be stored as a build artifact and made available for download.
    # Default: true
    build-patch-file: false

    # Path specification to use when creating the patch file. If the patch file 
    # includes files that you don't want to commit, you can use this option to 
    # exclude them.
    # Default: ". ':(exclude,top)vendor' ':(exclude,top)node_modules'"
    diff-path-spec: "':(exclude,top)virtualenv'"

    # Enable verbose logging of CLI subcommands. You can use the standard GitHub
    # Action log level option to control verbosity of this Action itself.
    # Default: false
    verbose: true
```

## Outputs

The action provides these outputs:

- `patch`: Patch file of changes made by the installer.
- `appmap-dir`: Directory containing recorded AppMaps; this information can also be obtained from the appmap_dir entry in the `appmap.yml` configuration file.

## Examples

Set the `project-type` to ensure the AppMap library is installed via the correct package manager. Commit the installation changes to your project.

```
- uses: actions/checkout@v4
  with:
    ref: ${{ github.event.pull_request.head.ref }}

... Install programming language and package manager

- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    project-type: bundler
- name: Commit changes
  uses: EndBug/add-and-commit@v9
```

If your project is already configured for AppMap, use `install-appmap-library: false` to skip the install of the libraries and only install the CLI tools which are required for later steps:

```
- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    install-appmap-library: false
```

For more examples, refer to the [AppMap example projects](https://appmap.io/docs/setup-appmap-in-ci/example-projects.html)

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
