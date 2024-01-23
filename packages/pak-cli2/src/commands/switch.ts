import * as yargs from "yargs";

export const cmd = 'switch';

export const description = 'Switch between branches';

export function builder(yargs: yargs.Argv) {
    yargs
        .usage(`<command> ${cmd}`)
        .options({
            'v': {
                alias: 'verbose',
                type: 'boolean',
                description: 'Display more logging',
                default: false
            }
        });
}

export async function handler({ verbose }: yargs.ArgumentsCamelCase) {
    console.log('switch handler', verbose);
}