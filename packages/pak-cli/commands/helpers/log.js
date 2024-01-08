import chalk from 'chalk';

export function log(message) {
    console.log(`\n${message}\n`)
};

export function logError(message) {
    console.error(chalk.red(message));
}

export function logSuccess(message) {
    log(chalk.green.bold(message));
}

export function makeLogger(verbose){
    return message => {
        if(verbose){
            log(message);
        }
    }
}