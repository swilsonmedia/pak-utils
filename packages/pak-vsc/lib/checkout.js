import execPromise from './helpers/exec.js';

export default async function checkout(branch) {
    if (!branch) {
        throw new Error(`A branch argument is required.`);
    }

    const output = [];

    const checkout = await execPromise(`git checkout -b ${branch}`);
    
    output.push(checkout.stdout);

    if (checkout.stderr) {
        if (!checkout.stderr.includes('Switched')) {
            throw checkout.stderr;
        }

        output.push(checkout.stderr);
    }

    return output.join('\n');
}