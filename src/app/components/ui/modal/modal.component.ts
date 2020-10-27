import { Component, OnInit, ViewChild, HostListener } from '@angular/core';

@Component({
	selector: 'ui-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
	@ViewChild("taskTitleInput") taskTitleInput;
	@ViewChild("outsideArea") outsideArea;
	isVisible: boolean = false;

	constructor() { }

	ngOnInit() {
	}

	show()
	{
		this.isVisible = true;
	}

	hide()
	{
		this.isVisible = false;
	}

	@HostListener("window:keydown", ["$event"])
	keyDown(e: KeyboardEvent)
	{
		if (e.key == "Escape")
			this.hide();
	}

	@HostListener("click", ["$event"])
	click(e: MouseEvent)
	{
		if (this.outsideArea != null && e.target == this.outsideArea.nativeElement)
			this.hide();
	}

}