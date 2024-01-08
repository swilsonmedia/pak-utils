import runCommand from './helpers/command.js';

export default async function getAuthorEmail() {
    return await runCommand(`git config --get user.email`);
}