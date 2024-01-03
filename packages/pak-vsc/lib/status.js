import execPromise from './helpers/exec.js';

export default async function status() {
    const { stderr, stdout } = await execPromise('git status');

    if (stderr) {
        throw stderr;
    }

    return stdout;
}