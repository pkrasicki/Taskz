import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Board } from 'src/app/models/board';

const DEFAULT_BOARD_COLOR: string = "#4097c0";

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	@ViewChild("createBoardMenu", {static: false}) createBoardMenu;
	@ViewChild("createBtn", {static: false}) createBtn;
	@ViewChildren("boardItem") boardItems;
	@ViewChild("newBoardNameInput", {static: false}) newBoardNameInput;
	username: string;
	privateBoards: Board[] = [];
	publicBoards: Board[] = [];
	newBoardName: string;
	newBoardType: string = "0";
	newBoardColor: string = DEFAULT_BOARD_COLOR;
	colorMenuExpanded: boolean = false;
	boardNameIncorrect: boolean = false;

	constructor(private taskService: TaskService, private authService: AuthService, private router: Router) { }

	ngOnInit()
	{
		this.username = this.authService.getUsername();
		this.taskService.getBoards().subscribe(
		{
			next: (res) =>
			{
				res.data.forEach((board) =>
				{
					let boardObj = new Board(board.ownerUsername, board.title, board.type, board.color, [], board.uuid);

					if (board.type == 0)
						this.privateBoards.push(boardObj);
					else
						this.publicBoards.push(boardObj);
				});

			}, error: (err) =>
			{
				if (err.status == 401)
					this.router.navigate(["/login"], {queryParams: {restrictedUrl: true}});
				else
					console.error(err.error.message);
			}
		});
	}

	createBoard()
	{
		if (this.newBoardName != "" && this.newBoardName != null)
		{
			let color = null;
			if (this.newBoardColor != "")
				color = this.newBoardColor;

			let board = new Board("", this.newBoardName, parseInt(this.newBoardType), color);

			this.taskService.createBoard(board).subscribe(
			{
				next: (res) =>
				{
					let boardObj = new Board(res.data.ownerUsername, res.data.title, res.data.type, res.data.color, [], res.data.uuid);
					if (board.type == 0)
						this.privateBoards.push(boardObj);
					else
						this.publicBoards.push(boardObj);

					this.createBoardMenu.hide();
					this.newBoardName = null;
					this.newBoardType = "0";
					this.newBoardColor = DEFAULT_BOARD_COLOR;

				}, error: (err) =>
				{
					if (err.status == 401)
						this.router.navigate(["/login"], {queryParams: {restrictedUrl: true}});
					else
						console.error(err.error.message);
				}
			});

		} else
		{
			this.boardNameIncorrect = true;
			this.newBoardNameInput.element.nativeElement.focus();
		}
	}

	createBoardClicked(e)
	{
		const rect = e.currentTarget.getBoundingClientRect();
		this.createBoardMenu.toggle(rect, false, true);
	}

	toggleColorMenu()
	{
		this.colorMenuExpanded = !this.colorMenuExpanded;
	}

	boardDeleted(boardData: {id: string, type: number})
	{
		if (boardData.type == 0)
		{
			let index = this.privateBoards.findIndex((b) => b.id == boardData.id);
			if (index > -1)
				this.privateBoards.splice(index, 1);
		} else
		{
			let index = this.publicBoards.findIndex((b) => b.id == boardData.id);
			if (index > -1)
				this.publicBoards.splice(index, 1);
		}
	}

	newBoardNameEdited(e: KeyboardEvent)
	{
		this.boardNameIncorrect = false;
	}

	menuHidden()
	{
		this.boardNameIncorrect = false;
	}
}