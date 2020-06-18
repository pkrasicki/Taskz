import { Injectable } from '@angular/core';
import * as io from "socket.io-client";
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	private socket: any;
	private url: string = "ws://localhost:4000";

	constructor()
	{
		this.socket = io(this.url);
	}

	on(eventName: string)
	{
		return new Observable((subscriber) =>
		{
			this.socket.on(eventName, (data) =>
			{
				subscriber.next(data);
			});
		});
	}

	emit(eventName: string, data?: any)
	{
		if (data != null)
			this.socket.emit(eventName, data);
		else
			this.socket.emit(eventName);
	}
}