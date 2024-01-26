import add from './lib/add.js';
import checkout from './lib/checkout.js';
import cherryPick from './lib/cherrypick.js';
import commit from './lib/commit.js';
import deleteBranch from './lib/deletebranch.js';
import getAuthorEmail from './lib/getauthoremail.js';
import getCurrentBranch from './lib/getcurrentbranch.js';
import logForAuthorEmail from './lib/logforauthoremail.js';
import merge from './lib/merge.js';
import listBranches from './lib/listbranches.js';
import pull from './lib/pull.js';
import push from './lib/push.js';
import setUpstream from './lib/setupstream.js';
import status from './lib/status.js';
import switchToBranch from './lib/switchtobranch.js';
import isRepo from './lib/isrepo.js';

const vcs = { add, checkout, cherryPick, commit, deleteBranch, getAuthorEmail, getCurrentBranch, logForAuthorEmail, merge, listBranches, pull, push, setUpstream, status, switchToBranch, isRepo }

export default vcs;

export { add, checkout, cherryPick, commit, deleteBranch, getAuthorEmail, getCurrentBranch, logForAuthorEmail, merge, listBranches, pull, push, setUpstream, status, switchToBranch, isRepo };

