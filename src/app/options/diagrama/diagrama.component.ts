import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinajeService } from '../../services/linaje.service';
import { AuthService } from '../../services/auth.service';
import cytoscape from 'cytoscape';
import { FormsModule } from '@angular/forms';
import { HistorialService } from '../../services/historial.service';

declare var bootstrap: any;

interface Dependency {
  source_tables: string[];
  source_columns: string[];
  target_table: string;
  target_columns: string[];
}

@Component({
  selector: 'app-diagrama',
  standalone: true,
  templateUrl: './diagrama.component.html',
  styleUrls: ['./diagrama.component.css'],
  imports: [CommonModule, FormsModule]
})
export class DiagramaComponent implements OnInit, AfterViewInit {

  dependencies: Dependency[] = [];
  noData: boolean = false;
  cy: any;
  initialized: boolean = false;

  nombreLinaje: string = '';
  errorNombre: string | null = null;
  historialExistente: any[] = [];

  cargandoDesdeHistorial: boolean = false;
  nombreLinajeMostrado: string = '';

  constructor(
    private linajeService: LinajeService,
    private historialService: HistorialService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const linajeGuardado = localStorage.getItem('linajeGuardado');
    if (linajeGuardado) {
      const linajeData = JSON.parse(linajeGuardado);
      if (linajeData && linajeData.linaje && Array.isArray(linajeData.linaje)) {
        this.dependencies = linajeData.linaje;
        this.nombreLinajeMostrado = linajeData.nombre || '';
        this.noData = this.dependencies.length === 0;
        setTimeout(() => this.initializeCytoscape(), 100);
        this.cargandoDesdeHistorial = linajeData.desdeHistorial === true;
      }
      localStorage.removeItem('linajeGuardado');
    } else {
      this.loadDependencies();
    }
  }

  ngAfterViewInit(): void {}

  loadDependencies(): void {
    this.linajeService.getDependencies().subscribe({
      next: (response) => {
        const resultado = response.resultado;
        if (resultado && resultado.linaje && resultado.linaje.length > 0) {
          this.dependencies = resultado.linaje;
          this.noData = false;
          setTimeout(() => this.initializeCytoscape(), 100);
        } else {
          this.dependencies = [];
          this.noData = true;
        }
      },
      error: (error) => {
        console.error('Error al obtener dependencias:', error);
        this.dependencies = [];
        this.noData = true;
      }
    });
  }

  initializeCytoscape(): void {
    const container = document.getElementById('diagram-container');
    if (!container || this.dependencies.length === 0) return;

    const elements: any[] = [];
    const addedNodes = new Set<string>();
    const sourceNodes = new Set<string>();
    const targetNodes = new Set<string>();

    this.dependencies.forEach(dep => {
      dep.source_tables.forEach(source => sourceNodes.add(source));
      targetNodes.add(dep.target_table);
    });

    this.dependencies.forEach(dep => {
      dep.source_tables.forEach(source => {
        if (!addedNodes.has(source)) {
          elements.push({
            data: {
              id: source,
              label: source,
              type: sourceNodes.has(source) && !targetNodes.has(source) ? 'source' : 'mixed'
            }
          });
          addedNodes.add(source);
        }
      });

      if (!addedNodes.has(dep.target_table)) {
        elements.push({
          data: {
            id: dep.target_table,
            label: dep.target_table,
            type: targetNodes.has(dep.target_table) && !sourceNodes.has(dep.target_table) ? 'target' : 'mixed'
          }
        });
        addedNodes.add(dep.target_table);
      }

      dep.source_tables.forEach(source => {
        elements.push({
          data: { id: `${source}_${dep.target_table}`, source: source, target: dep.target_table }
        });
      });
    });

    this.cy = cytoscape({
      container: container,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'shape': 'round-rectangle',
            'background-color': '#d4edda',
            'border-width': 2,
            'border-color': '#155724',
            'font-size': '11px',
            'color': '#155724',
            'padding': '8px',
            'width': 'label',
            'height': 'label'
          }
        },
        {
          selector: 'node[type="source"]',
          style: {
            'background-color': '#cce5ff',
            'border-color': '#004085',
            'color': '#004085'
          }
        },
        {
          selector: 'node[type="target"]',
          style: {
            'background-color': '#f8d7da',
            'border-color': '#721c24',
            'color': '#721c24'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#155724',
            'target-arrow-color': '#155724',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 80,
        spacingFactor: 2.2,
        animate: true,
        animationDuration: 500
      }
    });

    this.cy.ready(() => {
      setTimeout(() => {
        this.cy.fit(undefined, 80);
      }, 100);
    });
  }

  abrirModalGuardar(): void {
    this.nombreLinaje = '';
    this.errorNombre = null;

    this.historialService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historialExistente = data;
        const modalElement = document.getElementById('guardarModal');
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
      }
    });
  }

  guardarLinaje(): void {
    const nombre = this.nombreLinaje.trim();

    if (!nombre) {
      this.errorNombre = 'Debe ingresar un nombre.';
      return;
    }

    const nombreExistente = this.historialExistente.some(
      (registro: any) => registro.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (nombreExistente) {
      this.errorNombre = 'El nombre ingresado ya existe, elija otro.';
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.errorNombre = 'No se pudo identificar al usuario.';
      return;
    }

    const registro = {
      nombre: nombre,
      linaje: { linaje: this.dependencies },
      user_id: userId
    };

    this.historialService.guardarRegistro(registro).subscribe({
      next: () => {
        this.errorNombre = null;
        this.nombreLinaje = '';
        const modalElement = document.getElementById('guardarModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        }
        alert('Linaje guardado exitosamente.');
      },
      error: (err) => {
        console.error('Error al guardar el linaje:', err);
        alert('Ocurrió un error al guardar el linaje.');
      }
    });
  }
}
