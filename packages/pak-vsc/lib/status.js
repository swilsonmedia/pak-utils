import runCommand from './helpers/command.js';

export default async function status() {
    return await runCommand('git status');
}