import { access, writeFile, readFile, constants } from 'fs/promises';

async function hasAccess(file: string){
    try {
        await access(file, constants.W_OK | constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
}

export default async function createStore<T extends Record<string, any>>(filePath: string): Promise<StoreReturnType<T>>{

    let store: any = {};
    const canReadWrite = await hasAccess(filePath);

    if(canReadWrite){
        store = {
            ...store,
            ...JSON.parse(await readFile(filePath, 'utf8'))
        }
    }

    return {
        get(key){
            return store[key];
        },
        has(key){
            return !!store[key];
        },
        async set(key, value){
            store[key] = value;

            await writeFile(filePath, JSON.stringify(store, null, 2), { flag: 'w', encoding: 'utf8'});
        }
    }
}