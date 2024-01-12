import appRootPath from 'app-root-path';
import { access, writeFile, readFile } from 'fs/promises';
import { prompt } from './prompts.js';

const userConfig = appRootPath.resolve('./.pak');

export default async function user() {
    return new Promise(async (res, rej) => {
        try {
            await access(userConfig);
            const result = await readFile(userConfig);

            res(JSON.parse(result).user);
        } catch (error) {
            console.log('');
            console.log('What username would you want to use for branch naming?\n\nex: /users/swilson/fb-123');
            console.log('');

            const answer = await prompt({
                name: 'username',
                message: 'Enter a username',
                type: 'input'
            });

            await writeFile(userConfig, JSON.stringify({ user: answer.username }), 'utf8');

            res(answer.username);
        }
    });
}
