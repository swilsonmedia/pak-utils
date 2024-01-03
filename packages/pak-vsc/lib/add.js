import execPromise from './helpers/exec.js';

export default async function add(str = '.') {
    await execPromise(`git add ${str}`);
}