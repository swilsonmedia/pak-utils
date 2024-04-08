import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'merge';

export const description = 'Merge a case by passing a case number and commit message';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);
}

export async function handler({ _pak: { runTasks, branch, prompts, bugz, applicationError } }: MiddlewareHandlerArguments){
    try {
        const existingCaseIds = await branch.getExistingBugIds();
        const casesList = (await bugz.listCases({cols: ['sTitle', 'plugin_customfields_at_fogcreek_com_casexmilestoneh849']}))
                            .filter((bug: any) => bug.plugin_customfields_at_fogcreek_com_casexmilestoneh849.includes('6.Code Review Complete'));

        const existingCasesList = casesList.filter((c: any) => existingCaseIds.includes(c.ixBug));
        
        if (!existingCasesList.length) {   
            applicationError('No cases were found');
        }

        const bugId = await prompts.select({
            message: 'Select a case that would you like to merge?',
            choices: existingCasesList.map((c: any) => ({
                name: `${c.ixBug}: ${c.sTitle}`,
                value: c.ixBug
            }))
        });

        await runTasks({
            title: `Switch to branch for case # ${bugId}`,
            task: async () => await branch.switchTo(+bugId)
        });
    
        const checkins = await branch.logCaseCheckins(+bugId);

        if (!checkins.length) {
            applicationError(`There were no commits found for bug id ${bugId}`);
        }

        const NEW_MESSAGE = 'Enter a new message';

        const selectedMessage = await prompts.select({
            message: 'Please select a previous comment or enter a new one.',
            choices: [NEW_MESSAGE].concat(checkins.map(log => log.message))
        });

        let commitMessage = selectedMessage;

        if (commitMessage === NEW_MESSAGE) {
            const selectedMessage = await prompts.input({
                message: 'Please enter a commit message',
            });

            commitMessage = selectedMessage;
        }

        await runTasks([
            {
                title: `Merge case # ${bugId}`,
                task: async () => await branch.merge(+bugId, commitMessage)                
            },
            {
                title: `Delete branch`,
                task: async () => await branch.delete(+bugId)
            }
        ]);

        const markCaseForRelease = await prompts.confirm({
            message: 'Send case to BuildMaster for release?',
            default: true
        });

        if(markCaseForRelease){
            await runTasks({
                title: `Assign case # ${bugId} to BuildMaster and set to case milestone 7!}`,
                task: async () => await bugz.edit(bugId, {    
                    ixPersonAssignedTo: 51,
                    plugin_customfields_at_fogcreek_com_casexmilestoneh849: '7.Tagging in Progress (TP Required)',
                    sEvent: 'Ready for release.'
                })
            });
        }

        const mergeAnswer = await prompts.confirm({
            message: 'Merge to release tag?',
            default: false
        });

        if (mergeAnswer) {
            const releaseBranches = await branch.listReleases();

            const selectedRelease = await prompts.select({
                message: 'Select the release branch?',
                choices: releaseBranches
            });
            
            const choices = (await branch.findUnmergedReleaseCommits(+bugId, selectedRelease))
                                .map(commit => ({
                                    name: commit.log,
                                    value: commit.hash
                                }));
                
            const commitHash = await prompts.select({
                message: 'Select the commit you would like to release?',
                choices
            });        

            await runTasks({
                title: `Merge ${commitHash} for release on ${selectedRelease}!`,
                task: async () => await branch.pushCommitToRelease(commitHash, selectedRelease)
            });
        }
    } catch (error) {
        applicationError(error);
    }
}
