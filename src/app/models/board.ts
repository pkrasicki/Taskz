import { TaskList } from "src/app/models/task-list";
export class Board
{
	ownerUsername: string;
	title: string;
	type: number;
	color: string;
	taskLists: TaskList[];
	id: string;

	constructor(ownerUsername: string, title: string, type: number = 0, color: string = null, taskLists: TaskList[] = [], id?: string)
	{
		this.ownerUsername = ownerUsername;
		this.title = title;
		this.type = type;
		this.color = color;
		this.taskLists = taskLists;
		this.id = id;
	}
}