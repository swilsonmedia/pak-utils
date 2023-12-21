import fogBugzFetch from '../utils/fogbugzfetch.js';

export const columns = {
    id: 'ixBug',
    title: 'sTitle', 
    project: 'ixProject', 
    assignedTo: 'ixPersonAssignedTo',
    caseMilestone: 'plugin_customfields_at_fogcreek_com_casexmilestoneh849',
    readyForSprintQA: 'plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b',
    qaTestable: 'plugin_customfields_at_fogcreek_com_qaxtestablek42',
    caseSummary: 'plugin_customfields_at_fogcreek_com_casexsummaryp32b',
    caseNotes: 'events',
    caseNote: 'sEvent'
};

export const customFields = {
    caseMilestone: columns.caseMilestone,
    readyForSprintQA: columns.readyForSprintQA,
    qaTestable: columns.qaTestable,
    caseSummary: columns.caseSummary,
}

const columnsMap = Object.entries(columns).reduce((o, [key, value]) => {
    o[value] = key;
    return o;
}, {});

const commands = {
    VIEW_CASE: 'viewCase',
    LIST_CASES: 'listCases',
    SEARCH: 'search',
    EDIT: 'edit'
}

export const list = command(commands.LIST_CASES);

export const search = command(commands.SEARCH);

export const view = command(commands.VIEW_CASE);

export async function edit(options={}, config){
    if(options.id){
        options[columns.id] = options.id;
        delete options.id
    }

    const columnValues = Object.values(columns);
    const invalidColumn = Object.keys(options).find(option => !columnValues.includes(option));

    if (invalidColumn){
        throw new TypeError(`"${invalidColumn}" is an editable column`);    
    }


    const query = mapOptions(options, columns);

    query.cmd = commands.EDIT;

    const response = await fogBugzFetch(query, config);

    return response;
}

export async function byId({id: search, columns}, config){
    const response = await list({ search, columns }, config);
    return response.cases[0];
}

function mapOptions(options, map){
    return Object.entries(options).reduce((o, [key, value]) => {
        if (map[key]) {
            o[map[key]] = value;
        } else {
            o[key] = value;
        }
        return o;
    }, {});
}

function command(cmd) {
    return async (options = {}, config) => {
        if(!config){
            config = options;
            options = {};
        }

        if (cmd === commands.LIST_CASES && !options.filter){
            options.filter = 'inbox';
        }
        
        const query = mapOptions(options, {
            search: 'q',
            filter: 'sFilter',
            columns: 'cols',
            id: 'ixBug'
        });

        query.cmd = cmd;

        if (query.cols) {
            query.cols = query.cols.join(',')
        }

        const response = await fogBugzFetch(query, config);

        if (cmd === commands.VIEW_CASE){
            return response.case[0]
        }

        return {
            ...response,
            cases: (response.cases[0].case || []).map(c => {
                return mapOptions(c, columnsMap);
            })
        };
    }
}

export function getCustomFieldOptions(column){
    switch (column) {
        case columns.caseMilestone:
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

        case columns.qaTestable:
            return ['Yes', 'No']
            break;

        case columns.readyForSprintQA:
            return [1, 0]
            break;
    
        default:
            break;
    }
} 