import { exec } from 'child_process';
import { promisify } from 'util';
import makeGit from './lib/git.js';

const execPromise = promisify(exec);
const git = makeGit(execPromise);

export default git;
