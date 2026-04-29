import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnergyService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getLines(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lines`);
  }

  getMeters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/meters`);
  }

  // CHANGE: renamed meterId to lineId to match your dashboard's needs
  getReadings(lineId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/readings`, {
      params: {
        lineId: lineId.toString(),
        date: date
      }
    });
  }

  getLineTotals(lineId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/lineTotals`, {
      params: {
        lineId: lineId.toString(),
        date: date
      }
    });
  }

  // CHANGE: renamed meterId to lineId so the Admin/Operator sees the peak for the whole line
  getPeakReading(lineId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/peaks`, {
      params: {
        lineId: lineId.toString(),
        date: date
      }
    });
  }

  getLineComparison(date: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/analytics/comparison/lines`, {
    params: { date }
  });
}

getMeterComparison(lineId: number, date: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/analytics/comparison/meters`, {
    params: { lineId: lineId.toString(), date }
  });
}
}