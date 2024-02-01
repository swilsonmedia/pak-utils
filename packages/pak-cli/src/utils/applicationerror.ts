import chalk from "chalk";
import { get as emojiGet } from "node-emoji";

export default function applicationError(error: unknown){
    console.error(wrap(`${chalk.hex('#FF0000')(emojiGet('x'))} ${error instanceof Error ? error.message : error}`));
    process.exit(1);
}

function wrap(message: string){
    return `\n${message}\n`;
}
