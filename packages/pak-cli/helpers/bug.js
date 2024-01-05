import createClient from 'pak-bugz';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import appRootPath from 'app-root-path';

dotenv.config({ path: appRootPath.resolve('.env') });

export function getBugIdFromBranchName(branchName) {
    return /fb\-(\d+)/gi.exec(branchName)[1] ?? '';
}

export function isBugBranchName(branchName) {
    return /fb\-(\d+)/gi.test(branchName);
}

export function addBugToMessage(bugId, message) {
    return `BugzId: ${bugId} - ${message}`;
}

export async function promptForBugSelection() {
    const client = await createClient({
        token: process.env.BUGZ_TOKEN,
        origin: process.env.BUGZ_ORIGIN,
    });

    const cases = await client.cases.list('inbox', { cols: 'sTitle' });

    if (cases.count === 0) {
        logError('No cases found to checkout a branch for');
        process.exit(1);
    }

    const answer = await inquirer.prompt([{
        name: 'case',
        message: 'Select a case that would you like to create a branch for?',
        type: 'list',
        choices: cases.cases.map(c => `${c.ixBug}: ${c.sTitle}`)
    }]);

    const id = /^(\d+):/gi.exec(answer.case)[1];

    return cases.cases.find(c => c.ixBug === id);
}

export function findBugCases(versionControlLog, bugId) {
    const reg = new RegExp(`\\sbugzid:\\s${bugId}\\s\\-\\s`, 'gi');

    return versionControlLog.split('\n')
        .filter(log => reg.test(log))
        .map(log => {
            const parts = log.split(reg);
            return {
                message: parts[1],
                bugId,
                hash: parts[0],
                log
            }
        });
}
