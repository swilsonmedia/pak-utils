import execPromise from './helpers/exec.js';

export default async function commit(message) {
    if (!message) {
        throw new Error(`A message argument is required.`);
    }

    const { stderr, stdout } = await execPromise(`git commit -m "${message}"`);

    if (stderr) {
        throw new Error(stderr);
    }

    return stdout;
}