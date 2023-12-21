import fogBugzFetch from '../utils/fogbugzfetch.js';

const filterProps = {
    EMAIL: 'sEmail',
    NAME: 'sFullName'
};

export async function listPeople(config){       
    const response = await fogBugzFetch({
        'cmd': 'listPeople'
    }, config);

    return response.people[0].person; 
}

function filterPeopleByStringProperty(propName) {
    return async (propValue, config) => {
        const response = await listPeople(config);

        return response.filter(person => {
            const val = propValue.toLowerCase().trim();

            return (propName === filterProps.NAME && /\s+/gi.test(val)) || (propName === filterProps.EMAIL && /@/gi.test(val))
                ? person[propName].toLowerCase().trim() === val
                : person[propName].toLowerCase().trim().includes(val);
        });
    }
}

export const byName = filterPeopleByStringProperty(filterProps.NAME);
export const byEmail = filterPeopleByStringProperty(filterProps.EMAIL);

export async function byId(id, config){
    const response = await fogBugzFetch({ 'cmd': 'viewPerson', 'ixPerson': id }, config);

    return Array.isArray(response.person) ? response.person[0] : undefined;
}
