# Pak CLI

Pak CLI wraps Bug & VCS APIs into a set utilities designed to make your day of developing a little better!  A deliberately opinionated workflow.  If you need to rebase or cherry pick from branches for merging to master, you'll need to resort to the using those GIT commands directly. 

![Terminal display of basic pak usage](./docs/pak-no-command.png)

## Install and Build

See install and build steps [here](../../readme.md).

## Usage

### Help 

To list all available commands.  See screen shot above.

```sh
pak
```

or

```sh
pak --help
```

### switch
This command will prompt you with list available branches that you can switch to (master, release branches & bug branches).  It will switch the repo to the selected branch.

#### Example
```sh
pak switch
```

### merge
This command will prompt you with list available bug branches where the case is in step 6. (ok to merge).  It will merged code from your selected branch to master and walk you through prompts to assign case to Buildmaster and set step to 7.

#### Example
```sh
pak merge
```

### cleanup

This command will prompt you with list available bug branches that can be deleted.  It will delete the local and remote branch of the selected.

#### Example
```sh
pak cleanup
```

### checkout
This command will prompt you with list available bugs from Fogbugz that don't have branches yet.  It will create a local and remote branch from your selection and update your bug to step 3.

#### Example
```sh
pak checkout
```

### commit
This command will walk you through prompts to add unstaged changes, add a message, and options to move to code review.

#### Example
```sh
pak commit
```

### config
Set config properties.


#### Usage

```
Options:
      --version     Show version number                                                    [boolean]
  -h, --help        Show help                                                              [boolean]
  -u, --username  The username used in GIT branch names.  ex: users/{username}/fb-12345    [string]
  -b, --branch    Default branch name. Common are "master" or "main"                       [string]
  -t, --token     The FogBugz API access token                                             [string]
  -o, --origin    The origin part of your FogBugz site.  Ex:  http://www.fogbugz.com       [string]
  -f, --filter    The FogBugz filter you want to get case results for                      [string]
```

#### Example
```sh
pak config -u myusername
```