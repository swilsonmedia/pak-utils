import * as git from './lib/git.js';

(async () => {
    process.on('uncaughtException', (err) => {
        console.log('uncaughtException', err.message);
    });

    process.on('unhandledRejection', (err) => {
        console.log('unhandledRejection', err.message);
    });

    const response = await git.switchBranch('swilson/wilson');
})();

