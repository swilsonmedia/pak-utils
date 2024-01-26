import {VCS} from "../types.js";

export default function versionControlUtilities(vcs: VCS, defaultBranch: string){
    const switchTo = async (branchName: string) => await vcs.switchToBranch(branchName);

    const checkout = async (branchName: string) => {
        return [
            await vcs.checkout(branchName),
            await vcs.setUpstream(branchName)
        ].join('\n')
    };

    const log = async () => await vcs.logForAuthorEmail(await vcs.getAuthorEmail());

    const switchToDefault = async () => await switchTo(defaultBranch);

    const hasUntrackedChanges = async () => {
        return /untracked|Changes\snot\sstaged\sfor\scommit/gi.test(await vcs.status());
    }

    const hasChanges = async () => {
        return !/nothing\sto\scommit/gi.test(await vcs.status());
    }

    return {
        add: vcs.add,
        checkout,
        cherryPick: vcs.cherryPick,
        commit: vcs.commit,
        currentBranch: vcs.getCurrentBranch,
        deleteBranch: vcs.deleteBranch,
        hasChanges,
        hasUntrackedChanges,
        branches: vcs.listBranches,
        log,
        merge: vcs.merge,
        pull: vcs.pull,
        push: vcs.push,
        status: vcs.status,
        switchTo,
        switchToDefault,
    };
}