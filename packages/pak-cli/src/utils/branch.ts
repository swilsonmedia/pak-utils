import {VCS} from "../types.js";

const compose = <T extends any[]>(...functions: T) => {
  return <U>(input: U): U => {
    return functions.reduceRight((acc, fn) => {
      return fn(acc);
    }, input);
  };
};

const REMOTE_STRING = 'remotes/origin/';
const RELEASE_STRING = 'releasetags/';
const MESSAGE_PREFIX = 'BugzId: ';
const MESSAGE_SEPARATOR = ' - ';

function unique(arr: any[]){
    return [...new Set(arr)];
}

function isReleaseTag(branch: string){
    return branch.includes(RELEASE_STRING)
}

function isRecentReleaseTag(branchName: string) {
    return isReleaseTag(branchName) && isWithinTimeFrame(diffInDaysFromToday(findDateFromString(branchName)))
}

function isWithinTimeFrame(days: number) {
    return days < 45;
}

function diffInDaysFromToday(date = Intl.DateTimeFormat('en-US').format(new Date())) {
    const compare = new Date(date);
    const today = new Date();

    return (today.getTime() - compare.getTime()) / (1000 * 3600 * 24);
}

function findDateFromString(str: string) {
    const results = /\d\/\d\/\d/.exec(str);
    return Array.isArray(results) ? results[0] : undefined; 
}

interface BaseBranchItem {
    name: string,
    isLocal: boolean,
    isRemote: boolean,
}

interface DefaultBranchItem extends BaseBranchItem {
    type: 'default'
}

interface ReleaseBranchItem extends BaseBranchItem {
    type: 'release',
    release: string
    }

interface CaseBranchItem extends BaseBranchItem {
    type: 'case',
    id: number
}

type BranchItem =  DefaultBranchItem | ReleaseBranchItem | CaseBranchItem | never;

function findDefaultBranch(branches: string[]){
    return branches.find(branchName => /^(main|master)$/.test(branchName));
}

function joinLogs(...msgs: string[]){
    return msgs.join('\n\n');
}

export default async function branchUtilities(vcs: VCS, userName: string, ){
    const BRANCH_NAME_PREFIX = `users/${userName}/fb-`;

    const buildBranchName = (id: number) => {
        return `${BRANCH_NAME_PREFIX}${id}`;
    }

    function buildMessage(id: number, message: string){
        return `${MESSAGE_PREFIX}${id}${MESSAGE_SEPARATOR}${message}`;
    }
    
    const defaultBranch = findDefaultBranch(await vcs.listBranches(true));
 
    if(!defaultBranch){
        throw new Error('Could not discover default branch');        
    }

    const listBranches = async (): Promise<BranchItem[]> => {
        const branches = (await vcs.listBranches(true))
                            .filter(branch => !branch.includes('HEAD'))
                            .filter(branch => {
                                return !isReleaseTag(branch) || isRecentReleaseTag(branch)
                            });

        const isRemote = (branch: string) => branch.includes(REMOTE_STRING);
        const removeRemotePrefix = (branch: string) => branch.replace(REMOTE_STRING, '');

        const remotes = branches
            .filter(isRemote)
            .map(removeRemotePrefix);

        const locals = branches.filter(branch => !isRemote(branch));

        const uniqueBranchNames = unique(branches.map(removeRemotePrefix));

        return uniqueBranchNames.map(branch => {
            const data = {
                name: branch,
                isLocal: locals.includes(branch),
                isRemote: remotes.includes(branch)
            };

            if(branch.includes(BRANCH_NAME_PREFIX)){
                return {
                    ...data,
                    type: 'case',
                    id: +branch.replace(BRANCH_NAME_PREFIX, '')
                }
            }

            if(isReleaseTag(branch)){
                return {
                    ...data,
                    type: 'release',
                    release: branch.replace(RELEASE_STRING, '')
                }
            }

            if(branch === defaultBranch){
                return {
                    ...data,
                    type: 'default'
                }
            }  
            
            return [] as never;
        });
    };

    const switchTo = async (input: number | string | never) => {
        let branchName = typeof input === 'number'
                    ? buildBranchName(input)
                    : input;

        return await vcs.switchToBranch(branchName);
    };

    const commit = async (id: number, message: string) => {
        return joinLogs(
            await vcs.commit(buildMessage(id, message)),
            await vcs.push()
        );
    };

    const merge = async (id: number, message: string) => {
        const branchName = buildBranchName(id);

        return joinLogs(
            await switchTo(defaultBranch),
            await vcs.pull(),
            await switchTo(id),
            await vcs.merge(defaultBranch, buildMessage(id, 'merging master to branch'), false),
            await switchTo(defaultBranch),
            await vcs.merge(branchName, '', true),   
            await commit(id, message)     
        );
    };

    const deleteBranch = async (id: number) => {
        const branchName = buildBranchName(id);

        const branch = (await listBranches())
                        .find(branch => branch.type === 'case' && branch.name.replace(BRANCH_NAME_PREFIX, '') === id.toString());

        const logs = [];

        if(!branch){
            throw new Error(`Could not find a branch with the id of ${id} to delete.`);
        }

        if(branch.isLocal){
            logs.push(await vcs.deleteLocalBranch(branch.name));
        }
        
        if(branch.isRemote){            
            logs.push(await vcs.deleteRemoteBranch(branch.name));
        }

        return joinLogs(...logs);
    }

    const listReleases = async () => {
        return (await listBranches())
                .filter(branch => branch.type === 'release')
                .map(({name, release}: any) => release.replace(/(\d+)\/(\d+)\/(\d+)/, "$2/$3/$1"))
                .sort((a: any, b: any) => {
                    return new Date(b).getTime() - new Date(a).getTime();
                });
    }

    const log = async () => {
        return await vcs.logForAuthorEmail(await vcs.getAuthorEmail());
    }

    const logCaseCheckins = async (id: number) => {
        const checkins = await log();       
        const bugReg = new RegExp(`${MESSAGE_PREFIX.replace(':', '\\:')}${id}\\s\\-\\s`, 'gi');

        return checkins.split('\n')
            .filter(log => {
                return bugReg.test(log);
            })
            .map(log => {
                const parts = log.split(bugReg);

                return{
                    log,
                    hash: parts[0].trim(),
                    message: parts[1].trim()
                };
            })
    };

    const findUnmergedReleaseCommits = async (id: number, release: string) => {
        const targetRelease = release.replace(/(\d+)\/(\d+)\/(\d+)/, "$3/$1/$2");

        console.log(targetRelease);
        const releaseBranch = (await listBranches())
                                    .find(branch => branch.type === 'release' && branch.name.includes(targetRelease));
        if(!releaseBranch){
            throw new Error(`Could not locate a release branch for ${release}`);
        }

        await switchTo(defaultBranch);

        const mainLog = await logCaseCheckins(id);

        await switchTo(releaseBranch.name);

        const releaseHashes = (await logCaseCheckins(id)).map(item => item.hash);

        return mainLog.filter(item => !releaseHashes.includes(item.hash));
    };

    const hasUntracked = async () => {
        return /untracked|Changes\snot\sstaged\sfor\scommit/gi.test(await vcs.status());
    }

    const hasChanges = async () => {
        return !/nothing\sto\scommit/gi.test(await vcs.status());
    }

    const addAndStageAllChanges = async () => await vcs.add('.');

    const checkout = async (id: number) => {
        const branchName = buildBranchName(id);
        return joinLogs(
            await vcs.checkout(branchName),
            await vcs.setUpstream(branchName)
            )
    };

    const getExistingBugIds = async () => {
        return (await listBranches())
            .filter(branch => branch.isLocal && branch.type === "case")
            .map((branch: any) => +branch.id); 
    };

    const parseIdFromCurrent = async () => {
        const branch = await vcs.getCurrentBranch();
        
        if(!branch.includes(BRANCH_NAME_PREFIX)){
            throw new Error(`Branch ${branch.trim()} is not a user case branch`);
        }

        const match = branch.match(/\d+/g);

        if(!match){
            throw new Error(`An id could not be parsed from ${branch}`);
        }

        return +match[0];       
    }

    const pushCommitToRelease = async (commitHash: string, releaseBranch: string) => {
        const target = releaseBranch.replace(/(\d+)\/(\d+)\/(\d+)/, `${RELEASE_STRING}$3/$1/$2`);

        return joinLogs(
            await switchTo(target),
            await vcs.pull(),
            await vcs.cherryPick(commitHash),
            await vcs.push(),
            await switchTo(defaultBranch)
        );
    };

    return {
        addAndStageAllChanges,
        checkout,
        commit,
        delete: deleteBranch,
        findUnmergedReleaseCommits,
        getExistingBugIds,
        hasUntracked,
        hasChanges,
        listBranches,
        listReleases,
        logCaseCheckins,
        parseIdFromCurrent,
        pushCommitToRelease,
        merge,
        switchTo
    }
 }