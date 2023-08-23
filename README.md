# getappmap/install-appmap

To see a step-by-step example of how to install this action into your software project, [review the official AppMap Documentation](http://appmap.io/docs/analysis/in-github-actions).

This is a GitHub action to install and configure AppMap. It will do the following things:

- Install the AppMap tools (CLI)
- (Optional) Install the AppMap library for the language and build system (e.g. Java + Maven, Ruby + Bundler,
  JS + yarn, etc).
- (Optional) Configure the AppMap library by creating a default _appmap.yml_.

AppMap configuration can also be explicitly provided via `appmap-config` parameter.

On completion, a patch file of the changes applied to the repo is attached as a GitHub artifact. You
can also add the following step to your workflow to commit the changes automatically:

```
      - name: Commit changes
        uses: EndBug/add-and-commit@v9
```

## Prerequisites

Before running this action, ensure that the programming language and package manager used by your
project are installed and available.

## Usage

Set the `project-type` to ensure the AppMap library is installed via the correct package manager.

```
- name: Install AppMap tools
  uses: getappmap/install-action@v1
  with:
    project-type: bundler # Choose the type of your project here:
                        # bundler, maven, gradle, pip, pipenv, poetry,
                        # yarn, npm, etc.
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
