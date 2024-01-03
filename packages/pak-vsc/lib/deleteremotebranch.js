import execPromise from './helpers/exec.js';

export default async function deleteRemoteBranch(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    const { stderr, stdout } = await execPromise(`git push -d origin ${branch}`);

    if (stderr && !stderr.includes('deleted')) {
        throw stderr;
    }

    if (stderr && !stdout) {
        return stderr;
    }

    return stdout;
}