import { Argv, Arguments} from 'yargs';
import * as vcs from '../../../pak-vcs/dist/index.js';
import * as branch from '../utils/branch.js';
import createClient from 'pak-bugz';

interface Handler {
    confirm: prompts.ConfirmPrompt,
    input: prompts.InputPrompt,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient
}

export const cmd = 'commit';

export const description = 'Commit change to local and remote';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`)
        .options({
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        })
}

export function makeHandler({
        confirm,
        input,
        vcs,
        branch
    }: Handler
){
    return async ({ verbose }: Arguments) => {
        if (!await vcs.isRepo()) {
            console.error('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const log = logger(!!verbose);

        const currentStatus = await vcs.status();
        const currentBranch = await vcs.getCurrentBranch();

        if (/nothing\sto\scommit/gi.test(currentStatus)) {
            console.error('No changes to commit');
            process.exit(1);
        }

        if (/untracked|Changes\snot\sstaged\sfor\scommit/gi.test(currentStatus)) {
            log('You have untracked or unstaged changes')

            const wantToStage = await confirm({ 
                message: 'Do you want to include unstaged changes in this commit?',
                default: false
            });

            if (wantToStage) {
                log(await vcs.add('.'));                
            }            
        }

        let commitMessage = await input({
            message: 'Please enter a commit message',
        });

        if(branch.isBugBranchName(currentBranch)){
            const caseId = branch.getBugIdFromBranchName(currentBranch);
            commitMessage = buildCommitMessage(caseId, commitMessage);
        }

        log(await vcs.commit(commitMessage));
        log(await vcs.push());

        console.log('Committed changes to local and remote branch!');
    }

    function logger(verbose: boolean){
        return (input: string): void => {
            if(!verbose){
                return;
            }

            console.log(input);
        }
    }

    function buildCommitMessage(caseId: string | number, commitMessage: string){
        return `BugzId: ${caseId} - ${commitMessage}`;
    }
}


