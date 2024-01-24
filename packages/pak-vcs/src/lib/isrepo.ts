import runCommand from './helpers/command.js';

export default async function isRepo() {
    try {        
        const response = await runCommand('git rev-parse --git-dir');

        return !!response; 
    } catch (error) {
        return false;
    }
}