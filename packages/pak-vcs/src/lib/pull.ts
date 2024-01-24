import runCommand from './helpers/command.js';

export default async function pull() {
    return await runCommand('git pull');
}