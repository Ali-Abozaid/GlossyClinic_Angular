import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookDashboardService {

  constructor(private _HttpClient: HttpClient) { }


  getDoctor():Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/Doctor`);
  }

  getbranchs():Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/Branch`);
  }

  getDoctorBranch():Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/DoctorWorkBranch`);
  }

  getPatient():Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/Patient/GetAllPatientsWithHistory`);
  }

  getAppoinments():Observable<any>{
    return this._HttpClient.get(`http://localhost:5275/api/Appoinment`);
  }

  postDataAppoinment(appointment:any):Observable<any>{
    return this._HttpClient.post(`http://localhost:5275/api/Appoinment`,appointment);
  }
  postPatient(patient:any):Observable<any>{
    return this._HttpClient.post(`http://localhost:5275/api/Patient/AddPatientWithHistory`,patient);

  }
  

}
