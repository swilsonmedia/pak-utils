import * as people from './api/people.js';
import * as cases from './api/cases.js';
import * as filters from './api/filters.js';
import applyAPIConfig from './utils/wrapconfig.js';

function createBugzClient(config){

    return {
        people: {
            list: applyAPIConfig(people.listPeople, config),
            byId: applyAPIConfig(people.byId, config),
            byEmail: applyAPIConfig(people.byEmail, config),
            byName: applyAPIConfig(people.byName, config)
        },
        cases: {
            edit: applyAPIConfig(cases.edit, config),
            list: applyAPIConfig(cases.list, config),
            search: applyAPIConfig(cases.search, config),
            view: applyAPIConfig(cases.view, config),
            byId: applyAPIConfig(cases.byId, config),
            columns: cases.columns,            
        },
        filters: {
            list: applyAPIConfig(filters.list, config),
            listSaved: applyAPIConfig(filters.listSaved, config),
            listShared: applyAPIConfig(filters.listShared, config),
            listBuiltIn: applyAPIConfig(filters.listBuiltIn, config)
        },
        customFields: {
            getOptions: cases.getCustomFieldOptions,
            fields: cases.customFields
        }
    }
}

export default createBugzClient