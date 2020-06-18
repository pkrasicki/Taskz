import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

@Component({
	selector: 'ui-text-input',
	templateUrl: './text-input.component.html',
	styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent implements OnInit {
	@ViewChild("inputElement", {static: true}) element;
	@Input() inputValue;
	@Input() placeholder;
	@Output() inputValueChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() focus: EventEmitter<any> = new EventEmitter();
	@Output() blur: EventEmitter<any> = new EventEmitter();

	constructor() { }

	ngOnInit() {
	}

}