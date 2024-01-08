import runCommand from './helpers/command.js';

export default async function setUpstream(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    return await runCommand(`git push -u origin ${branch}`);
}