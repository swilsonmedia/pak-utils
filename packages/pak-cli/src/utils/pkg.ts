import { readFileSync } from 'fs';

export default function () {
    return JSON.parse(readFileSync(new URL('../../package.json', import.meta.url)).toString())
};

