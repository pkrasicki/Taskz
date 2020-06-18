import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Task } from "../../models/task";

@Component({
	selector: 'task',
	templateUrl: './task.component.html',
	styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
	@Input() task: Task;
	@Input() parentTaskList;
	@ViewChild("taskElement", {static: false}) element;
	isDragged = false;

	constructor() { }

	ngOnInit() {
	}

	editTask()
	{
	}

	dragged(e)
	{
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";
		const index = this.parentTaskList.taskList.getTasks().indexOf(this.task);
		const data = {type: "task", task: this.task, originalTaskList: this.parentTaskList.taskList, originalIndex: index};
		e.dataTransfer.setData("application/json", JSON.stringify(data));
		this.isDragged = true;
	}

	dragEnded(e)
	{
		this.isDragged = false;
	}
}