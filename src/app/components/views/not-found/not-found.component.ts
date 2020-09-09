import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'not-found',
	templateUrl: './not-found.component.html',
	styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

	isBoard: boolean = false;
	constructor(private route: ActivatedRoute) { }

	ngOnInit()
	{
		let isBoardString = this.route.snapshot.queryParamMap.get("isBoard");
		if (isBoardString)
			this.isBoard = true;
	}
}