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
    const { prompts, branch } = _pak;

    const log = logger(!!verbose);
    
    try {        
        const hasChanges = await branch.hasChanges();
        const hasUntracked = await branch.hasUntracked();
    
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
                log(await branch.addAndStageAllChanges());                
            }            
        }
    
        let commitMessage = await prompts.input({
            message: 'Please enter a commit message',
        });

        const id = await branch.parseIdFromCurrent();
        log(await branch.commit(id, commitMessage));

        console.log('Committed changes to local and remote branch!');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

function logger(verbose: boolean){
    return (input: string): void => {
        if(!verbose){
            return;
        }

        console.log(input);
    }
}
