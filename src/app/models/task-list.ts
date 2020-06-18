import { Task } from "src/app/models/task";
export class TaskList
{
	id: string;
	title: string;
	order: number;
	private tasks: Task[] = [];

	constructor(title: string, order: number, id?: string, tasks?: Task[])
	{
		this.title = title;
		this.order = order;

		if (id != null)
			this.id = id;

		if (tasks != null)
			this.tasks = tasks;
	}

	add(task: Task)
	{
		this.tasks.push(task);
		return task;
	}

	update(newTask: Task, index: number)
	{
		if (index < 0)
			throw new Error("index must be above 0");

		newTask.id = this.tasks[index].id;
		this.tasks.splice(index, 1, newTask);
	}

	remove(index: number)
	{
		if (index < 0)
			throw new Error("index must be above 0");

		this.tasks.splice(index, 1);
	}

	getTasks()
	{
		return this.tasks;
	}

	sort()
	{
		this.tasks.sort((a, b) => a.order - b.order);
	}
}