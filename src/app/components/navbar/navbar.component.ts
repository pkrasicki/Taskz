import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Board } from 'src/app/models/board';
import { Router } from '@angular/router';

@Component({
	selector: 'navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
	@Input("board") board: Board;
	@Input("isDashboard") isDashboard: boolean = false;
	@ViewChild("userMenu", {static: false}) userMenu;
	@ViewChild("profileBtn", {static: false}) profileBtn;
	@Output() createBoardClick: EventEmitter<any> = new EventEmitter();
	currentUrl: string;

	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit()
	{
		this.currentUrl = this.router.url;
	}

	logout()
	{
		this.authService.logout().subscribe(
		{
			next: (res) =>
			{
				this.router.navigate(["/login"], {queryParams: {loggedOut: true}});
			}
		});
	}

	userMenuClicked(e)
	{
		let rect = this.profileBtn.element.nativeElement.getBoundingClientRect();
		this.userMenu.toggle(rect, true);
	}

	createBoardClicked(e)
	{
		this.createBoardClick.emit(e);
	}

	getUsername(): string
	{
		return this.authService.getUsername() || "";
	}

	isAuthenticated(): boolean
	{
		return this.authService.isAuthenticated();
	}

	isBoardOwner(): boolean
	{
		if (this.isAuthenticated() && this.getUsername() == this.board.ownerUsername)
			return true;
		else
			return false;
	}
}