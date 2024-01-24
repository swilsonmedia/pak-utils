import runCommand from './helpers/command.js';

export default async function merge(branch: string, message = '', squash = false) {
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

    return await runCommand(`git merge ${commandOptions.join(' ')}`);
}