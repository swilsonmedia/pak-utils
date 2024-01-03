import execPromise from './helpers/exec.js';

export default async function pull() {
    const { stderr } = await execPromise('git pull');

    if (stderr) {
        throw new Error(stderr);
    }
}