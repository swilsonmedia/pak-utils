import chalk from "chalk";
import { get as emojiGet } from "node-emoji";

export default function makeLogger(quiet=false, verbose=false){
    return {
        error: (error: unknown) => {
            logError(error);
        },
        success: (message: string) => {
            if(quiet || verbose){
                return;
            }

            log(`${chalk.green(emojiGet('heavy_check_mark'))} ${message}`);
        },
        log: (message: string) => {
            if(quiet || !verbose){
                return;
            }

            log(message);;
        }
    }
}

function wrap(message: string){
    return `\n${message}\n`;
}

export function logError(error: unknown){
    console.error(wrap(`${emojiGet('x')} ${error instanceof Error ? error.message : error}`));
}

export function log(message: string){
    console.log(wrap(message))
}