
export default function makeVCS(execPromise) {
    return Object.freeze({
        add,
        commit,
        checkout,
        deleteLocalBranch,
        deleteRemoteBranch,
        getAuthorEmail,
        logForAuthorEmail,
        merge,
        pull,
        push,
        getCurrentBranch,
        status,
        switchToBranch,
        setUpstream
    });

    async function add(str = '.') {
        const { stderr } = await execPromise(`git add ${str}`);

        if (stderr) {
            throw new Error(stderr);
        }
    }

    async function commit(message) {
        if (!message) {
            throw new Error(`A message argument is required.`);
        }

        const { stderr, stdout } = await execPromise(`git commit -m "${message}"`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }

    async function checkout(branch) {
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

    async function deleteLocalBranch(branch) {
        if (!branch) {
            throw new Error(`A branch argument is required.`);
        }

        const { stderr, stdout } = await execPromise(`git branch -D ${branch}`);

        if (stderr) {
            throw stderr;
        }

        return stdout;
    }

    async function deleteRemoteBranch(branch) {
        if (!branch) {
            throw new Error(`A branch argument is required.`);
        }

        const { stderr, stdout } = await execPromise(`git push -d origin ${branch}`);

        if (stderr && !stderr.includes('deleted')) {
            throw stderr;
        }

        if (stderr && !stdout) {
            return stderr;
        }

        return stdout;
    }

    async function getAuthorEmail() {
        const { stderr, stdout } = await execPromise(`git config --get user.email`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }

    async function logForAuthorEmail(email, max = 100) {
        if (!email) {
            throw new Error('An author email is required');
        }

        const { stderr, stdout } = await execPromise(`git log -n ${max} --author=${email} --pretty=oneline`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }


    async function merge(branch, message = '', squash = false) {
        if (!branch) {
            throw new Error(`A branch argument is required.`);
        }

        let commandOptions = [];

        if (squash) {
            commandOptions.push('--squash')
        }

        commandOptions.push(branch)

        if (message) {
            commandOptions.push(`-m "${message}"`);
        }

        const { stderr, stdout } = await execPromise(`git merge ${commandOptions.join(' ')}`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }

    async function pull() {
        const { stderr } = await execPromise('git pull');

        if (stderr) {
            throw new Error(stderr);
        }
    }

    async function push() {
        const { stderr } = await execPromise('git push');

        if (stderr) {
            throw new Error(stderr);
        }
    }

    async function getCurrentBranch() {
        const { stderr, stdout } = await execPromise(`git branch --show-current`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }

    async function status() {
        const { stderr, stdout } = await execPromise('git status');

        if (stderr) {
            throw stderr;
        }

        return stdout;
    }

    async function switchToBranch(branch) {
        if (!branch) {
            throw new Error(`A branch argument is required.`);
        }

        const { stderr, stdout } = await execPromise(`git switch ${branch}`);

        if (/Switched|Already/.test(stderr)) {
            return stderr;
        }

        if (stderr) {
            throw stderr;
        }

        return stdout;
    }

    async function setUpstream(branch) {
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

            output.push(checkout.stderr);
        }

        return output.join('\n');
    }
}





