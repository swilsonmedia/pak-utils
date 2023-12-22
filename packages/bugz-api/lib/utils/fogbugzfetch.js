import { fetchXMLAPI } from './fetch.js';
import globalOptions from '../globaloptions.js';

export default async function fogBugzFetch(parameters) {
    const urlParams = new URLSearchParams(Object.entries(parameters));
    const { token, origin } = globalOptions();

    return await fetchXMLAPI(`${origin}/api.asp?token=${token}&${urlParams.toString()}`);
}