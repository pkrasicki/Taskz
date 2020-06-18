import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
	selector: 'ui-button',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
	@ViewChild("btn", {static: false}) element;
	@Input("link") link;
	constructor() { }

	ngOnInit() {
	}

}
