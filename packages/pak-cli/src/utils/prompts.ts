import inquirer from "inquirer";
import {GenericPromptParams, SelectPromptParams} from "../types.js";

export async function select({ message, choices }: SelectPromptParams): Promise<string> {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        type: 'list',
        message,
        choices
    });

    return answer;
}

export async function input({ message, default: defaultValue }: {message: string, default?: string}): Promise<string> {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        message,
        type: 'input',
        default: defaultValue
    });

    return answer;
}

export async function confirm({ message, default: defaultValue }: {message: string, default?: boolean}): Promise<string> {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        message,
        type: 'confirm',
        default: defaultValue
    });

    return answer;
}


