import fs from 'fs';

export default function () {
    const json = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));

    return {
        ...json,
        binName: Object.keys(json.bin)[0]
    }
};
