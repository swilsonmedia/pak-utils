import execPromise from './helpers/exec.js';

export default async function logForAuthorEmail(email, max = 100) {
    if (!email) {
        throw new Error('An author email is required');
    }

    const { stderr, stdout } = await execPromise(`git log -n ${max} --author=${email} --pretty=oneline`);

    if (stderr) {
        throw new Error(stderr);
    }

    return stdout;
}