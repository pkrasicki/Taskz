export class Task
{
	id: string;
	content: string;
	order: number;
	dueDate: Date;
	label: number;
	private comments = [];

	constructor(content: string, order: number, id?: string)
	{
		this.content = content;
		this.order = order;
		if (id != null)
			this.id = id;
	}

	getComments()
	{
		return this.comments;
	}
}