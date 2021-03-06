import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TaskList } from 'src/app/models/task-list';
import { Task } from 'src/app/models/task';
import { TaskService } from "src/app/services/task.service";
import { ModalComponent } from '../ui/modal/modal.component';
import { BoardComponent } from '../views/board/board.component';

@Component({
	selector: 'task-edit-modal',
	templateUrl: './task-edit-modal.component.html',
	styleUrls: ['./task-edit-modal.component.scss']
})
export class TaskEditModalComponent extends ModalComponent implements OnInit{
	@ViewChild("taskTitleInput") taskTitleInput;
	@Input("parentBoard") parentBoard: BoardComponent;
	currentTask: Task;
	currentTaskList: TaskList;
	taskContent: string;
	isEditingTaskTitle: boolean = false;

	constructor(private taskService: TaskService)
	{
		super();
	}

	ngOnInit() {
	}

	hide()
	{
		super.hide();
		this.taskContent = "";
	}

	showEdit(task: Task, taskList: TaskList)
	{
		this.currentTask = task;
		this.currentTaskList = taskList;
		this.taskContent = task.content;
		this.show();
	}

	updateTask()
	{
		if (this.taskContent == this.currentTask.content)
			return;

		let newTask = new Task(this.taskContent, this.currentTask.order, this.currentTask.id);
		this.taskService.updateTask(newTask).subscribe((res) =>
		{
			if (res.success == true)
			{
				this.currentTask.content = res.data.content;
				this.currentTask.order = res.data.order;
			}
		}, (err) =>
		{
			console.error(err.error.message);
			this.taskContent = this.currentTask.content;
		});
	}

	deleteTask()
	{
		this.taskService.deleteTask(this.currentTask).subscribe((res) =>
		{
			if (res.success == true)
			{
				let tasks =	this.currentTaskList.getTasks();
				let index = tasks.findIndex((task) => task.id == this.currentTask.id);
				if (index >= 0)
					this.currentTaskList.remove(index);
			}
		}, (err) =>
		{
			console.error(err.error.message);
		});

		this.hide();
	}

	taskTitleInputBlurred(e)
	{
		this.updateTask();
		this.hideTaskTitleInput();
	}

	showTaskTitleInput()
	{
		this.isEditingTaskTitle = true;
		setTimeout(() =>
		{
			this.taskTitleInput.element.nativeElement.focus();
			this.taskTitleInput.autoHeight();
		}, 50);
	}

	hideTaskTitleInput()
	{
		this.isEditingTaskTitle = false;
	}

	keyDown(e: KeyboardEvent)
	{
		if (e.key == "Escape")
		{
			if (this.isEditingTaskTitle)
			{
				this.taskContent = this.currentTask.content;
				this.taskTitleInput.element.nativeElement.blur();
			} else
			{
				this.hide();
			}

		} else if (e.key == "Enter" && !e.shiftKey)
		{
			if (this.isEditingTaskTitle)
				this.taskTitleInput.element.nativeElement.blur();
		}
	}
}