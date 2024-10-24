import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private _HttpClient:HttpClient) { }

  getPatientData(): Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/Patient/GetAllPatientsWithHistory`);
  }

  getPatientById(id:number):Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/Patient/${id}`);
  }

  updatePatientData(id:number,patientData:any):Observable<any>{
    return this._HttpClient.put(`http://localhost:5275/api/Patient/EditPatient/${id}`,patientData);
  }

  DeletePatientData(id:number):Observable<any>{
    return this._HttpClient.delete(`http://localhost:5275/api/Patient/DeletePatient/${id}`);
  }

}
