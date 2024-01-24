import vcs from 'pak-vcs';
import createClient from 'pak-bugz';
import * as branch from './utils/branch.js';

export type VCS = typeof vcs;
export type BugzClient = typeof createClient;
export type BranchUtils = typeof branch;

export interface StoreConfigProps { 
    username: string,    
    branch: string,
    token: string,
    origin: string 
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
    userSettings: StoreConfigProps
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
    verbose: boolean
}