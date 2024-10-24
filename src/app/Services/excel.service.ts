import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  exportToExcel(data: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Appointments');

    const colWidths = [
      { wch: 20 }, // Patient Name
      { wch: 15 }, // Date
      { wch: 10 }, // Time
      { wch: 25 }, // Email
      { wch: 15 }, // Mobile
      { wch: 30 }, // Reports
      { wch: 10 }, // Cost
      { wch: 15 }, // Type
      { wch: 15 }  // Branch
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  prepareAppointmentData(appointments: any[]): any[] {
    return appointments.map(app => ({
      'Patient Name': app.patientName,
      'Date': new Date(app.date).toLocaleDateString(),
      'Time': app.formattedTime,
      'Mobile': app.patientPhoneNumber,
      'Reports': app.reports,
      'Cost': app.cost,
      'Type': app.typeDescription,
      'Branch': app.branch,
      'Status': app.status === 0 ? 'upcoming' : 'done'
    }));
  }
}