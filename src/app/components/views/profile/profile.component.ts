import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from "@angular/router";

@Component({
	selector: 'profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
	profile: any = {};
	constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

	ngOnInit()
	{
		let username = this.route.snapshot.paramMap.get("username");
		this.authService.getUserProfile(username).subscribe(
		{
			next: (res) =>
			{
				this.profile = res.data;
			}, error: (err) =>
			{
				if (err.status == 404)
				{
					this.router.navigate(["/404"], {skipLocationChange: true});
				}
			}
		});
	}
}