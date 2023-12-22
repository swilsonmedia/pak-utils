import fogBugzFetch from '../utils/fogbugzfetch.js';

const types = {
    SAVED: 'saved',
    SHARED: 'shared',
    BUILTIN: 'builtin'
}

export async function list() {
    const response = await fogBugzFetch({
        cmd: 'listFilters',
    });

    return Array.isArray(response.filters) ? response.filters[0].filter : response;
}

function typeFilter(type) {
    return async () => {
        const response = await list();

        return Array.isArray(response) ? response.filter(f => f.type === type) : response;
    }
}

export const listSaved = typeFilter(types.SAVED);
export const listShared = typeFilter(types.SHARED);
export const listBuiltIn = typeFilter(types.BUILTIN);
