import runCommand from './helpers/command.js';

export default async function push() {
    return await runCommand('git push');
}