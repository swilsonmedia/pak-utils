# Pak Utils

A monorepo of helpful Pak developer utilities.

## Install

Install dependencies.

```sh
npm install -ws
```

## Build

Builds all projects within ./packages and install Pak CLI so that `pak` is available in terminal.

```sh
npm run build
```

## [Pak Bugz](./packages/pak-bugz/readme.md)

An  API to interact with your FogBugz instance.

## [Pak CLI](./packages/pak-cli/readme.md)

A CLI to that wraps Bug & VCS APIs into a set of methods to improve workflow.

## [Pak VCS](./packages/pak-vcs/readme.md)

An API for interacting with a GIT version control system.
