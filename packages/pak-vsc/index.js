import add from './lib/add.js';
import checkout from './lib/checkout.js';
import commit from './lib/commit.js';
import deleteLocalBranch from './lib/deletelocalbranch.js';
import deleteRemoteBranch from './lib/deleteremotebranch.js';
import getAuthorEmail from './lib/getauthoremail.js';
import getCurrentBranch from './lib/getcurrentbranch.js';
import logForAuthorEmail from './lib/logforauthoremail.js';
import merge from './lib/merge.js';
import pull from './lib/pull.js';
import push from './lib/push.js';
import setUpstream from './lib/setupstream.js';
import status from './lib/status.js';
import switchToBranch from './lib/switchtobranch.js';
import isRepo from './lib/isrepo.js';


process.on('uncaughtException', error => {
    console.log(`pak-vsc command:\n"${error.cmd}"\n\nError:\n${error.stderr}`);
    process.exit(1);
});

export { add, checkout, commit, deleteLocalBranch, deleteRemoteBranch, getAuthorEmail, getCurrentBranch, logForAuthorEmail, merge, pull, push, setUpstream, status, switchToBranch, isRepo }












