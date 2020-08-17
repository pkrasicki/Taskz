import { Component, OnInit, Input, ViewChild, ViewChildren, HostListener } from '@angular/core';
import { TaskList } from "src/app/models/task-list";
import { Task } from "src/app/models/task";
import { TaskService } from "src/app/services/task.service";
import { TaskComponent } from '../task/task.component';

@Component({
	selector: 'task-list',
	templateUrl: './task-list.component.html',
	styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
	@Input() taskList: TaskList;
	@Input() parentBoard;
	@ViewChild("listElement", {static: false}) element;
	@ViewChild("taskEdit", {static: false}) taskEdit;
	@ViewChild("listMenu", {static: false}) listMenu;
	@ViewChild("listTitleInput", {static: false}) listTitleInput;
	@ViewChildren(TaskComponent) taskComponents;
	isEditingListTitle: boolean = false;
	newListTitle: string;

	constructor(private taskService: TaskService)
	{ }

	ngOnInit() {
	}

	createTask(content: string)
	{
		let highestOrder = 0;
		this.taskList.getTasks().forEach((t) =>
		{
			if (t.order > highestOrder)
				highestOrder = t.order;
		});
		let newTask: Task = new Task(content, highestOrder + 1);
		this.taskService.createTask(this.taskList.id, newTask).subscribe((res) =>
		{
			if (res.success == true)
			{
				this.taskList.add(new Task(res.data.content, res.data.order, res.data.id));
				this.taskList.sort();
			}
		}, (err) =>
		{
			console.error(err.error.message);
		});
	}

	showEdit()
	{
		this.taskEdit.show();
		setTimeout(() => {
			this.taskEdit.input.element.nativeElement.focus();
		}, 50);
	}

	hideEdit()
	{
		this.taskEdit.hide();
		this.taskEdit.input.element.nativeElement.blur();
	}

	createTaskFromInput()
	{
		if (this.parentBoard.newTaskContent != "")
		{
			this.createTask(this.parentBoard.newTaskContent);
			this.parentBoard.newTaskContent = "";
		}

		setTimeout(() =>
		{
			if (this.taskEdit.useTextarea)
				this.taskEdit.input.autoHeight();

			this.taskEdit.input.element.nativeElement.focus();
		}, 50);
	}

	settingsBtnClicked(e)
	{
		this.listMenu.toggle(e.target.getBoundingClientRect());
	}

	hideMenu()
	{
		this.listMenu.hide();
	}

	duplicate()
	{
		this.parentBoard.createTaskList(`${this.taskList.title} (copy)`, this.taskList.order + 1, -1, this.taskList.getTasks());
		this.listMenu.hide();
	}

	delete()
	{
		this.taskService.deleteTaskList(this.taskList).subscribe((res) =>
		{
			if (res.success == true)
			{
				let index = this.parentBoard.board.taskLists.findIndex((list) => list.id == this.taskList.id);
				if (index >= 0)
					this.parentBoard.board.taskLists.splice(index, 1);
			}
		}, (err) =>
		{
			console.error(err.error.message);
		});

		this.listMenu.hide();
	}

	showRenameInput()
	{
		this.newListTitle = this.taskList.title;
		this.isEditingListTitle = true;
		this.listMenu.hide();
		setTimeout(() =>
		{
			this.listTitleInput.element.nativeElement.focus();
		}, 50);
	}

	listTitleEditBlurred()
	{
		this.isEditingListTitle = false;

		if (this.newListTitle == this.taskList.title)
			return;

		let newList = new TaskList(this.newListTitle, this.taskList.order, this.taskList.id);
		this.taskService.updateTaskList(newList).subscribe((res) =>
		{
			if (res.success == true)
			{
				this.taskList.title = res.data.title;
			}
		}, (err) =>
		{
			console.error(err.error.message);
		});
	}

	@HostListener("window:keydown", ["$event"])
	keyDown(e: KeyboardEvent)
	{
		if (e.key == "Escape" && this.isEditingListTitle)
		{
			this.isEditingListTitle = false;

		} else if (e.key == "Enter" && this.isEditingListTitle)
		{
			this.listTitleInput.element.nativeElement.blur();
		}
	}
}