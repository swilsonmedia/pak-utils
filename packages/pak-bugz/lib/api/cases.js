import fogBugzFetch from '../utils/fogbugzfetch.js';

const MAX_DEFAULT_RECORDS = 100;

const commands = {
    VIEW_CASE: 'viewCase',
    LIST_CASES: 'listCases',
    SEARCH: 'search',
    EDIT: 'edit'
};

export const columns = {
    'sTitle': 'sTitle',
    'ixProject': 'ixProject',
    'ixPersonAssignedTo': 'ixPersonAssignedTo',
    'plugin_customfields_at_fogcreek_com_casexmilestoneh849': 'plugin_customfields_at_fogcreek_com_casexmilestoneh849',
    'plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b': 'plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b',
    'plugin_customfields_at_fogcreek_com_qaxtestablek42': 'plugin_customfields_at_fogcreek_com_qaxtestablek42',
    'plugin_customfields_at_fogcreek_com_casexsummaryp32b': 'plugin_customfields_at_fogcreek_com_casexsummaryp32b',
    'sEvent': 'sEvent'
};

const defaultOptions = {
    max: MAX_DEFAULT_RECORDS,
}

function makeEditable(response) {
    const addEdit = (c) => {
        c.edit = async parameters => await edit(c.ixBug, parameters);
    };

    if (response.case) {
        addEdit(response.case);
    }

    if (Array.isArray(response.cases)) {
        response.cases.forEach(c => addEdit(c));
    }

    return response;
}

function formatCasesResponse(response) {
    const { case: cases, count, totalHits } = response.cases[0];
    return {
        ...response,
        cases,
        count,
        totalHits
    };
}

function formatCaseResponse(response) {
    return {
        'case': response.case[0]
    };
}

export async function list(filter = 'inbox', parameters) {
    let sFilter = filter;
    let params = parameters;

    if (typeof filter !== 'string') {
        sFilter = 'inbox';
        params = filter;
    }

    const response = await fogBugzFetch({
        ...defaultOptions,
        sFilter,
        cmd: commands.LIST_CASES,
        ...params
    });

    if (response.error) {
        return response;
    }

    return makeEditable(formatCasesResponse(response));
}

export async function search(query, parameters) {
    if (!query) {
        throw new TypeError('cases.search requires a query argument');
    }

    const response = await fogBugzFetch({
        ...defaultOptions,
        q: query,
        cmd: commands.SEARCH,
        ...parameters
    });

    if (response.error) {
        return response;
    }

    return makeEditable(formatCasesResponse(response));
}

export async function view(id, parameters) {
    if (!id) {
        throw new TypeError('cases.view requires an id argument');
    }

    const response = await fogBugzFetch({
        ...defaultOptions,
        ixbug: id,
        cmd: commands.VIEW_CASE,
        ...parameters
    });

    return makeEditable(formatCaseResponse(response));
}

export async function edit(id, parameters = {}) {
    if (!id) {
        throw new TypeError('cases.edit requires an id argument');
    }

    const editable = Object.values(columns);
    const invalidColumn = Object.keys(parameters).find(parameter => !editable.includes(parameter));

    if (invalidColumn) {
        throw new TypeError(`"${invalidColumn}" is an editable column`);
    }

    const response = await fogBugzFetch({
        ...defaultOptions,
        ixbug: id,
        cmd: commands.EDIT,
        ...parameters
    });

    return formatCaseResponse(response);
}


export function getCustomFieldOptions(column) {
    switch (column) {
        case columns.plugin_customfields_at_fogcreek_com_casexmilestoneh849:
            return [
                "1.Case Pending",
                "2.Research and Design",
                "3.Coding in Progress",
                "5.Ready for Review",
                "6.Code Review Complete - Ready to merge",
                "7.Tagging in Progress (TP Required)",
                "8.Release Built - Ready for QA Validation",
                "9.Release Complete"
            ]
            break;

        case columns.plugin_customfields_at_fogcreek_com_qaxtestablek42:
            return ['Yes', 'No']
            break;

        case columns.plugin_customfields_at_fogcreek_com_qaxtestablek42:
            return [1, 0]
            break;

        default:
            break;
    }
} 