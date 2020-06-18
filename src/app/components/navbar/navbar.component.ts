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
	@ViewChild("userMenu", {static: false}) userMenu;
	@ViewChild("profileBtn", {static: false}) profileBtn;
	@Output() createBoardClick: EventEmitter<any> = new EventEmitter();
	username: string;

	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
		this.username = this.authService.getUsername();
	}

	logout()
	{
		this.authService.logout().subscribe(res =>
		{
			if (res.success)
			{
				this.authService.setJustLoggedOut(true);
				this.router.navigate(["/login"]);
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
}