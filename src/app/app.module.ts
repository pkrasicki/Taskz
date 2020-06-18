import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/views/board/board.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskComponent } from './components/task/task.component';
import { TaskEditModalComponent } from './components/task-edit-modal/task-edit-modal.component';
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from './components/ui/button/button.component';
import { TextInputComponent } from './components/ui/text-input/text-input.component';
import { ToggableEditComponent } from './components/ui/toggable-edit/toggable-edit.component';
import { DashboardComponent } from './components/views/dashboard/dashboard.component';
import { WelcomeComponent } from './components/views/welcome/welcome.component';
import { LoginComponent } from './components/views/login/login.component';
import { RegisterComponent } from './components/views/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContextMenuComponent } from './components/ui/context-menu/context-menu.component';
import { ModalComponent } from './components/ui/modal/modal.component';
import { BoardListItemComponent } from './components/board-list-item/board-list-item.component';
import { TextareaComponent } from './components/ui/textarea/textarea.component';

@NgModule({
	declarations: [
	  AppComponent,
	  BoardComponent,
	  TaskListComponent,
	  TaskComponent,
	  TaskEditModalComponent,
	  ButtonComponent,
	  TextInputComponent,
	  ToggableEditComponent,
	  DashboardComponent,
	  WelcomeComponent,
	  LoginComponent,
	  RegisterComponent,
	  NavbarComponent,
	  ContextMenuComponent,
	  ModalComponent,
	  BoardListItemComponent,
	  TextareaComponent
	],
	imports: [
	  BrowserModule,
	  HttpClientModule,
	  AppRoutingModule,
	  FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
