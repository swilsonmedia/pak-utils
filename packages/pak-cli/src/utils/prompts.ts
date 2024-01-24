import inquirer from "inquirer";

export async function select({ message, choices }: prompts.SelectPromptParams): Promise<string> {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        type: 'list',
        message,
        choices
    });

    return answer;
}

export async function input({ message, default: defaultValue }: prompts.GenericPromptParams): Promise<string> {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        message,
        type: 'input',
        default: defaultValue
    });

    return answer;
}

export async function confirm({ message, default: defaultValue }: prompts.GenericPromptParams): Promise<string> {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        message,
        type: 'confirm',
        default: defaultValue
    });

    return answer;
}