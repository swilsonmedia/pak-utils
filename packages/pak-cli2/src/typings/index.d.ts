interface StoreConfig { 
    USERNAME: string,    
    DEFAULT_BRANCH: string,
    API_TOKEN: string,
    API_ORIGIN: string 
}

type StoreReturnType<T> = {
    get: <K extends keyof T>(key: K) => T[K],
    set: <K extends keyof T>(key: K, value: T[K]) => void
}

namespace prompts {
    interface GenericPromptParams {
        message: string,
        default?: string | number | boolean
    }

    interface SelectPromptParams extends GenericPromptParams {
        choices: string[]
    }

    type SelectPrompt = (params: SelectPromptParams) => Promise<string>;
    type ConfirmPrompt = (params: GenericPromptParams) => Promise<string>;
    type Input = (params: GenericPromptParams) => Promise<string>;

    interface All {
        select: SelectPrompt,
        confirm: ConfirmPrompt,
        input: Input
    }
}