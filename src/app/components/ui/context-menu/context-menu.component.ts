import { Component, OnInit, ViewChild, HostListener } from '@angular/core';

@Component({
	selector: 'ui-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent implements OnInit {
	@ViewChild("contextMenu", {static: false}) element;
	isVisible: boolean = false;
	isOnScreen: boolean = false;
	constructor() { }

	ngOnInit() {
	}

	show(buttonRect, isNavMenu: boolean = false, centered: boolean = false)
	{
		let posX, posY;
		let margin = 5;

		if (centered)
		{
			const rect = this.element.nativeElement.getBoundingClientRect();
			posX = buttonRect.x - (rect.width / 4) + margin;
			posY = buttonRect.y + buttonRect.height;
			this.element.nativeElement.style.left = `${posX + margin}px`;
			this.element.nativeElement.style.top = `${posY + margin}px`;

		} else if (!isNavMenu)
		{
			posX = buttonRect.x + buttonRect.width / 2;
			posY = buttonRect.y + buttonRect.height / 2;
			posX += margin;
			posY += margin;
			this.element.nativeElement.style.left = `${posX}px`;
			this.element.nativeElement.style.top = `${posY}px`;

		} else
		{
			this.element.nativeElement.style.right = `0px`;
			this.element.nativeElement.style.marginTop = `${margin}px`;
		}

		this.isVisible = true;
		setTimeout(() => {this.isOnScreen = true}, 50);
	}

	hide()
	{
		this.isVisible = false;
		setTimeout(() => {this.isOnScreen = false}, 50);
	}

	toggle(buttonRect, isNavMenu: boolean = false, centered: boolean = false)
	{
		if (this.isVisible)
			this.hide();
		else
			this.show(buttonRect, isNavMenu, centered);
	}

	@HostListener("window:keydown", ["$event"])
	keydown(e: KeyboardEvent)
	{
		if (e.key == "Escape")
			this.hide();
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