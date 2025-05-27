
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private API_URL = 'https://front-nlp1-9e15.vercel.app/';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Guardar un nuevo linaje
  guardarRegistro(data: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/historial`, data);
  }

  // Obtener todos los historiales
  obtenerHistorial(): Observable<any[]> {
    const userId = this.authService.getUserId();
    return this.http.get<any[]>(`${this.API_URL}/historial?user_id=${userId}`);
  }

  // Eliminar un historial por ID
  eliminarRegistro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/historial/${id}`);
  }

  // Editar el nombre de un historial por ID
  editarRegistro(id: number, data: { nombre: string }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/historial/${id}`, data);
  }

  // (Opcional futuro) Obtener historial específico por ID
  obtenerRegistroPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/historial/${id}`);
  }


  
}
