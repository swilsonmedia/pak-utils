import fogBugzFetch from '../utils/fogbugzfetch.js';

const types = {
    SAVED: 'saved',
    SHARED: 'shared',
    BUILTIN: 'builtin'
}

export async function list(config){
    const response = await fogBugzFetch({
        'cmd': 'listFilters',
    }, config);

    return response.filters[0].filter;
}

export const listSaved = typeFilter(types.SAVED);
export const listShared = typeFilter(types.SHARED);
export const listBuiltIn = typeFilter(types.BUILTIN);

function typeFilter(type){
    return async (config) => {
        const response = await list(config);

        return response.filter(f => f.type === type);
    }
}

