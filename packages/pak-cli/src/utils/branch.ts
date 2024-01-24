export function buildBranchUser(username: string) {
    return `users/${username}/fb-`;
}

export function buildBranchName(username: string, id: number | string) {
    return `${buildBranchUser(username)}${id}`;
}

export function isRecentReleaseTag(branch: string) {
    return isWithinTimeFrame(diffInDaysFromToday(findDateFromString(branch)))
}

export function isWithinTimeFrame(days: number) {
    return days < 45;
}

export function diffInDaysFromToday(date = Intl.DateTimeFormat('en-US').format(new Date())) {
    const compare = new Date(date);
    const today = new Date();

    return (today.getTime() - compare.getTime()) / (1000 * 3600 * 24);
}

export function findDateFromString(str: string) {
    const results = /\d+\/\d+\/\d+/.exec(str);
    return Array.isArray(results) ? results[0] : undefined; 
}

export function getBranches(username: string, defaultBranch: string, branches: string[]){
    return [...new Set(branches
        .filter(
            b =>
                !b.includes('HEAD') &&
                (
                    b.includes(buildBranchUser(username))
                    || b.includes(defaultBranch)
                    || (b.includes('releasetags') && isRecentReleaseTag(b))
                )
        )
        .map(b => b.trim())
        .map(b => b.replace('* ', '')))];
}

export function getBugIdFromBranchName(branchName: string) {
    const result = /fb\-(\d+)/gi.exec(branchName);
    return result ? result[1] : '';
}

export function isBugBranchName(branchName: string) {
    return /fb\-(\d+)/gi.test(branchName);
}

