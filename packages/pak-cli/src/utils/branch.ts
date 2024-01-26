const compose = <T extends any[]>(...functions: T) => {
  return <U>(input: U): U => {
    return functions.reduceRight((acc, fn) => {
      return fn(acc);
    }, input);
  };
};

function unique(arr: any[]){
    return [...new Set(arr)];
}

function isReleaseTag(branch: string){
    return branch.includes('releasetags');
}

function isRecentReleaseTag(branchName: string) {
    return isReleaseTag(branchName) && isWithinTimeFrame(diffInDaysFromToday(findDateFromString(branchName)))
}

function releaseBranches(branches: string[]){
    return branches.filter(isRecentReleaseTag);
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
    const results = /\d+\/\d+\/\d+/.exec(str);
    return Array.isArray(results) ? results[0] : undefined; 
}

function makeBranchNameBuild(prefix: string){
    return (id: number) => `${prefix}${id}`
}

function findDefaultBranch(branches: string[]){
    return branches.find(branchName => /^(main|master)$/.test(branchName));
}

function isLocal(branchName: string){
    return !branchName.includes('remotes/');
}

function localBranches(branches: string[]){
    return branches.filter(isLocal);
}

function isRemote(branchName: string){
    return branchName.includes('remotes/');
}

function remoteBranches(branches: string[]){
    return branches.filter(isRemote);
}

function removeRemoteString(branchName: string){
    return branchName.replace('remotes/origin/', '')
}

function removeRemoteStrings(branches: string[]){
    return branches.map(removeRemoteString);
}

function isDefault(branchName: string){
    return  /^(main|master)$/.test(branchName)
}

function removeDefaultBranch(branches: string[]){
    return branches.filter(branchName => !isDefault(branchName));
}

function makeIsUserBranch(expression: string){
    return (branchName: string) => new RegExp(expression, 'i').test(branchName);
}

function makeFindBranchId(expression: string){
    const regex = new RegExp(expression);
    return (branch: string) => {
        const values = regex.exec(branch);
        return values && values.length > 1 ? values[1] : undefined;
    }
}

function removeHead(branches: string[]){
    return branches.filter(brancheName => !brancheName.includes('HEAD'))
}

export default function branchUtilities(listBranches: () => Promise<string[]>, userBranchNamePrefix: string){
    const userExpression = `${userBranchNamePrefix.replace(/(\/|\-)/gi, '\\$1')}(\\d+)`;

    const isUserBranch = makeIsUserBranch(userExpression);
    const userBranches = (branches: string[]) => branches.filter(isUserBranch);
    const findBranchId = makeFindBranchId(userExpression);

    const local = compose(unique, localBranches, removeDefaultBranch, removeHead, userBranches);
    const remote = compose(unique, removeRemoteStrings, remoteBranches, removeDefaultBranch, removeHead, userBranches);
    const release = compose(unique, removeRemoteStrings, removeHead, releaseBranches);
    const branches = compose(unique, removeRemoteStrings, removeHead)

    const getBranches = async () => branches(await listBranches());
    const getLocalUserBranches = async () => local(await listBranches());
    const getRemoteUserBranches = async () => remote(await listBranches());
    const getReleaseBranches = async () => release(await listBranches())

    return {
        defaultBranchName: async () => findDefaultBranch(await listBranches()),
        buildBranchName: makeBranchNameBuild(userBranchNamePrefix),
        getBranches,
        getLocalUserBranches,        
        getRemoteUserBranches,
        getReleaseBranches,        
        getIdsFromBranches: (branches: string[])  => {
            return [
                ...new Set(branches.map(findBranchId)
                    .filter(id => !!id && id !== undefined)
                    .map(id => Number(id))
                )
            ];
        },
        findBranchId,
        isUserBranch
    };
}