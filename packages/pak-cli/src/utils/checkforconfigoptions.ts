export default async function checkForConfigOptions(store: StoreConfig, questions: QuestionsFunc){
    const config = {
        username: store.get('username'),
        branch: store.get('branch'),
        token: store.get('token'),
        origin: store.get('origin')
    };
    
    const objectKeys = <Obj extends object>(obj: Obj): (keyof Obj)[] => {
        return Object.keys(obj) as (keyof Obj)[];
    }
    
    const configKeys = objectKeys(config);

    for(const key of configKeys){
        if(!config[key] && key in questions){
            const value = await questions[key]();
            config[key] = value;
            await store.set(key, value);
        }
    }

    return config;
}