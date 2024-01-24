import { Argv } from 'yargs';
import { BranchUtils, BugzClient, MiddlewareHandlerArguments, SelectPrompt, StoreConfigProps, VCS } from '../types.js';

interface Handler {
    select: SelectPrompt,
    vcs: VCS,
    branch: BranchUtils,
    bugzClient: BugzClient
}

export const cmd = 'switch';

export const description = 'Switch between branches';

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
        });
}
interface US {
    userSettings: StoreConfigProps, 
    verbose: boolean
}
export function makeHandler({
        select,
        vcs,
        branch,
        bugzClient
    }: Handler
){
    return async ({ verbose, userSettings }:  MiddlewareHandlerArguments) => {
        const client = bugzClient({
            token: userSettings.token,
            origin: userSettings.origin
        });

        const cases = await client.listCases({cols: ['sTitle']});
        const branches = await branch.getBranches(userSettings.username, userSettings.branch, await vcs.listBranches(true));
        const casesMap = new Map(cases.map((bug: any )=> [bug.ixBug, bug.sTitle]));
        const choices = branches.map(b => {
            let key = b;

            if(branch.isBugBranchName(b)){
                const id = branch.getBugIdFromBranchName(b);

                if(casesMap.has(id)){
                    key = `${key} - ${casesMap.get(id)}`
                }
            }

            return {
                name: key,
                value: b
            }
        });

        const chosenBranch = await select({
            'message': 'What branch do you want to switch to?',
            'choices': choices
        });

        const response = await vcs.switchToBranch(chosenBranch);

        if(verbose){
            console.log(response);
        }
    }
}


