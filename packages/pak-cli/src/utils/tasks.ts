import { Listr, ListrTask } from 'listr2';

export default async function runTasks(tasksToRun: ListrTask | ListrTask[]){
    console.log('');
    const tasks = new Listr(tasksToRun);

    await tasks.run();
    console.log('');
}