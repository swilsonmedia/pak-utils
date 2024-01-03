import execPromise from './helpers/exec.js';

export default async function add(str = '.') {
    const { stderr } = await execPromise(`git add ${str}`);

    if (stderr) {
        throw new Error(stderr);
    }
}