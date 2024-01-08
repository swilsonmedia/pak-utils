import runCommand from './helpers/command.js';

export default async function checkout(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    return await runCommand(`git checkout -b ${branch}`);
}