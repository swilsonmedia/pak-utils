import createClient from 'pak-bugz';
import dotenv from 'dotenv';
import appRootPath from 'app-root-path';
import { getBugIdFromBranchName, isBugBranchName } from './branch.js';
import { logError } from './log.js';
import { select } from './prompts.js';

dotenv.config({ path: appRootPath.resolve('.env') });

export function addBugToMessage(bugId, message) {
    return `BugzId: ${bugId} - ${message}`;
}

export async function getBugList(options = {}) {
    const { exclude, filter } = options;
    const client = await createClient({
        token: process.env.BUGZ_TOKEN,
        origin: process.env.BUGZ_ORIGIN,
    });

    const cases = await client.listCases({ cols: ['sTitle'], sFilter: 'inbox' });

    if (cases.length === 0) {
        logError('No cases were found');
        process.exit(1);
    }

    let choices = cases;

    if (Array.isArray(exclude)) {
        choices = choices.filter(c => !exclude.includes(c.ixBug.toString()));
    }

    if (Array.isArray(filter)) {
        choices = choices.filter(c => filter.includes(c.ixBug.toString()));
    }

    return choices;
}

export async function promptForBugSelection(options = {}) {
    const choices = await getBugList(options);

    if (!choices.length) {
        logError('No cases were found');
        process.exit(1);
    }

    const question = await select({
        message: 'Select a case that would you like to create a branch for?',
        choices: choices.map(c => `${c.ixBug}: ${c.sTitle}`)
    });


    const id = /^(\d+):/gi.exec(question)[1];

    return choices.find(c => c.ixBug === id);
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

export function getUniqueBugIdsFromBranchList(list) {
    return [...new Set(list.filter(b => isBugBranchName(b)).map(b => getBugIdFromBranchName(b)))];
}