import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private api = 'http://localhost:5000/api/cv';

  constructor(private http: HttpClient) {}

  getUsers(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.api}?page=${page}&limit=${limit}`);
  }

  addUser(data: any) {
    return this.http.post(this.api, data);
  }

  updateUser(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  generatePdf(id: number) {
    window.open(`${this.api}/${id}/pdf`, '_blank');
  }
}