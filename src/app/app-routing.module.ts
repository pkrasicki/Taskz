import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/views/dashboard/dashboard.component';
import { BoardComponent } from './components/views/board/board.component';
import { WelcomeComponent } from './components/views/welcome/welcome.component';
import { LoginComponent } from './components/views/login/login.component';
import { RegisterComponent } from './components/views/register/register.component';
import { NotFoundComponent } from './components/views/not-found/not-found.component';


const routes: Routes = [
	{ path: "", component: WelcomeComponent },
	{ path: "login", component: LoginComponent },
	{ path: "register", component: RegisterComponent },
	{ path: "boards", component: DashboardComponent },
	{ path: ":username/:boardName", component: BoardComponent },
	{ path: "**" , component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
