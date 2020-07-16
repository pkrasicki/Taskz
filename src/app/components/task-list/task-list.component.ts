import { Component, OnInit, Input, ViewChild, ViewChildren, HostListener } from '@angular/core';
import { TaskList } from "src/app/models/task-list";
import { Task } from "src/app/models/task";
import { TaskService } from "src/app/services/task.service";
import { TaskComponent } from '../task/task.component';
import { CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

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
		this.element.nativeElement.draggable = true;
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

	taskDropped(e: CdkDragDrop<Task[]>)
	{
		if (e.previousContainer != e.container)
			transferArrayItem(e.previousContainer.data, e.container.data, e.previousIndex, e.currentIndex);
		else
			moveItemInArray(this.taskList.getTasks(), e.previousIndex, e.currentIndex);

		let droppedTask = this.taskList.getTasks()[e.currentIndex];
		let previousOrder = droppedTask.order;
		let targetOrder;

		if (e.currentIndex != 0)
			targetOrder = this.taskList.getTasks()[e.currentIndex - 1].order + 1;
		else
			targetOrder = 0;

		if (targetOrder == previousOrder && e.previousContainer == e.container) // nothing was changed
			return;

		if (e.previousContainer != e.container)
		{
			let task = new Task(droppedTask.content, targetOrder);

			this.taskService.createTask(this.taskList.id, task).subscribe((res) =>
			{
				if (res.success == true)
				{
					this.taskList.getTasks().forEach(t =>
					{
						if (t.order >= targetOrder)
							t.order++;
					});

					let oldTask = new Task(droppedTask.content, droppedTask.order, droppedTask.id);
					droppedTask.id = res.data.id;
					droppedTask.order = res.data.order;
					this.taskList.sort();

					this.taskService.deleteTask(oldTask).subscribe((delRes) =>
					{},
					(delErr) =>
					{
						console.error(delErr.error.message);
					});
				}
			}, (err) =>
			{
				console.error(err.error.message);
			});

		} else
		{
			let task = new Task(droppedTask.content, targetOrder, droppedTask.id);
			this.taskService.updateTask(task).subscribe((res) =>
			{
				if (res.success == true)
				{
					this.taskList.getTasks().forEach(t =>
					{
						if (t.order >= targetOrder)
							t.order++;
					});
					droppedTask.order = res.data.order;
					this.taskList.sort();
				}
			}, (err) =>
			{
				console.error(err.error.message);
				// revert changes
				moveItemInArray(this.taskList.getTasks(), e.currentIndex, e.previousIndex);
				droppedTask = this.taskList.getTasks()[e.currentIndex];
				droppedTask.order = previousOrder;
				this.taskList.getTasks().forEach(t =>
				{
					if (t.id != droppedTask.id && t.order >= droppedTask.order)
						t.order--;
				});

				this.taskList.sort();
			});
		}
	}
}