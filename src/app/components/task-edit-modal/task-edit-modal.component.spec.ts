import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskEditModalComponent } from './task-edit-modal.component';

describe('TaskEditModalComponent', () => {
	let component: TaskEditModalComponent;
	let fixture: ComponentFixture<TaskEditModalComponent>;

	beforeEach(async(() => {
	  TestBed.configureTestingModule({
	    declarations: [ TaskEditModalComponent ]
	  })
	  .compileComponents();
	}));

	beforeEach(() => {
	  fixture = TestBed.createComponent(TaskEditModalComponent);
	  component = fixture.componentInstance;
	  fixture.detectChanges();
	});

	it('should create', () => {
	  expect(component).toBeTruthy();
	});
});
