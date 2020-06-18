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
		this.taskService.createTask(this.taskList.id, newTask).subscribe(res =>
		{
			if (res.success == true)
			{
				this.taskList.add(new Task(res.data.content, res.data.order, res.data.id));
				this.taskList.sort();
			}
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

		setTimeout(() => this.taskEdit.input.element.nativeElement.focus(), 50);
	}

	taskDraggedOver(e)
	{
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";

		const taskJson = e.dataTransfer.getData("application/json");
		let taskData;

		try
		{
			taskData = JSON.parse(taskJson);
		} catch
		{
			return; // return when json parsing fails
		}

		if (taskData.type != "task")
			return;

		let showMovePreview = true;
		let closest = {order: 0, dist: Infinity, rect: null, elem: null};
		this.taskComponents._results.forEach((taskComponent) =>
		{
			const oldMovePreview = document.querySelector("#moveTargetDisplay");
			if (oldMovePreview != null)
				oldMovePreview.remove();

			taskComponent.element.nativeElement.classList.remove("task-dragover");
			let rect = taskComponent.element.nativeElement.getBoundingClientRect();
			let dist = Math.abs(e.clientY - rect.y);
			if (dist < closest.dist)
			{
				closest.order = taskComponent.task.order;
				closest.dist = dist;
				closest.rect = rect;
				closest.elem = taskComponent.element.nativeElement;
			}
		});

		const oldMovePreview = document.querySelector("#moveTargetDisplay");
		if (oldMovePreview != null)
			oldMovePreview.remove();

		if (showMovePreview)
		{
			const preview = document.createElement("div");
			preview.classList.add("task");
			preview.textContent = "t";
			preview.style.visibility = "hidden";
			preview.id = "moveTargetDisplay";
			const ul = this.element.nativeElement.querySelector("ul");

			if (ul != null)
			{
				if (closest.elem == null)
				{
					ul.appendChild(preview);
				} else
				{
					if (closest.rect.y + (closest.rect.height / 2) < e.clientY)
					{
						ul.insertBefore(preview, closest.elem.parentNode.parentNode.nextSibling);
					} else
					{
						ul.insertBefore(preview, closest.elem.parentNode.parentNode);
					}
				}
			}
		}
	}

	taskDropped(e)
	{
		e.preventDefault();
		const taskJson = e.dataTransfer.getData("application/json");
		let taskData;

		try
		{
			taskData = JSON.parse(taskJson);
		} catch
		{
			return; // return when json parsing fails
		}

		if (taskData.type != "task")
			return;

		const oldMovePreview = document.querySelector("#moveTargetDisplay");
		if (oldMovePreview != null)
			oldMovePreview.remove();

		const task = taskData.task;
		const originalTaskList = this.parentBoard.board.taskLists.filter(list => list.id == taskData.originalTaskList.id)[0];
		let closest = {order: 0, dist: Infinity, rect: null};
		let isTheSameList = false;

		if (taskData.originalTaskList.id == this.taskList.id)
			isTheSameList = true;

		this.taskComponents._results.forEach((taskComponent) =>
		{
			let rect = taskComponent.element.nativeElement.getBoundingClientRect();
			let dist = Math.abs(e.clientY - (rect.y + (rect.height / 2)));
			if (dist < closest.dist)
			{
				closest.order = taskComponent.task.order;
				closest.dist = dist;
				closest.rect = rect;
			}
		});

		if (isTheSameList && closest.order == task.order)	// nothing was changed
			return;

		// find the right order for new task
		if (closest.rect == null)
		{
			closest.order = 0;
		} else if (closest.rect.y + (closest.rect.height / 2) < e.clientY)
		{
			closest.order++;
		}

		task.order = closest.order;

		this.taskService.createTask(this.taskList.id, task).subscribe(res =>
		{
			if (res.success == true)
			{
				this.taskList.getTasks().forEach(t =>
				{
					if (t.order >= task.order)
						t.order++;
				});

				this.taskList.add(new Task(res.data.content, res.data.order, res.data.id));
				this.taskList.sort();
			}
		});

		this.taskService.deleteTask(task).subscribe(res =>
		{
			if (res.success == true)
				originalTaskList.remove(taskData.originalIndex);
			else if (res.error = true)
				console.error(res.message);
		});
	}

	// when parent element is draggable, user can't select text inside of input element with mouse
	// to work around this we are temporarily disabling dragging when taskInput is focused
	// (https://stackoverflow.com/questions/27149192/no-possibility-to-select-text-inside-input-when-parent-is-draggable)
	taskInputFocused(e)
	{
		this.element.nativeElement.draggable = false;
	}

	// enable dragging again after user stops editing task input
	taskInputBlurred(e)
	{
		this.element.nativeElement.draggable = true;
	}

	dragged(e)
	{
		e.dataTransfer.dropEffect = "move";
		const data = {type: "taskList", taskList: this.taskList};
		e.dataTransfer.setData("application/json", JSON.stringify(data));
	}

	dragEnded(e)
	{ }

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
		this.taskService.deleteTaskList(this.taskList).subscribe(res =>
		{
			if (res.success == true)
			{
				let index = this.parentBoard.board.taskLists.findIndex((list) => list.id == this.taskList.id);
				if (index >= 0)
					this.parentBoard.board.taskLists.splice(index, 1);
			} else if (res.error == true)
			{
				console.error(res.message);
			}
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
		this.element.nativeElement.draggable = true;
		this.isEditingListTitle = false;

		if (this.newListTitle == this.taskList.title)
			return;

		let newList = new TaskList(this.newListTitle, this.taskList.order, this.taskList.id);
		this.taskService.updateTaskList(newList).subscribe(res =>
		{
			if (res.success == true)
			{
				this.taskList.title = res.data.title;
			} else if (res.error == true)
			{
				console.error(res.message);
			}
		});
	}

	listTitleEditFocused(e)
	{
		this.element.nativeElement.draggable = false;
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