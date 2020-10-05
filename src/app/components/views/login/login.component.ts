import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	username: string;
	password: string;
	successMessages: string[] = [];
	errorMessages: string[] = [];
	infoMessages: string[] = [];

	constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) { }

	ngOnInit()
	{
		if (this.authService.isAuthenticated())
			this.router.navigate(["/boards"]);

		let justLoggedOut = this.route.snapshot.queryParamMap.get("loggedOut");
		let justRegistered = this.route.snapshot.queryParamMap.get("registered");
		let isRestrictedUrl = this.route.snapshot.queryParamMap.get("restrictedUrl");

		if (justLoggedOut)
			this.successMessages.push("You are now logged out");
		else if (justRegistered)
			this.successMessages.push("Registration complete. You can now log in");
		else if (isRestrictedUrl)
			this.infoMessages.push("You need to log in to access this page");
	}

	formSubmitted(e)
	{
		this.successMessages = [];
		this.errorMessages = [];
		this.infoMessages = [];

		this.authService.login(this.username, this.password).subscribe(
		{
			next: (res) =>
			{
				let destinationUrl = this.route.snapshot.queryParamMap.get("url");
				if (destinationUrl != null && destinationUrl != "" && destinationUrl != "/404")
					this.router.navigate([destinationUrl]);
				else
					this.router.navigate(["/boards"]);

			}, error: (err) =>
			{
				let message = err.error.message;
				if (message != null)
					this.errorMessages.push(message);
			}
		});
	}
}