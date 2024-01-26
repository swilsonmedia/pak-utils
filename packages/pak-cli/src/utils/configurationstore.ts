import { access, writeFile, readFile, constants } from 'fs/promises';
import {StoreReturnType} from '../types.js';

async function hasAccess(file: string){
    try {
        await access(file, constants.W_OK | constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
}

export default async function createStore<T extends Record<string, any>>(filePath: string): Promise<StoreReturnType<T>>{

    let store = new Map();
    const canReadWrite = await hasAccess(filePath);

    if(canReadWrite){
        const data = JSON.parse(await readFile(filePath, 'utf8'));

        Object.entries(data).forEach(([key, value]) => store.set(key, value));
    }

    return {
        get: (key: keyof T) => store.get(key),
        has: (key: keyof T) => store.has(key),
        set: async(key: keyof T, value) => {
            store.set(key, value);

            await writeFile(filePath, JSON.stringify(Object.fromEntries(store.entries()), null, 2), { flag: 'w', encoding: 'utf8'});
        }
    }
}