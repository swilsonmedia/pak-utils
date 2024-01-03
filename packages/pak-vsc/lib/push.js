import execPromise from './helpers/exec.js';

export default async function push() {
    const { stderr } = await execPromise('git push');

    if (stderr) {
        throw new Error(stderr);
    }
}