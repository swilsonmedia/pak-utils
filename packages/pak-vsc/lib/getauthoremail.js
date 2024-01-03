import execPromise from './helpers/exec.js';

export default async function getAuthorEmail() {
    const { stderr, stdout } = await execPromise(`git config --get user.email`);

    if (stderr) {
        throw new Error(stderr);
    }

    return stdout;
}