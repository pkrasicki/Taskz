import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
	username: string;
	password: string;
	password2: string;
	messages: string[] = [];
	constructor(private authService: AuthService, private router: Router) { }

	ngOnInit() {
	}

	formSubmitted(e)
	{
		this.messages = [];

		if (this.username == null || this.username == "" || this.password == null || this.password == "" ||
			this.password2 == null || this.password2 == "")
		{
			this.messages.push("Please fill in all of the fields");
			return;
		}

		if (this.password.length < 8)
		{
			this.messages.push("Passwords need to be at least 8 characters long");
			return;
		}

		if (this.password != this.password2)
		{
			this.messages.push("Passwords don't match");
			return;
		}

		this.authService.register(this.username, this.password, this.password2).subscribe((res) =>
		{
			if (res.success == true)
			{
				res.messages = [];
				this.router.navigate(["/login"], {queryParams: {registered: true}});
			}
		}, (err) =>
		{
			if (err.error.data != null && err.error.data.length > 0)
				this.messages = err.error.data;
		});
	}
}