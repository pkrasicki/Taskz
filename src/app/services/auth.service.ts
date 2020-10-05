import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class AuthService {

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

	getCookie(keyName: string): string
	{
		let pairs = document.cookie.split(";");

		for (let pair of pairs)
		{
			let arr = pair.split("=");
			if (arr.length == 2)
			{
				if (arr[0].trim() == keyName)
					return arr[1];
			}
		}

		return null;
	}

	getUsername(): string
	{
		return this.getCookie("username");
	}

	isAuthenticated(): boolean
	{
		return this.getCookie("isAuthenticated") == "true";
	}

	getUserProfile(username): Observable<any>
	{
		return this.http.get<any>(`/users/${username}`);
	}
}