import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggableEditComponent } from './toggable-edit.component';

describe('ToggableEditComponent', () => {
	let component: ToggableEditComponent;
	let fixture: ComponentFixture<ToggableEditComponent>;

	beforeEach(async(() => {
	  TestBed.configureTestingModule({
	    declarations: [ ToggableEditComponent ]
	  })
	  .compileComponents();
	}));

	beforeEach(() => {
	  fixture = TestBed.createComponent(ToggableEditComponent);
	  component = fixture.componentInstance;
	  fixture.detectChanges();
	});

	it('should create', () => {
	  expect(component).toBeTruthy();
	});
});
