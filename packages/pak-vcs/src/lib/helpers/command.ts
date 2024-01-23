import execPromise from './exec.js';

export default async function runCommand(cmd: string){
    try {
        const {stderr, stdout} = await execPromise(cmd);
        const out = [];

        if(stdout){
            out.push(stdout)
        }
        
        if(stderr){
            out.push(stderr)
        }

        return out.join('\n');
    } catch ({stderr}: any) {
        throw new Error(stderr);
    }
}