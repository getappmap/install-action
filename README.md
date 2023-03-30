# getappmap/install-appmap

GitHub action to install AppMap.

- Install the AppMap tools (CLI)
- Install the AppMap library for the language and build system (e.g. Java + Maven, Ruby + Bundler,
  JS + yarn, etc).
- Configure the AppMap library by creating a default _appmap.yml_.

AppMap configuration can also be explicitly provided via `appmap-config` parameter.

On completion, a diff of the git repo is attached as a GitHub artifact. You can also add the
following step to your workflow to commit the changes automatically:

```
      - name: Commit changes
        uses: EndBug/add-and-commit@v9
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
