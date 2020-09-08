import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-welcome',
	templateUrl: './welcome.component.html',
	styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit()
	{
		if (this.authService.isAuthenticated())
		{
			this.router.navigate(["/boards"]);
		}
	}
}