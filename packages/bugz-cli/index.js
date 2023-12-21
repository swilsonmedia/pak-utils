import createBugzClient from 'bugz-api';

(async () => {
    const bugzClient = createBugzClient({ domain: '', token: '' });

    const query = { id: 122301 };

    query[bugzClient.cases.columns.caseNote] = "New Note!!"

    const response = await bugzClient.cases.view({
        [bugzClient.cases.columns.id]: 122301,
        columns: [bugzClient.cases.columns.caseNotes]
    });

    console.log(response)
})();
