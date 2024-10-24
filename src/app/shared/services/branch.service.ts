
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 

interface Branch {
  branchID: number;
  branchName: string;
  branchLocation: string;
  phoneNumbers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  constructor(private http: HttpClient) {}

  getBranches(): Observable<Branch[]> {
    return this.http.get<any[]>('http://localhost:5275/api/PhoneNumbers').pipe(
      map(branches => 
        branches.reduce((acc: Branch[], current) => {
          const branch = acc.find((b: Branch) => b.branchID === current.branchID);
          if (branch) {
            branch.phoneNumbers.push(current.phonenumber);
          } else {
            acc.push({
              branchID: current.branchID,
              branchName: current.branchName,
              branchLocation: current.branchLocation,
              phoneNumbers: [current.phonenumber]
            });
          }
          return acc;
        }, [])
      )
    );
  }
}