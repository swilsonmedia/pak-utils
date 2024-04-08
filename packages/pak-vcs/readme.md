# Pak VCS

Pak VCS is an API for interacting with a GIT version control system.  It's a collection of utility methods.

## Install and Build

See install and build steps [here](../../readme.md).

## Methods

Available Methods:

* [add](#add)
* [checkout](#checkout)
* [cherryPick](#cherryPick)
* [commit](#commit)
* [deleteLocalBranch](#deleteLocalBranch)
* [deleteRemoteBranch](#deleteRemoteBranch)
* [getAuthorEmail](#getAuthorEmail)
* [getCurrentBranch](#getCurrentBranch)
* [logForAuthorEmail](#logForAuthorEmail)
* [merge](#merge)
* [listBranches](#listBranches)
* [pull](#pull)
* [push](#push)
* [setUpstream](#setUpstream)
* [status](#status)
* [switchToBranch](#switchToBranch)
* [isRepo](#isRepo)


### add

Adds a file to the repo.

#### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `addString`   | string |  (required) |


Example:
```js
const response = await vcs.add('example.txt')
```

#### Response
string

### checkout

Checks out a new branch.

| Property  | Type  | Description |
|-----------|-------|-------------|
| `branchName`   | string |  (required) |

Example:
```js
const response = await vcs.checkout('users/name/branch')
```

#### Response
string

### cherryPick

Cherry picks a hash into branch.

| Property  | Type  | Description |
|-----------|-------|-------------|
| `commitHash`   | string |  (required) |


Example:
```js
const response = await vcs.cherryPick('87ecdfb7c78a40a14d5643fb8f92ee74d0e7e330')
```

#### Response
string

### commit

Commits staged changes.

| Property  | Type  | Description |
|-----------|-------|-------------|
| `commitMessage`   | string |  (required) |

Example:
```js
const response = await vcs.commit('commit message')
```

#### Response
string

### deleteLocalBranch

Deletes local branch.

| Property  | Type  | Description |
|-----------|-------|-------------|
| `branchName`   | string |  (required) |

Example:
```js
const response = await vcs.deleteLocalBranch('users/name/branch')
```

#### Response
string

### deleteRemoteBranch

Deletes remote branch.

| Property  | Type  | Description |
|-----------|-------|-------------|
| `branchName`   | string |  (required) |


Example:
```js
const response = await vcs.deleteRemoteBranch('users/name/branch')
```

#### Response
string

### getAuthorEmail

Get the user's email.

Example:
```js
const response = await vcs.getAuthorEmail()
```

#### Response
string

### getCurrentBranch

Get current branch name. 

Example:
```js
const response = await vcs.getCurrentBranch()
```

#### Response
string

### logForAuthorEmail

Returns log for a user.

| Property  | Type  | Description |
|-----------|-------|-------------|
| `email`   | string |  (required) |
| `max`   | number |  default to 100 |


Example:
```js
const response = await vcs.logForAuthorEmail('example@nowhere.com', 10)
```

#### Response
string

### merge

Merge branch to current working branch.

#### Parameters

| Property  | Type  | Description |
|-----------|-------|-------------|
| `email`   | string |  (required) |
| `message` | string |  (required) |
| `squash`  | boolean |  default is true |


Example:
```js
const response = await vcs.merge('users/name/branch', 'commit message', true);
```

### listBranches

| Property  | Type  | Description |
|-----------|-------|-------------|
| `includeRemote`   | boolean |  default is false |

Example:
```js
const response = await vcs.listBranches()
```

#### Response
string

### pull

Pulls latests updateds from remote branch.

Example:
```js
const response = await vcs.pull()
```

#### Response
string

### push

Pushes commits to remote branch.

Example:
```js
const response = await vcs.push()
```

#### Response
string

### setUpstream

Sets up remote (up stream) branch connection.

Example:
```js
const response = await vcs.setUpstream()
```

#### Response
string

### status

Returns the currect status of a repo

Example:
```js
const response = await vcs.status()
```

#### Response
string

### switchToBranch

| Property  | Type  | Description |
|-----------|-------|-------------|
| `branchName`   | string |  (required) |

Example:
```js
const response = await vcs.switchToBranch('users/name/branch')
```

#### Response
string

### isRepo

Checks to see if the current directory is a repo.

Example:
```js
const response = await vcs.isRepo()
```

#### Response
boolean