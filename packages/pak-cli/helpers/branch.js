
function buildBranchUser(username) {
    return `users/${username}/fb-`;
}

export function buildBranchName(username, id) {
    return `${buildBranchUser(username)}${id}`;
}

export function isUserBranch(username, branch) {
    return branch.includes(buildBranchUser(username));
}