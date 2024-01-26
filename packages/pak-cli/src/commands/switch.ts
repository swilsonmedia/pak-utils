import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

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

    export async function handler({ verbose, _pak: { branch, prompts, bugz, versionControl } }:  MiddlewareHandlerArguments){
        const cases = await bugz.listCases({cols: ['sTitle']});
        const branches = await branch.getBranches();
        const casesMap = new Map(cases.map((bug: any )=> [bug.ixBug, bug.sTitle]));
        const choices = branches.map(b => {
            let key = b;

            if(branch.isUserBranch(b)){
                const id = branch.findBranchId(b);

                if(casesMap.has(id)){
                    key = `${key} - ${casesMap.get(id)}`
                }
            }

            return {
                name: key,
                value: b
            }
        });

        const chosenBranch = await prompts.select({
            'message': 'What branch do you want to switch to?',
            'choices': choices
        });

        const response = await versionControl.switchTo(chosenBranch);

        if(verbose){
            console.log(response);
        }
    }


