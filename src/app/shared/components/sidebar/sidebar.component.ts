import { Component } from '@angular/core';
import { HistorialComponent } from '../../../options/historial/historial.component';
import { DiagramaComponent } from '../../../options/diagrama/diagrama.component';
import { LinajeComponent } from '../../../options/linaje/linaje.component';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MainComponent } from '../../../main/main.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HistorialComponent,DiagramaComponent,LinajeComponent,CommonModule,RouterLink,RouterOutlet,MainComponent,RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

}
