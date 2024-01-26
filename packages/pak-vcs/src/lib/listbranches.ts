import runCommand from './helpers/command.js';

export default async function listBranches(includeRemote = false) {
    return (await runCommand(`git branch${includeRemote ? ' -a' : ''}`))
        .split('\n')
        .filter(b => !!b)
        .map(b => b.replace('* ', '').trim())
}