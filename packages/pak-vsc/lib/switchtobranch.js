import execPromise from './helpers/exec.js';

export default async function switchToBranch(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    const { stderr, stdout } = await execPromise(`git switch ${branch}`);

    if (/Switched|Already/.test(stderr)) {
        return stderr;
    }

    if (stderr) {
        throw stderr;
    }

    return stdout;
}