import fogBugzFetch from '../utils/fogbugzfetch.js';

const filterProps = {
    EMAIL: 'sEmail',
    NAME: 'sFullName'
};

const commands = {
    LIST: 'listPeople',
    VIEW: 'viewPerson'
}

export async function list() {
    const response = await fogBugzFetch({
        cmd: commands.LIST
    });

    return Array.isArray(response.people) ? response.people[0].person : response;
}

function filterPeopleByStringProperty(propName) {
    return async (propValue) => {
        const response = await list();

        if (Array.isArray(response)) {
            return response.filter(person => {
                const val = propValue.toLowerCase().trim();

                return (propName === filterProps.NAME && /\s+/gi.test(val)) || (propName === filterProps.EMAIL && /@/gi.test(val))
                    ? person[propName].toLowerCase().trim() === val
                    : person[propName].toLowerCase().trim().includes(val);
            });
        }

        return response
    }
}

export const byName = filterPeopleByStringProperty(filterProps.NAME);
export const byEmail = filterPeopleByStringProperty(filterProps.EMAIL);

export async function byId(id) {
    const response = await fogBugzFetch({
        'cmd': commands.VIEW,
        'ixPerson': id
    });

    return response.person[0];
}
