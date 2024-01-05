import user from './user.js';

export default async function getBranchById(id) {
    const username = await user();
    return `users/${username}/fb-${id}`;
}