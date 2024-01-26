import vcs from '@pak/vcs';
import createClient from '@pak/bugz';
import branchUtilities from './utils/branch.js';
import {makeCleanup} from './commands/cleanup.js';
import versionControlUtilities from './utils/versioncontrol.js';

export type VCS = typeof vcs;
export type BranchUtilities = ReturnType<typeof branchUtilities>;
export type VersionControl = ReturnType<typeof versionControlUtilities>;

export interface StoreConfigProps { 
    username: string,    
    token: string,
    origin: string,
    filter: string
}

export type StoreReturnType<T> = {
    get: <K extends keyof T>(key: K) => T[K],
    has: <K extends keyof T>(key: K) => boolean,
    set: <K extends keyof T>(key: K, value: T[K]) => void
}

export interface BaseHandlerArguments {
    verbose?: boolean
}

export interface MiddlewareHandlerArguments extends BaseHandlerArguments{
    _pak: {
        branch: BranchUtilities,
        prompts: Prompts,
        bugz: ReturnType<typeof createClient>,
        versionControl: VersionControl
    }
}

export type StoreConfig = StoreReturnType<StoreConfigProps>

export type QuestionsFunc = {
    [K in keyof StoreConfigProps]: () => Promise<StoreConfigProps[K]>
}

export interface GenericPromptParams {
    message: string,
    default?: string | number | boolean
}

export interface SelectPromptParams extends GenericPromptParams {
    choices: string[] | { name: string, value: string }[]
}

export type SelectPrompt = (params: SelectPromptParams) => Promise<string>;
export type ConfirmPrompt = (params: GenericPromptParams) => Promise<string>;
export type InputPrompt = (params: GenericPromptParams) => Promise<string>;

export interface Prompts {
    select: SelectPrompt,
    confirm: ConfirmPrompt,
    input: InputPrompt
}

export interface CleanUpProps {
    branchName: string, 
    branches: string[], 
    defaultBranch: string,
    vcs: VCS,
    verbose: boolean       
}

export type MakeCleanup = typeof makeCleanup;
