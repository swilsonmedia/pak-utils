import { Argv, Arguments} from "yargs";
import * as vcs from "../../../pak-vcs/dist/index.js";
import * as branch from "../utils/branch.js";
import createClient from "pak-bugz";

interface Handler {
    store: StoreConfig, 
    questions: QuestionsFunc,
    select: prompts.SelectPrompt,
    vcs: typeof vcs,
    branch: typeof branch,
    createClient: typeof createClient
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

export function makeHandler({
        store, 
        questions, 
        select,
        vcs,
        branch,
        createClient
    }: Handler
){
    return async ({ verbose }: Arguments) => {
        if (!await vcs.isRepo()) {
            console.error('Not a git repository (or any of the parent directories)');
            process.exit(1);
        }

        const config = {
            username: store.get('username'),
            branch: store.get('branch'),
            token: store.get('token'),
            origin: store.get('origin')
        };

        
        const objectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => {
            return Object.keys(obj) as (keyof Obj)[];
        }
        
        const configKeys = objectKeys(config);

        for(const key of configKeys){
            if(!config[key] && key in questions){
                const value = await questions[key]();
                config[key] = value;
                await store.set(key, value);
            }
        }

        const client = createClient({
            token: config.token,
            origin: config.origin
        });

        const cases = await client.listCases({cols: ['sTitle']});
        const branches = await branch.getBranches(config.username, config.branch, await vcs.listBranches(true));
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


