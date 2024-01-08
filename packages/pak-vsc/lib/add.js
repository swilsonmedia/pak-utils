import runCommand from './helpers/command.js';

export default async function add(str = '.') {
    return await runCommand(`git add ${str}`)
}