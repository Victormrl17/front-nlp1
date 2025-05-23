import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { LinajeComponent } from '../options/linaje/linaje.component';
import { DiagramaComponent } from '../options/diagrama/diagrama.component';
import { HistorialComponent } from '../options/historial/historial.component';
import { InicioComponent } from '../options/inicio/inicio.component'; // Asegúrate que exista



@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    LinajeComponent,
    DiagramaComponent,
    HistorialComponent,
    InicioComponent 
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {}
