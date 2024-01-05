import chalk from 'chalk';

export function log(message) {
    console.log(`\n${message}\n`)
};

export function logError(message) {
    log(chalk.red(message));
}

export function logSuccess(message) {
    log(chalk.green.bold(message));
}