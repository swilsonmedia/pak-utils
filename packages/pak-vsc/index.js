import { exec } from 'child_process';
import { promisify } from 'util';
import makeVCS from './lib/vsc.js';

const execPromise = promisify(exec);
const git = makeVCS(execPromise);

export default git;
