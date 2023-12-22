import fogBugzFetch from '../utils/fogbugzfetch.js';

const types = {
    SAVED: 'saved',
    SHARED: 'shared',
    BUILTIN: 'builtin'
}

export async function list() {
    return await fogBugzFetch({
        cmd: 'listFilters',
    });
}

function typeFilter(type) {
    return async () => {
        const response = await list();

        if (Array.isArray(response.filters)) {
            response.filters[0].filter = response.filters[0].filter.filter(f => f.type === type);
        }

        return response;
    }
}

export const listSaved = typeFilter(types.SAVED);
export const listShared = typeFilter(types.SHARED);
export const listBuiltIn = typeFilter(types.BUILTIN);
