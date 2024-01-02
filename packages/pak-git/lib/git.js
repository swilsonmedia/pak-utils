
export default function makeGit(execPromise) {
    return Object.freeze({
        add,
        commit,
        checkout,
        deleteLocalBranch,
        deleteRemoteBranch,
        logForAuthor,
        mergeSquashed,
        merge,
        pull,
        push,
        showCurrentBranch,
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

    async function logForAuthor(max = 100) {
        const { stderr, stdout } = await execPromise(`git log -n ${max} --author=$(git config --get user.email) --pretty=oneline`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }

    async function mergeSquashed(branch) {
        if (!branch) {
            throw new Error(`A branch argument is required.`);
        }

        const { stderr, stdout } = await execPromise(`git merge --squash ${branch}`);

        if (stderr) {
            throw new Error(stderr);
        }

        return stdout;
    }

    async function merge(branch) {
        if (!branch) {
            throw new Error(`A branch argument is required.`);
        }

        const { stderr, stdout } = await execPromise(`git merge ${branch} -m "Merging ${branch} to branch"`);

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

    async function showCurrentBranch() {
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





