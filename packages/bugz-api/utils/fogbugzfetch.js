import { fetchXMLAPI } from './fetch.js';

export default async function fogBugzFetch(parameters, config){
    const urlParams = new URLSearchParams();

    if (!config?.domain || !config?.token){
        throw new Error('Configuration for domain or token were not found');
    }

    Object.entries(parameters).forEach(([key, value]) => {
        urlParams.set(key, value);
    });

    return await fetchXMLAPI(`${config.domain}/api.asp?&token=${config.token}&${urlParams.toString()}`);
}