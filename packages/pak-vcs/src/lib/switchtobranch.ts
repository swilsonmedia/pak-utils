import runCommand from './helpers/command.js';

export default async function switchToBranch(branch: string) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    return await runCommand(`git switch ${branch}`);
}