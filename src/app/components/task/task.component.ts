import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Task } from "../../models/task";

@Component({
	selector: 'task',
	templateUrl: './task.component.html',
	styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
	@Input() task: Task;
	@Input() parentTaskList;
	@ViewChild("taskElement") element;

	constructor() { }

	ngOnInit() {
	}
}