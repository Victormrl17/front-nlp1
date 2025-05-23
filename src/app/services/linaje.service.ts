import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LinajeService {
  // Usa la URL pública de Render. Cámbiala si ya tienes tu backend desplegado en otro dominio:
  private apiUrl = 'http://127.0.0.1:5000/api';  // REEMPLAZA por tu URL real

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  public sendQuery(query: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/tag_sql`, { query });
  }

  public getDependencies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_sql`);
  }

  public guardarRegistro(registro: any): Observable<any> {
    const userId = this.authService.getUserId();  
    const payload = {
      ...registro,
      user_id: userId                          
    };
    return this.http.post(`${this.apiUrl}/historial`, payload);
  }

  public obtenerHistorial(): Observable<any> {
    const userId = this.authService.getUserId();  
    return this.http.get(`${this.apiUrl}/historial?user_id=${userId}`);
  }

  public eliminarHistorial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/historial/${id}`);
  }

  public editarHistorial(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/historial/${id}`, data);
  }
}
