import execPromise from './helpers/exec.js';

export default async function push() {
    const { stdout } = await execPromise('git push');

    return stdout;
}