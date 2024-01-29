import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execPromise = promisify(exec);

export default async function openInBrowser(url: string){
    try {
        await execPromise(`${os.platform().includes('win32') ? 'start chrome': 'open'} ${url}`)
    } catch (error) {
        console.log(error);
    }
}