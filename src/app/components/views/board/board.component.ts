import { Component, OnInit, ViewChild, HostListener, ViewChildren } from '@angular/core';
import { TaskListComponent } from "../../task-list/task-list.component";
import { TaskList } from "../../../models/task-list";
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/models/task';
import { Board } from "src/app/models/board";
import { ActivatedRoute, Router } from "@angular/router";
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import { TaskEditModalComponent } from '../../task-edit-modal/task-edit-modal.component';
import { ToggableEditComponent } from '../../ui/toggable-edit/toggable-edit.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: 'board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
	@ViewChild("modal", {static: false}) modal: TaskEditModalComponent;
	@ViewChild("listEdit", {static: false}) listEdit: ToggableEditComponent;
	@ViewChildren(TaskListComponent) taskListComponents;
	isLoading: boolean = true;
	board: Board;
	newTaskContent: string = "";
	newListTitle: string = "";
	subscriptions = new Subscription();

	constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router, private dragulaService: DragulaService, private authService: AuthService)
	{
		this.dragulaService.createGroup("LISTS",
		{
			direction: "horizontal",
			moves: (el, source, handle) =>
			{
				if (this.canUserEdit())
					return handle.className == "drag-handle";
				else
					return false;
			}
		});

		this.subscriptions.add(
			this.dragulaService.drop("LISTS").subscribe({next: (data) => this.listDropped(data)})
		);

		this.subscriptions.add(
			this.dragulaService.drop("TASKS").subscribe({next: (data) => this.taskDropped(data)})
		);
	}

	ngOnInit()
	{
		let username = this.route.snapshot.paramMap.get("username");
		let boardName = this.route.snapshot.paramMap.get("boardName");

		this.taskService.setBoardOwner(username);
		this.taskService.setBoardName(boardName);

		this.taskService.getBoard().subscribe(
		{
			next: (res) =>
			{
				let taskLists = res.data.taskLists.map(list =>
				{
					let tasks = list.tasks.map(task => new Task(task.content, task.order, task.uuid));
					tasks.sort((a, b) => a.order - b.order);
					return new TaskList(list.title, list.order, list.uuid, tasks);
				});

				this.board = new Board(res.data.ownerUsername, res.data.title, res.data.type, res.data.color, taskLists);
				this.sortTaskLists();
				this.isLoading = false;

			}, error: (err) =>
			{
				this.isLoading = false;

				if (err.status == 404)
				{
					this.router.navigate(["/404"], {skipLocationChange: true});
				} else
				{
					if (err.status == 401)
						this.router.navigate(["/login"], {queryParams: {restrictedUrl: true, url: this.router.url}});
					else
						console.error(err.error.message);
				}
			}
		});
	}

	ngOnDestroy()
	{
		this.subscriptions.unsubscribe();
		this.dragulaService.destroy("LISTS");
	}

	createTaskList(title: string, order?: number, id?: string, tasks?: Task[])
	{
		if (order == null)
		{
			order = 0;
			this.board.taskLists.forEach(list =>
			{
				if (list.order > order)
					order = list.order;
			});

			order++;
		}

		let list: TaskList;
		if (id != null && tasks == null)
			list = new TaskList(title, order, id);
		else if (id != null && tasks != null)
			list = new TaskList(title, order, id, tasks);
		else
			list = new TaskList(title, order);

		if (order != null)
		{
			this.board.taskLists.forEach(list =>
			{
				if (list.order >= order)
					list.order++;
			});
		}

		this.taskService.createTaskList(list).subscribe(
		{
			next: (res) =>
			{
				this.board.taskLists.push(new TaskList(res.data.title, res.data.order, res.data.id, res.data.tasks));
				this.sortTaskLists();

			}, error: (err) =>
			{
				console.error(err.error.message);
			}
		});
	}

	showEdit()
	{
		this.listEdit.show();
		setTimeout(() => this.listEdit.input.element.nativeElement.focus(), 50);
		this.taskListComponents._results.forEach(list =>
		{
			list.hideEdit();
			list.hideMenu();
		});
	}

	hideEdit()
	{
		this.listEdit.hide();
	}

	createTaskListFromInput()
	{
		if (this.newListTitle != "")
		{
			this.createTaskList(this.newListTitle);
			this.newListTitle = "";
		}

		setTimeout(() => this.listEdit.input.element.nativeElement.focus(), 50);
	}

	inputBlurred()
	{
		this.hideEdit();
	}

	hideAllInputs()
	{
		this.hideEdit();
		this.taskListComponents._results.forEach(list => list.hideEdit());
	}

	submitActiveInput()
	{
		if (this.listEdit.isVisible)
		{
			this.createTaskListFromInput();
		} else
		{
			this.taskListComponents._results.forEach((list) =>
			{
				if (list.taskEdit.isVisible)
					list.createTaskFromInput();
			});
		}
	}

	@HostListener("window:keydown", ["$event"])
	keyDown(e: KeyboardEvent)
	{
		if (e.key == "Escape")
			this.hideAllInputs();
		else if (e.key == "Enter" && !e.shiftKey)
			this.submitActiveInput();
	}

	sortTaskLists()
	{
		this.board.taskLists.sort((a, b) => a.order - b.order);
	}

	listDropped(data)
	{
		let listId = data.el.id;
		let currentIndex = this.board.taskLists.findIndex(l => l.id == listId);
		let droppedList = this.board.taskLists[currentIndex];
		let targetOrder;

		if (currentIndex != 0)
			targetOrder = this.board.taskLists[currentIndex - 1].order + 1;
		else
			targetOrder = 0;

		let list = new TaskList(droppedList.title, targetOrder, droppedList.id);
		this.taskService.updateTaskList(list).subscribe(
		{
			next: (res) =>
			{
				this.board.taskLists.forEach(l =>
				{
					if (l.order >= targetOrder)
						l.order++;
				});

				droppedList.order = res.data.order;

			}, error: (err) =>
			{
				console.error(err.error.message);
				this.sortTaskLists();
			}
		});
	}

	taskDropped(data)
	{
		let taskId = data.el.id;
		let sourceListId = data.source.dataset.listId;
		let targetListId = data.target.dataset.listId;
		let currentTaskList = this.board.taskLists.find(l => l.id == targetListId);
		let currentIndex = currentTaskList.getTasks().findIndex(t => t.id == taskId);
		let droppedTask = currentTaskList.getTasks()[currentIndex];
		let targetOrder;

		if (currentIndex != 0)
			targetOrder = currentTaskList.getTasks()[currentIndex - 1].order + 1;
		else
			targetOrder = 0;

		if (sourceListId != targetListId)
		{
			let task = new Task(droppedTask.content, targetOrder);

			this.taskService.createTask(currentTaskList.id, task).subscribe(
			{
				next: (res) =>
				{
					currentTaskList.getTasks().forEach(t =>
					{
						if (t.order >= targetOrder)
							t.order++;
					});

					let oldTask = new Task(droppedTask.content, droppedTask.order, droppedTask.id);
					droppedTask.id = res.data.id;
					droppedTask.order = res.data.order;

					this.taskService.deleteTask(oldTask).subscribe({
						next: (res) => {},
						error: (err) => console.error(err.error.message)
					});

				}, error: (err) =>
				{
					console.error(err.error.message);
					currentTaskList.sort();
				}
			});

		} else
		{
			let task = new Task(droppedTask.content, targetOrder, droppedTask.id);
			this.taskService.updateTask(task).subscribe(
			{
				next: (res) =>
				{
					currentTaskList.getTasks().forEach(t =>
					{
						if (t.order >= targetOrder)
							t.order++;
					});

					droppedTask.order = res.data.order;

				}, error: (err) =>
				{
					console.error(err.error.message);
					currentTaskList.sort();
				}
			});
		}
	}

	// if user can edit this board - do they have permission, are authenticated etc.
	canUserEdit(): boolean
	{
		if (this.authService.isAuthenticated())
		{
			// currently only owners can edit boards
			if (this.board.ownerUsername == this.authService.getUsername())
			{
				return true;
			}
		}

		return false;
	}
}