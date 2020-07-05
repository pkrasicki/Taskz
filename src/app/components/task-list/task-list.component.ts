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
	isDragged: boolean = false;

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

		setTimeout(() =>
		{
			if (this.taskEdit.useTextarea)
				this.taskEdit.input.autoHeight();

			this.taskEdit.input.element.nativeElement.focus();
		}, 50);
	}

	taskDraggedOver(e: DragEvent)
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

		let index = -1;
		let insertBefore = false;
		let rects = this.taskComponents._results.map(component => component.element.nativeElement.getBoundingClientRect());

		for (let i = 0; i < rects.length; i++)
		{
			let centerY = rects[i].y + (rects[i].height / 2);

			if (e.clientY > centerY)
			{
				if (i + 1 < rects.length) // task is not last on the list
				{
					let nextCenterY = rects[i+1].y + (rects[i+1].height / 2);
					if (e.clientY < nextCenterY)
					{
						index = i;
						insertBefore = false;
						taskData.task.order = this.taskComponents._results[index + 1].task.order;
						break;
					}
				} else
				{
					index = i;
					insertBefore = false;
					taskData.task.order = this.taskComponents._results[index].task.order + 1;
					break;
				}
			} else if (e.clientY < centerY)
			{
				index = 0;
				insertBefore = true;
				taskData.task.order = this.taskComponents._results[index].task.order;
				break;
			}
		}

		const oldTaskPreview = document.querySelector("#taskPreview");
		if (oldTaskPreview != null)
			oldTaskPreview.remove();

		const preview = document.createElement("div");
		preview.classList.add("task");
		preview.textContent = "t";
		preview.style.visibility = "hidden";
		preview.id = "taskPreview";
		const ul = this.element.nativeElement.querySelector("ul");

		if (ul != null && this.taskComponents._results[index] != null)
		{
			if (insertBefore)
			{
				ul.insertBefore(preview, this.taskComponents._results[index].element.nativeElement.parentNode.parentNode);
			} else
			{
				ul.insertBefore(preview, this.taskComponents._results[index].element.nativeElement.parentNode.parentNode.nextSibling);
			}

			this.taskService.draggedTask = taskData.task;
		}
	}

	taskDropped(e: DragEvent)
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

		this.taskService.createTask(this.taskList.id, this.taskService.draggedTask).subscribe(res =>
		{
			if (res.success == true)
			{
				this.taskList.getTasks().forEach(t =>
				{
					if (t.order >= this.taskService.draggedTask.order)
						t.order++;
				});

				this.taskList.add(new Task(res.data.content, res.data.order, res.data.id));
				this.taskList.sort();
			}

			this.taskService.deleteTask(this.taskService.draggedTask).subscribe(delRes =>
			{
				if (delRes.success == true)
				{
					let listIndex = this.parentBoard.board.taskLists.findIndex(l => l.id == taskData.originalTaskList.id);
					let taskIndex = this.parentBoard.board.taskLists[listIndex].getTasks().findIndex(t => t.id == taskData.task.id);
					this.parentBoard.board.taskLists[listIndex].remove(taskIndex);
				} else if (delRes.error == true)
				{
					console.error(delRes.message);
				}
			});
		});
	}

	dragLeave(e: DragEvent)
	{
		const oldMovePreview = this.element.nativeElement.querySelector("#taskPreview");
		if (oldMovePreview != null)
			oldMovePreview.remove();
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

	dragStarted(e: DragEvent)
	{
		e.dataTransfer.dropEffect = "move";
		const data = {type: "taskList", taskList: this.taskList};
		e.dataTransfer.setData("application/json", JSON.stringify(data));
		this.isDragged = true;
	}

	dragEnded(e: DragEvent)
	{
		this.isDragged = false;
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