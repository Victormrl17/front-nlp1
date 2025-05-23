import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainComponent } from './main/main.component';
import { LinajeComponent } from './options/linaje/linaje.component';
import { DiagramaComponent } from './options/diagrama/diagrama.component';
import { HistorialComponent } from './options/historial/historial.component';
import { AuthGuard } from './services/auth.guard';
import { NoAuthGuard } from './services/no-auth.guard';
import { InicioComponent } from './options/inicio/inicio.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [NoAuthGuard] },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }, 
      { path: 'inicio', component: InicioComponent },
      { path: 'linaje', component: LinajeComponent },
      { path: 'diagramas', component: DiagramaComponent },
      { path: 'historial', component: HistorialComponent }
    ]
  }
];
