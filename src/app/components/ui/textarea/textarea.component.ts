import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';

@Component({
	selector: 'ui-textarea',
	templateUrl: './textarea.component.html',
	styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {
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
