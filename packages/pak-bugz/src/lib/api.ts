
const MAX_DEFAULT_RESULTS = 100;

interface CaseFields {
    'sTitle'?: string,
    'ixProject'?: string | number,
    'ixPersonAssignedTo'?: string | number,
    'plugin_customfields_at_fogcreek_com_casexmilestoneh849'?: '1.Case Pending' | '2.Research and Design' | '3.Coding in Progress' | '5.Ready for Review' | '6.Code Review Complete - Ready to merge' | '7.Tagging in Progress (TP Required)' | '8.Release Built - Ready for QA Validation' | '9.Release Complete',
    'plugin_customfields_at_fogcreek_com_readyxforxsprintxqaj71b'?: 1 | 0,
    'plugin_customfields_at_fogcreek_com_qaxtestablek42'?: 'Yes' | 'No',
    'plugin_customfields_at_fogcreek_com_casexsummaryp32b'?: string,
}

export interface EditableCaseFields extends CaseFields {
    'sEvent'?: string,
}

interface ViewCaseFields extends CaseFields {
    'events'?: string,
    'latestEvent': string, 
    'plugin_customfields': any,  
}

type CaseColumnType = keyof ViewCaseFields | 'events' | 'latestEvent' |'plugin_customfields';

export interface GenericCaseProps {
    cols?: CaseColumnType[]
    max?: number
}

export interface ListCasesProps extends GenericCaseProps{
    sFilter?: string
}

export default function makeAPI(post: APIPost){

    async function listPeople(){
        const { data } = await post({cmd: 'listPeople'});
        return data.people;
    }

    async function viewPerson(id: number){
        const { data } = await post({cmd: 'viewPerson', ixPerson: id});
        return data.person;
    }

    async function listFilters(){
        const { data } = await post({cmd: 'listFilters'});
        
        return data.filters;
    }

    async function listProjects(){
        const { data } = await post({cmd: 'listProjects'});
        
        return data.projects;
    }

    async function listCases(params?: ListCasesProps){
        const { data } = await post({
            cmd: 'listCases',
            max: MAX_DEFAULT_RESULTS,
            ...params
        });

        return data.cases
    }

    async function search(searchQuery: string, params?: GenericCaseProps){
        const { data } = await post({
            cmd: 'search', 
            q: searchQuery, 
            max: MAX_DEFAULT_RESULTS,
            ...params
        });

        return data.cases;
    }

    async function viewCase(id: string|number, params?: GenericCaseProps){
        const { data } = await post({
            cmd: 'viewCase',
            ixBug: id,
            ...params
        });

        return data.case;
    }

    async function edit(id: string|number, params: EditableCaseFields){
        const { data } = await post({
            cmd: 'edit',
            ixBug: id,
            ...params
        });

        return data.case;
    }

    return {
        edit,
        listCases,
        listPeople,
        listProjects,
        viewCase,
        viewPerson,
        listFilters,
    }
}
