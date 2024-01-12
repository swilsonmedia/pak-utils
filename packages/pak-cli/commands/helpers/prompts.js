import inquirer from "inquirer";

export async function select({ message, choices }) {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        type: 'list',
        message,
        choices
    });

    return answer;
}

export async function prompt({ message }) {
    const { answer } = await inquirer.prompt({
        name: 'answer',
        message,
        type: 'input'
    });

    return answer;
}

export async function confirm({ message, default: defaultValue }) {
    const input = {
        name: 'answer',
        message,
        type: 'confirm'
    };

    if (typeof defaultValue !== 'undefined') {
        input.default = defaultValue;
    }

    const { answer } = await inquirer.prompt(input);

    return answer;
}