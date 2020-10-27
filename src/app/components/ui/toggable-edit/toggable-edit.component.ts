import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';

@Component({
	selector: 'ui-toggable-edit',
	templateUrl: './toggable-edit.component.html',
	styleUrls: ['./toggable-edit.component.scss']
})
export class ToggableEditComponent implements OnInit {
	@ViewChild("toggableEdit", {static: true}) element;
	@ViewChild("input") input;
	@Input() placeholder: string;
	@Input() val: string;
	@Input() useTextarea: boolean = false;
	@Output() valChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() focus: EventEmitter<any> = new EventEmitter();
	@Output() blur: EventEmitter<any> = new EventEmitter();
	@Output() acceptClick: EventEmitter<any> = new EventEmitter();
	@Output() cancelClick: EventEmitter<any> = new EventEmitter();
	isVisible: boolean = false;
	isOnScreen: boolean = false;

	constructor() { }

	ngOnInit() {
	}

	show()
	{
		this.isVisible = true;
		setTimeout(() =>
		{
			this.isOnScreen = true;
			if (this.useTextarea)
				this.input.autoHeight();
		}, 50);
	}

	hide()
	{
		this.isVisible = false;
		setTimeout(() => {this.isOnScreen = false}, 50);
	}

	@HostListener("window:click", ["$event"])
	click(e: MouseEvent)
	{
		if (!this.isVisible || !this.isOnScreen)
			return;

		if (e.target != this.element.nativeElement && !this.element.nativeElement.contains(e.target))
			this.hide();
	}
}