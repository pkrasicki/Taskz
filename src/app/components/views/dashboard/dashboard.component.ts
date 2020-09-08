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
	boards: Board[] = [];
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
					this.boards.push(new Board(board.ownerUsername, board.title, board.type, board.color, [], board.uuid));
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
					this.boards.push(new Board(res.data.ownerUsername, res.data.title, res.data.type, res.data.color, [], res.data.uuid));
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

	boardDeleted(boardId: string)
	{
		let index = this.boards.findIndex((b) => b.id == boardId);
		if (index > -1)
			this.boards.splice(index, 1);
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