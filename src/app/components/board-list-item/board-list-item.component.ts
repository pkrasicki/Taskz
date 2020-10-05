import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { Board } from 'src/app/models/board';

@Component({
	selector: 'board-list-item',
	templateUrl: './board-list-item.component.html',
	styleUrls: ['./board-list-item.component.scss']
})
export class BoardListItemComponent implements OnInit {
	@Input("board") board: Board;
	@Input("username") username: string;
	@Input("hideDeleteBtn") hideDeleteBtn: boolean = false;
	@Output("boardDelete") boardDelete: EventEmitter<{id: string, type: number}> = new EventEmitter<{id: string, type: number}>();
	constructor(private taskService: TaskService) { }

	ngOnInit() {
	}

	deleteClicked(e)
	{
		e.preventDefault();
		let confirmed = window.confirm(`Are you sure you want to delete board '${this.board.title}'? This action can't be undone.`);
		if (confirmed)
		{
			this.taskService.deleteBoard(this.board).subscribe(
			{
				next: (res) =>
				{
					this.boardDelete.emit({id: res.data.id, type: this.board.type});
				}, error: (err) =>
				{
					console.error(err.error.message);
				}
			});
		}
	}
}