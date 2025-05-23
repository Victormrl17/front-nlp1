import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LinajeService } from '../../services/linaje.service';

@Component({
  selector: 'app-linaje',
  standalone: true,
  templateUrl: './linaje.component.html',
  styleUrls: ['./linaje.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LinajeComponent implements AfterViewInit {

  query: string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  invalidQueryMessage: string | null = null;
  validQueryMessage: string | null = null;
  archivoInvalido: boolean = false;
  cargandoArchivo: boolean = false;
  cargandoCodigo: boolean = false;
  activeTab: 'codigo' | 'archivo' = 'codigo';

  @ViewChild('sqlQuery') sqlQueryRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lineNumbers') lineNumbersRef!: ElementRef<HTMLElement>;

  constructor(private linajeService: LinajeService) {}

  ngAfterViewInit(): void {
    this.updateLineNumbers();
  }

  setActiveTab(tab: 'codigo' | 'archivo'): void {
    this.activeTab = tab;
    this.successMessage = null;
    this.errorMessage = null;
    this.invalidQueryMessage = null;
    this.validQueryMessage = null;
  }

  updateLineNumbers(): void {
    if (!this.sqlQueryRef || !this.lineNumbersRef) return;
    const textarea = this.sqlQueryRef.nativeElement;
    const lineNumbers = this.lineNumbersRef.nativeElement;

    const lines = textarea.value.split('\n');
    let content = '';
    for (let i = 0; i < lines.length || i < 1; i++) {
      content += (i + 1) + '\n';
    }
    lineNumbers.textContent = content;
  }

  onScroll(): void {
    if (!this.sqlQueryRef || !this.lineNumbersRef) return;
    this.lineNumbersRef.nativeElement.scrollTop = this.sqlQueryRef.nativeElement.scrollTop;
  }

  validateAndSendQuery(): void {
    const normalized = this.query.trim().toLowerCase();
    if (normalized.startsWith('select') || normalized.startsWith('insert')) {
      this.successMessage = null;
      this.errorMessage = null;
      this.validQueryMessage = null;
      this.invalidQueryMessage = null;
      this.cargandoCodigo = true;
      this.sendQuery(this.query);
    } else {
      this.invalidQueryMessage = 'Sentencia inválida: El texto ingresado debe ser una sentencia SQL.';
      this.errorMessage = null;
      this.successMessage = null;
    }
  }

  sendQuery(queryText: string): void {
    const cleanedQuery = queryText
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim();

    localStorage.removeItem('linajeGuardado');

    this.linajeService.sendQuery(cleanedQuery).subscribe({
      next: (data) => {
        console.log('Query enviado correctamente:', data);
        this.successMessage = 'Consulta procesada correctamente.';
        this.errorMessage = null;
        this.invalidQueryMessage = null;
        this.validQueryMessage = null;
        this.cargandoCodigo = false;

        const linaje = data.resultado.linaje;
        const linajeGuardado = {
          linaje: linaje,
          nombre: 'Linaje generado'
        };
        localStorage.setItem('linajeGuardado', JSON.stringify(linajeGuardado));
      },
      error: (err) => {
        console.error('Error al enviar la consulta:', err);
        this.errorMessage = 'Ocurrió un error al procesar el query.';
        this.successMessage = null;
        this.invalidQueryMessage = null;
        this.validQueryMessage = null;
        this.cargandoCodigo = false;
      }
    });
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput && !this.cargandoArchivo) {
      fileInput.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoInvalido = false;
    this.successMessage = null;
    this.errorMessage = null;
    this.invalidQueryMessage = null;
    this.validQueryMessage = null;
    this.cargandoArchivo = false;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension !== 'sql') {
        this.archivoInvalido = true;
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const queryFromFile = (reader.result as string || '').trim();

        if (!queryFromFile) {
          this.invalidQueryMessage = 'El archivo está vacío. Por favor, suba una consulta SQL válida.';
          this.cargandoArchivo = false;
          input.value = '';
          return;
        }

        const normalized = queryFromFile.toLowerCase().trim();
        if (!normalized.startsWith('select') && !normalized.startsWith('insert')) {
          this.invalidQueryMessage = 'El contenido del archivo no contiene una consulta SQL válida.';
          this.cargandoArchivo = false;
          input.value = '';
          return;
        }

        this.cargandoArchivo = true;

        const cleanedQuery = queryFromFile
          .replace(/\n/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/\s\s+/g, ' ')
          .trim();

        this.linajeService.sendQuery(cleanedQuery).subscribe({
          next: (data) => {
            console.log('Consulta desde archivo procesada:', data);
            this.successMessage = 'Consulta procesada correctamente.';
            this.errorMessage = null;
            this.invalidQueryMessage = null;
            this.validQueryMessage = null;
            this.cargandoArchivo = false;

            const linaje = data.resultado.linaje;
            const linajeGuardado = {
              linaje: linaje,
              nombre: 'Linaje generado'
            };
            localStorage.setItem('linajeGuardado', JSON.stringify(linajeGuardado));
            input.value = '';
          },
          error: (err) => {
            console.error('Error al procesar archivo:', err);
            this.errorMessage = 'Error al procesar la consulta del archivo.';
            this.successMessage = null;
            this.invalidQueryMessage = null;
            this.validQueryMessage = null;
            this.cargandoArchivo = false;
            input.value = '';
          }
        });
      };

      reader.readAsText(file);
    }
  }
}
