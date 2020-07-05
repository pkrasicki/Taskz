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
	clone: null;

	constructor() { }

	ngOnInit() {
	}

	editTask()
	{
	}

	dragStarted(e: DragEvent)
	{
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";

		let rect = this.element.nativeElement.getBoundingClientRect();
		let clone = this.element.nativeElement.cloneNode(true);
		clone.style.width = rect.width + "px";
		clone.style.height = rect.height + "px";
		clone.classList.add("task-clone");
		document.body.appendChild(clone);
		let cloneRect = clone.getBoundingClientRect();
		e.dataTransfer.setDragImage(clone, cloneRect.width / 2, cloneRect.height / 2);
		this.clone = clone;

		const data = {type: "task", task: this.task, originalTaskList: this.parentTaskList.taskList};
		e.dataTransfer.setData("application/json", JSON.stringify(data));
		this.isDragged = true;
	}

	dragEnded(e: DragEvent)
	{
		this.isDragged = false;

		if (this.clone != null)
		{
			document.body.removeChild(this.clone);
			this.clone = null;
		}

		const oldMovePreview = document.querySelector("#taskPreview");
		if (oldMovePreview != null)
			oldMovePreview.remove();
	}
}