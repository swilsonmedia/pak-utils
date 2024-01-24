import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default execPromise;
