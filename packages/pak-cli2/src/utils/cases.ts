export function getCaseList(cases: any[], options: {filter?: string[], exclude?: string[]}) {
    const { exclude, filter } = options;

    let choices = cases;

    if (Array.isArray(exclude)) {
        choices = choices.filter(c => !exclude.includes(c.ixBug.toString()));
    }

    if (Array.isArray(filter)) {
        choices = choices.filter(c => filter.includes(c.ixBug.toString()));
    }

    return choices;
}