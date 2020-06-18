import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Task } from "src/app/models/task";
import { TaskList } from '../models/task-list';
import { Board } from "src/app/models/board";
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class TaskService {
	boardName: string;
	boardOwner: string;
	constructor(private http: HttpClient) { }

	setBoardOwner(owner: string)
	{
		this.boardOwner = owner;
	}

	setBoardName(name: string)
	{
		this.boardName = name;
	}

	getBoards(): Observable<any>
	{
		return this.http.get<any>("/users/boards");
	}

	getBoard(): Observable<any>
	{
		return this.http.get<Board>(`/users/${this.boardOwner}/boards/${this.boardName}`);
	}

	createBoard(board: Board): Observable<any>
	{
		return this.http.post<Board>(`/users/boards`, board);
	}

	deleteBoard(board: Board): Observable<any>
	{
		return this.http.delete<any>(`/users/boards/${board.id}`);
	}

	createTaskList(taskList: TaskList): Observable<any>
	{
		return this.http.post<TaskList>(`/users/${this.boardOwner}/boards/${this.boardName}/taskLists`, taskList);
	}

	updateTaskList(taskList: TaskList): Observable<any>
	{
		return this.http.put<TaskList>(`/users/${this.boardOwner}/boards/${this.boardName}/taskLists/${taskList.id}`, taskList);
	}

	deleteTaskList(taskList: TaskList): Observable<any>
	{
		return this.http.delete<any>(`/users/${this.boardOwner}/boards/${this.boardName}/taskLists/${taskList.id}`);
	}

	createTask(taskListId: string, task: Task): Observable<any>
	{
		return this.http.post<Task>(`/users/${this.boardOwner}/boards/${this.boardName}/taskLists/${taskListId}`, task);
	}

	updateTask(task: Task): Observable<any>
	{
		return this.http.put<Task>(`/users/${this.boardOwner}/boards/${this.boardName}/tasks/${task.id}`, task);
	}

	deleteTask(task: Task): Observable<any>
	{
		return this.http.delete<any>(`/users/${this.boardOwner}/boards/${this.boardName}/tasks/${task.id}`);
	}
}