import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private username: string;
	private justRegistered: boolean = false;
	private justLoggedOut: boolean = false;

	constructor(private http: HttpClient) { }

	login(username: string, password: string): Observable<any>
	{
		const data =
		{
			name: username,
			password: password
		};

		return this.http.post<any>("/users/login", data);
	}

	register(username: string, password: string, password2: string): Observable<any>
	{
		const data =
		{
			name: username,
			password: password,
			password2: password2
		};

		return this.http.post<any>("/users/register", data);
	}

	logout(): Observable<any>
	{
		return this.http.get<any>("/users/logout");
	}

	getUsername(): string
	{
		if (this.username != "" && this.username != null)
			return this.username;
		else
		{
			let array = document.cookie.split("=");
			if (array.length >= 2)
			{
				for (let i = 0; i < array.length; i++)
				{
					if (array[i] == "username" && i + 1 < array.length)
					{
						this.setUsername(array[i+1]);
						return this.username;
					}
				}
			}

			return "";
		}
	}

	setUsername(username: string)
	{
		this.username = username;
	}

	isAuthenticated()
	{
		return new Observable((subscriber) =>
		{
			this.http.get<any>("/users/user").subscribe((res) =>
			{
				subscriber.next(res.success == true);
			});
		});
	}

	getJustRegistered(): boolean
	{
		return this.justRegistered;
	}

	setJustRegistered(value: boolean)
	{
		this.justRegistered = value;
	}

	getJustLoggedOut(): boolean
	{
		return this.justLoggedOut;
	}

	setJustLoggedOut(value: boolean)
	{
		this.justLoggedOut = value;
	}
}