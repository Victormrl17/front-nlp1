import { Component, OnInit } from '@angular/core';
import { HistorialService } from '../../services/historial.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial',
  standalone: true,
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
  imports: [CommonModule]
})
export class HistorialComponent implements OnInit {
  historial: any[] = [];
  registroSeleccionado: any = null;

  constructor(
    private historialService: HistorialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.historialService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial = data;
      },
      error: (err) => {
        console.error('Error al obtener el historial:', err);
        this.historial = [];
      }
    });
  }

  eliminarRegistro(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este linaje?')) {
      this.historialService.eliminarRegistro(id).subscribe({
        next: () => this.cargarHistorial(),
        error: (err) => console.error('Error al eliminar el registro:', err)
      });
    }
  }

  editarRegistro(record: any): void {
    const nuevoNombre = prompt('Ingrese el nuevo nombre para el linaje:', record.nombre);
    if (nuevoNombre && nuevoNombre.trim() !== '') {
      this.historialService.editarRegistro(record.id, { nombre: nuevoNombre.trim() }).subscribe({
        next: () => this.cargarHistorial(),
        error: (err) => console.error('Error al editar el registro:', err)
      });
    }
  }

  verRegistro(record: any): void {
    const datos = {
      linaje: record.linaje.linaje,
      nombre: record.nombre, 
      desdeHistorial: true
    };
    localStorage.setItem('linajeGuardado', JSON.stringify(datos));
    this.router.navigate(['/main/diagramas']);
  }
  
}
