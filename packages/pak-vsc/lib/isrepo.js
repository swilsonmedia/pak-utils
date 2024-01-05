import execPromise from './helpers/exec.js';

export default async function isRepo() {
    try {
        const { stderr } = await execPromise('git rev-parse --git-dir');
        return !stderr; 
    } catch (error) {
        return false;
    }
}