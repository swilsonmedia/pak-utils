import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

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

export async function handler({ verbose, _pak }: MiddlewareHandlerArguments){
    const { versionControl, prompts, branch } = _pak;

    const log = logger(!!verbose);

    const currentBranch = await versionControl.currentBranch();
    const hasChanges = await versionControl.hasChanges();
    const hasUntracked = await versionControl.hasUntrackedChanges();

    if (!hasChanges) {
        console.error('No changes to commit');
        process.exit(1);
    }

    if (hasUntracked) {
        log('You have untracked or unstaged changes')

        const wantToStage = await prompts.confirm({ 
            message: 'Do you want to include unstaged changes in this commit?',
            default: false
        });

        if (wantToStage) {
            log(await versionControl.add('.'));                
        }            
    }

    let commitMessage = await prompts.input({
        message: 'Please enter a commit message',
    });

    if(branch.isUserBranch(currentBranch)){
        const caseId = branch.findBranchId(currentBranch);

        if(!caseId){
            console.error('An Id could not be discovered from ${currentBranch}');
            process.exit(1);
        }

        commitMessage = buildCommitMessage(caseId, commitMessage);
    }

    log(await versionControl.commit(commitMessage));
    log(await versionControl.push());

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


