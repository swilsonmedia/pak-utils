import { readFileSync } from 'fs';

export default function () {
    const json = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)).toString());

    return {
        ...json,
        binName: Object.keys(json.bin)[0]
    }
};
