import runCommand from './helpers/command.js';
import listBranches from './listbranches.js';

export default async function deleteLocalBranch(branchName: string) {
    if (!branchName) {
        throw new Error(`A branch argument is required.`);
    }

    const branches = await listBranches(true);
    const local = branches.find(branch => branch === branchName);
    const remote = branches
                    .filter(branch => 'remotes/origin/')
                    .find(branch => branch.includes(branchName));
    const responses = [];

    if(local){
        responses.push(await runCommand(`git branch -D ${branchName}`));
    }
    
    if(remote){
        responses.push(await runCommand(`git push -d origin ${branchName}`));
    }
    
    return responses.join('\n');
}