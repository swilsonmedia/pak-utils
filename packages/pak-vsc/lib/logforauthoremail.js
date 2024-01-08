import runCommand from './helpers/command.js';

export default async function logForAuthorEmail(email, max = 100) {
    if (!email) {
        throw new Error('An author email is required');
    }

    return await runCommand(`git log -n ${max} --author=${email.trim()} --pretty=oneline`);
}