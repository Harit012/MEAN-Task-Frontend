// csv-export.service.ts
import { Injectable } from '@angular/core';
import { DownloadRide } from './downloadRide.interface';

@Injectable({
  providedIn: 'root',
})
export class CsvExportService {
  constructor() {}

  downloadFile(data: any, filename: string = 'Ride History'): void {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(objArray: DownloadRide[]): string {
    objArray.forEach((element: DownloadRide) => {
      element.source = element.source.replaceAll(',', ' ');
      element.destination = element.destination.replaceAll(',', ' ');
      element.time = element.time.replaceAll(',', ' ');
    });
    const array = objArray;
    const header = Object.keys(array[0]).join(',');
    const rows = array.map((obj: DownloadRide) => Object.values(obj).join(','));
    return `${header}\n${rows.join('\n')}`;
  }
}
