import execPromise from './helpers/exec.js';

export default async function deleteLocalBranch(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    const { stderr, stdout } = await execPromise(`git branch -D ${branch}`);

    if (stderr) {
        throw stderr;
    }

    return stdout;
}