import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	username: string;
	password: string;
	messages: string[] = [];
	errorMessages: string[] = [];
	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
		if (this.authService.getJustLoggedOut())
			this.messages.push("You are now logged out");
		else if (this.authService.getJustRegistered())
			this.messages.push("Registration complete. You can now log in");
	}

	formSubmitted(e)
	{
		this.messages = [];
		this.errorMessages = [];

		this.authService.login(this.username, this.password).subscribe(res =>
		{
			if (res.success == true)
			{
				this.authService.setUsername(res.data.name);
				this.authService.setJustRegistered(false);
				this.router.navigate(["/boards"]);
			}
		}, (err) =>
		{
			let message = err.error.message;
			if (message != null)
				this.errorMessages.push(message);
		});
	}
}