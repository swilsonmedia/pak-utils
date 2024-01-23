import runCommand from './helpers/command.js';

export default async function getCurrentBranch() {
    return await runCommand(`git branch --show-current`);
}