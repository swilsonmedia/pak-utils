import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'commit';

export const description = 'Commit change to local and remote';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak }: MiddlewareHandlerArguments){
    const { prompts, branch, logger } = _pak;
    
    try {        
        const id = await branch.parseIdFromCurrent();
        const hasChanges = await branch.hasChanges();
        const hasUntracked = await branch.hasUntracked();
        
        if (hasChanges) {
            throw new Error('No changes to commit');            
        }
    
        if (hasUntracked) {
            logger.log('You have untracked or unstaged changes')
    
            const wantToStage = await prompts.confirm({ 
                message: 'Do you want to include unstaged changes in this commit?',
                default: false
            });
    
            if (wantToStage) {
                logger.log(await branch.addAndStageAllChanges());                
            }            
        }
    
        let commitMessage = await prompts.input({
            message: 'Please enter a commit message',
        });

        logger.log(await branch.commit(id, commitMessage));

        logger.success('Committed changes to local and remote branch!');
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
}
