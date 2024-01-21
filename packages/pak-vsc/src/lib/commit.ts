import runCommand from './helpers/command.js';

export default async function commit(message: string) {
    if (!message) {
        throw new Error(`A message argument is required.`);
    }

    return await runCommand(`git commit -m "${message}"`);
}