import execPromise from './helpers/exec.js';

export default async function merge(branch, message = '', squash = false) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    let commandOptions = [];

    if (squash) {
        commandOptions.push('--squash')
    }

    commandOptions.push(branch)

    if (message) {
        commandOptions.push(`-m "${message}"`);
    }

    const { stderr, stdout } = await execPromise(`git merge ${commandOptions.join(' ')}`);

    if (stderr) {
        throw new Error(stderr);
    }

    return stdout;
}