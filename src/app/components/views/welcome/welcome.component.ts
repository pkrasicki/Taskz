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
		this.authService.getUserData().subscribe((res) =>
		{
			if (res.success == true)
				this.router.navigate(["/boards"]);
		}, (err) =>
		{
			// do nothing
		});
	}
}