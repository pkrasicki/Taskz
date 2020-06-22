import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';

@Component({
	selector: 'ui-textarea',
	templateUrl: './textarea.component.html',
	styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent implements OnInit {
	@ViewChild("inputElement", {static: true}) element;
	@Input() inputValue: string;
	@Input() placeholder: string;
	@Input() rows: number = 1;
	@Output() inputValueChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() focus: EventEmitter<any> = new EventEmitter();
	@Output() blur: EventEmitter<any> = new EventEmitter();

	constructor() { }

	ngOnInit() {
		this.autoHeight();
	}

	keyDown(e: KeyboardEvent)
	{
		if (e.key == "Enter" && !e.shiftKey)
			e.preventDefault();
	}

	autoHeight()
	{
		this.element.nativeElement.style.height = "5px";
		this.element.nativeElement.style.height = `${this.element.nativeElement.scrollHeight}px`;
	}
}