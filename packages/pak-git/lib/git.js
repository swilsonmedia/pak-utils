import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function status(){
    const cmd = `git status`;
    const { stderr, stdout: message } = await execPromise(cmd);

    if(stderr){
        throw stderr;
    }

    return {
        cmd,
        message,
        changes: /changes/gi.test(message)
    };
}

export async function switchBranch(branch){
    if(!branch){
        throw new Error(`A branch argument is required.`);
    }
        
    const res = await status();

        console.log(`Changes ${res.message}: ${res.changes}`);

    // const { stderr, stdout } = await execPromise(`git switch ${branch}`);
    
    // if(/Switched|Already/.test(stderr) ){
    //     return stderr;
    // }

    // if(stderr){
    //     throw stderr;
    // }

    // return stdout;
}