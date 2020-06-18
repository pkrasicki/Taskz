import { Component, OnInit, ViewChild, HostListener, QueryList, ViewChildren } from '@angular/core';
import { TaskListComponent } from "../../task-list/task-list.component";
import { TaskList } from "../../../models/task-list";
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/models/task';
import { Board } from "src/app/models/board";
import { ActivatedRoute } from "@angular/router";

@Component({
	selector: 'board',
	templateUrl: './board.component.html',
	styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
	@ViewChild("modal", {static: false}) modal;
	@ViewChild("listEdit", {static: false}) listEdit;
	@ViewChildren(TaskListComponent) taskListComponents;
	board: Board;
	newTaskContent: string = "";
	newListTitle: string = "";

	constructor(private taskService: TaskService, private route: ActivatedRoute) { }

	ngOnInit()
	{
		let username = this.route.snapshot.paramMap.get("username");
		let boardName = this.route.snapshot.paramMap.get("boardName");
		this.taskService.setBoardOwner(username);
		this.taskService.setBoardName(boardName);

		this.taskService.getBoard().subscribe(res =>
		{
			if (res.error == true)
			{
				console.error(res.message);
				return;
			}

			let taskLists = res.data.taskLists.map(list =>
			{
				let tasks = list.tasks.map(task => new Task(task.content, task.order, task.uuid));
				tasks.sort((a, b) => a.order - b.order);
				return new TaskList(list.title, list.order, list.uuid, tasks);
			});

			this.board = new Board(res.data.ownerUsername, res.data.title, res.data.type, res.data.color, taskLists);
			this.board.taskLists.sort((a, b) => a.order - b.order);
		});
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

		this.taskService.createTaskList(list).subscribe(res =>
		{
			if (res.success)
			{
				this.board.taskLists.push(new TaskList(res.data.title, res.data.order, res.data.id, res.data.tasks));
				this.board.taskLists.sort((a, b) => a.order - b.order);
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
		else if (e.key == "Enter")
			this.submitActiveInput();
	}

	listDraggedOver(e)
	{
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}

	listDropped(e)
	{
		e.preventDefault();
		const json = e.dataTransfer.getData("application/json");
		let listData;

		try
		{
			listData = JSON.parse(json);
		} catch
		{
			return;
		}

		if (listData.type != "taskList")
			return;
	}
}