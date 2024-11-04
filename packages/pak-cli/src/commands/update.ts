// sp && git switch master && pull && git switch fed/defaultfordev10 && git merge master -m "merging master" && push && git switch master

import { Argv } from 'yargs';
import { MiddlewareHandlerArguments } from '../types.js';

export const cmd = 'update';

export const description = 'Updates default dev box branch';

export function builder(yargs: Argv) {
    yargs
        .usage(`pak ${cmd}`);;
}

export async function handler({  _pak: { runTasks, branch, prompts, bugz, applicationError } }:  MiddlewareHandlerArguments){    
    try {
        await runTasks({
            title: `Updating developer environment's default branch`,
            task: async () => await branch.updateDevBoxBranch()
        });
    } catch (error) {
        applicationError(error);
    }
}


