import { listBranches } from 'pak-vsc';
import user from './user.js';

function buildBranchUser(username) {
    return `users/${username}/fb-`;
}

export function buildBranchName(username, id) {
    return `${buildBranchUser(username)}${id}`;
}

export function getBugIdFromBranchName(branchName) {
    return /fb\-(\d+)/gi.exec(branchName)[1] ?? '';
}

export function isBugBranchName(branchName) {
    return /fb\-(\d+)/gi.test(branchName);
}

export async function getBranchList(includeRemote = false) {
    const username = await user();

    return (await listBranches(includeRemote))
        .filter(
            b =>
                !b.includes('HEAD') &&
                (
                    isUserBranch(username, b)
                    || b.includes(process.env.DEFAULT_BRANCH)
                    || (b.includes('releasetags') && isRecentReleaseTag(b))
                )
        )
        .map(b => b.trim())
        .map(b => b.replace('* ', '').replace('remotes/origin/', ''));
}

function isUserBranch(username, branch) {
    return branch.includes(buildBranchUser(username));
}

function isRecentReleaseTag(branch) {
    return isWithinTimeFrame(diffInDaysFromToday(findDateFromString(branch)))
}

function isWithinTimeFrame(days) {
    return days < 45;
}

function findDateFromString(str) {
    return /\d+\/\d+\/\d+/.exec(str)[0]
}

function diffInDaysFromToday(date) {
    const compare = new Date(date);
    const today = new Date();

    return (today.getTime() - compare.getTime()) / (1000 * 3600 * 24);
}