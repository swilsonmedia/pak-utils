import { Argv, Arguments} from 'yargs';
import * as vcs from '../../../pak-vcs/dist/index.js';
import * as branch from '../utils/branch.js';
import createClient from 'pak-bugz';

interface Handler {
    userSettings: StoreConfigProps,
    select: prompts.SelectPrompt,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient
}

export default function makeCleanUpCommand({
        userSettings,
        select,
        vcs,
        branch,
        createClient
    }: Handler
){
    const cmd = 'cleanup';

    const description = 'Delete old branches from local and remote';

    function builder(yargs: Argv) {
        yargs
            .usage(`pak ${cmd}`)
            .options({
                'v': {
                    alias: 'verbose',
                    type: 'boolean',
                    description: 'Display more logging',
                    default: false
                }
            });
    }

    async function handler({ verbose }: Arguments){
        if (!await vcs.isRepo()) {
            console.error('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const log = logger(!!verbose);


        const branches = await branch.getBranches(userSettings.username, userSettings.branch, await vcs.listBranches(true));

        const client = createClient({
            token: userSettings.token,
            origin: userSettings.origin
        });

        const casesList = await client.listCases({cols: ['sTitle']});

        if (!casesList.length) {
            console.error('No cases were found');
            process.exit(1);
        }

        const branchesNoDefault = branches.filter(b => b !== userSettings.branch);
        const remoteBranches = branchesNoDefault.filter(b => b.includes('remotes/origin'));
        const localBranches = branchesNoDefault.filter(b => !b.includes('remotes/origin'));
        const existingCaseIds = branches.map(b => branch.getBugIdFromBranchName(b));
        const choices = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug.toString()));

        if(!choices.length){
            console.error('No cases branches were found to remove');
            process.exit(1);
        }

        const chosenCaseId = await select({
            message: 'Select a case that would you like to create a branch for?',
            choices: choices.map((c: {ixBug: string, sTitle: string}) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });

        const branchName = branch.buildBranchName(userSettings.username, chosenCaseId);

        await cleanup(branchName, branches, !!verbose);
    }

    async function cleanup(branchName: string, branches: string[], verbose=false){
        const verboseLogger = logger(verbose);
        const remoTeStringMatch = 'remotes/origin';
        const isLocal = branches
                            .filter(b => !b.includes(remoTeStringMatch))
                            .find(b => b.includes(branchName));
        const isRemote = branches
                            .filter(b => b.includes(remoTeStringMatch))
                            .find(b => b.includes(branchName));
        
        verboseLogger(await vcs.switchToBranch(userSettings.branch));

        if(isLocal){
            verboseLogger(await vcs.deleteLocalBranch(branchName));
            console.log(`"${branchName}" was removed from local`);
        }
        
        if(isRemote){
            verboseLogger(await vcs.deleteRemoteBranch(branchName));
            console.log(`"${branchName}" was removed from remote`);
        }
    }

    return {
        cmd,
        description,
        builder,
        handler,
        cleanup
    }; 

    function logger(verbose: boolean){
        return (input: string): void => {
            if(!verbose){
                return;
            }

            console.log(input);
        }
    }
}


