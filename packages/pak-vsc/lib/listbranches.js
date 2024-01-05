import execPromise from './helpers/exec.js';

export default async function listBranches(includeRemote = false) {

    const { stderr, stdout } = await execPromise(`git branch${includeRemote ? ' -a' : ''}`);

    if (stderr) {
        throw stderr;
    }

    return stdout.split('\n');
}