import runCommand from './helpers/command.js';

export default async function cherryPick(commitHash) {
    if (!commitHash) {
        throw new Error('cherryPick requires a commit hash argument');
    }
    return await runCommand(`git cherry-pick ${commitHash}`);
}