interface StoreConfigProps { 
    username: string,    
    branch: string,
    token: string,
    origin: string 
}

type StoreReturnType<T> = {
    get: <K extends keyof T>(key: K) => T[K],
    has: <K extends keyof T>(key: K) => boolean,
    set: <K extends keyof T>(key: K, value: T[K]) => void
}

type StoreConfig = StoreReturnType<StoreConfigProps>

type QuestionsFunc = {
    [K in keyof StoreConfigProps]: () => Promise<StoreConfigProps[K]>
}

namespace prompts {
    interface GenericPromptParams {
        message: string,
        default?: string | number | boolean
    }

    interface SelectPromptParams extends GenericPromptParams {
        choices: string[] | { name: string, value: string }[]
    }

    type SelectPrompt = (params: SelectPromptParams) => Promise<string>;
    type ConfirmPrompt = (params: GenericPromptParams) => Promise<string>;
    type InputPrompt = (params: GenericPromptParams) => Promise<string>;

    interface All {
        select: SelectPrompt,
        confirm: ConfirmPrompt,
        input: InputPrompt
    }
}