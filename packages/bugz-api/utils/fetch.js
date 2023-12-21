import fetch from 'node-fetch';
import xml2js from 'xml2js';

async function parseXMLResponse(response) {
    const parser = new xml2js.Parser();

    return await parser.parseStringPromise(response);
}

export async function fetchXMLAPI(url) {
    if (!url) {
        throw new Error('fetchXMLAPI requires a url parameter')
    }
    const response = await fetch(url);
    const xml = await response.text();
    const result = await parseXMLResponse(xml);

    if (result?.response?.error?.length) {
        throw new Error(result?.response?.error[0]._);
    }

    return unwrap(result.response);
}


function unwrap(obj){
    if(typeof obj === 'string'){
        return obj;
    }

    if(Array.isArray(obj)){
        const arr = obj.map(a => unwrap(a));
        return arr.length === 1 && typeof arr[0] === 'string' ? arr[0] : arr;
    }

    const entries = Object.entries(obj);

    if(!entries.length){
        return obj;
    }

    return Object.entries(obj).reduce((o, [key, value]) => {
        if(key === '$'){
            return {
                ...o,
                ...value
            }
        }

        o[key] = unwrap(value);
        return o;
    }, {});
}