import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'commit';

export const description = 'Commit change to local and remote';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak: { runTasks, prompts, branch, bugz, openInBrowser, applicationError } }: MiddlewareHandlerArguments){   
    try {        
        const hasChanges = await branch.hasChanges();
        const hasUntracked = await branch.hasUntracked();

        if (!hasChanges) {
            throw new Error('No changes to commit');            
        }
        
        if (hasUntracked) {
            console.log('You have untracked or unstaged changes')
            
            const wantToStage = await prompts.confirm({ 
                message: 'Do you want to include unstaged changes in this commit?',
                default: false
            });
            
            if (wantToStage) {
                await runTasks({
                    title: `Add untracked to staging`,
                    task: async () => await branch.addAndStageAllChanges()
                });                
            }            
        }
        
        const id = await branch.parseIdFromCurrent();
    
        let commitMessage = await prompts.input({
            message: 'Please enter a commit message',
        });

        await runTasks({
            title: 'Commit changes to local and remote branch!',
            task: async () => await branch.commit(id, commitMessage)
        });

        const readyForCR = await prompts.confirm({
            message: 'Are you ready to send case to code review?',
            default: false,
        });

        if(readyForCR){
            const here = await prompts.select({
                message: 'Would you like to fill notes here or online?  If you need to add images or include multiline responses, online is better for that.',
                choices: ['Terminal', 'Online'],
                default: 'Terminal'
            });

            if(here === 'Online'){
                await openInBrowser(`http://fogbugz01.smartpakequine.com/f/cases/edit/${id}`);
                return;
            }

            const teams = (await bugz.listPeople())
                .filter((person: any) => person.sFullName.includes('Team '))
                .map(({ixPerson, sFullName}: {ixPerson: number, sFullName: string}) => ({
                    value: ixPerson, 
                    name: sFullName
                }));

            const team = await prompts.select({
                message: 'Which code review team?',
                choices: teams,
            });

            const QATestable = await prompts.confirm({
                message: 'Is this QA testable?',
                default: true,
            });

            let summary: string[] = [];

            if(!QATestable){
                const notTestableNotes = await prompts.input({ message: 'Why is this case not testable?'});
                summary.push(`Not testable because:\n${notTestableNotes}`)
            }

            
            const changesLocation = await prompts.input({
                message: 'Where is the change? (URLs, DBs, Programs etc.)'
            });

            summary.push(`Where is the change? (URLs, DBs, Programs etc.):\n${changesLocation}`);
            
            const changesDescription = await prompts.input({
                message: 'What was the change?'
            });

            summary.push(`What was the change?:\n${changesDescription}`);
            
            const Acceptance = await prompts.input({
                message: 'Acceptance criteria (Happy path/steps to reproduce):'
            });

            summary.push(`Acceptance criteria (Happy path/steps to reproduce):\n${Acceptance}`);            
            
            const hasNotableRisks = await prompts.confirm({
                message: 'Any notable risks and other notes?',
                default: false
            });
            
            if(hasNotableRisks){
                const notableRisks = await prompts.input({
                    message: 'Enter notable risks and other notes here'
                });
                summary.push(`Notable risks and other notes:\n${notableRisks}`);      
            }


            const notesForReviewer = await prompts.input({
                message: 'Enter case notes'
            });

            await runTasks({
                title: `Assign case to code reviews and set milestone to step 5.`,
                task: async () => await bugz.edit(id, {
                    ixPersonAssignedTo: team,
                    plugin_customfields_at_fogcreek_com_casexmilestoneh849: '5.Ready for Review',
                    plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b: QATestable ? 1 : 0,
                    plugin_customfields_at_fogcreek_com_qaxtestablek42: QATestable ? 'Yes' : 'No',
                    plugin_customfields_at_fogcreek_com_casexsummaryp32b: summary.join('\n\n'),
                    sEvent: `Code review please. ${notesForReviewer}`        
                })
            });
        }
    } catch (error) {
        applicationError(error);
    }
}
