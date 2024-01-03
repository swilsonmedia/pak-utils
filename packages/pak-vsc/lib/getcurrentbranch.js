import execPromise from './helpers/exec.js';

export default async function getCurrentBranch() {
    const { stderr, stdout } = await execPromise(`git branch --show-current`);

    if (stderr) {
        throw new Error(stderr);
    }

    return stdout;
}