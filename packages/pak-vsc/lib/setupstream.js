import execPromise from './helpers/exec.js';

export default async function setUpstream(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    const output = [];

    const upstream = await execPromise(`git push -u origin ${branch}`);

    output.push(upstream.stdout);

    if (upstream.stderr) {
        if (!upstream.stderr.includes('remote: Create')) {
            throw upstream.stderr;
        }

        output.push(upstream.stderr);
    }

    return output.join('\n');
}