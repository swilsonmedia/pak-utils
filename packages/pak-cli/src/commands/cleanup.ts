import { Argv } from 'yargs';
import {BranchUtils, CleanUpProps, BugzClient, SelectPrompt, VCS, MiddlewareHandlerArguments} from '../types.js';

interface Handler {
    select: SelectPrompt,
    vcs: VCS,
    branch: BranchUtils,
    bugzClient: BugzClient
}

export default function makeCleanUpCommand({
        select,
        vcs,
        branch,
        bugzClient
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

    async function handler({ verbose, userSettings }: MiddlewareHandlerArguments){
        const log = logger(!!verbose);

        const branches = await branch.getBranches(userSettings.username, userSettings.branch, await vcs.listBranches(true));

        const client = bugzClient({
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

        await cleanup({
            branchName, 
            branches, 
            defaultBranch: userSettings.branch,
            verbose: !!verbose
        });
    }

    async function cleanup({
        branchName, 
        branches, 
        defaultBranch,
        verbose
    }: CleanUpProps){
        const verboseLogger = logger(verbose);
        const remoTeStringMatch = 'remotes/origin';
        const isLocal = branches
                            .filter(b => !b.includes(remoTeStringMatch))
                            .find(b => b.includes(branchName));
        const isRemote = branches
                            .filter(b => b.includes(remoTeStringMatch))
                            .find(b => b.includes(branchName));
        
        verboseLogger(await vcs.switchToBranch(defaultBranch));

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


