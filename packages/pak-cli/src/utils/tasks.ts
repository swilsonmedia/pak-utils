import { Listr, ListrTask } from 'listr2';

export default async function runTasks(tasksToRun: ListrTask | ListrTask[]){
    const tasks = new Listr(tasksToRun);

    return await tasks.run();
}