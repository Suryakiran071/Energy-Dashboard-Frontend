import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnergyService {
  private apiUrl = '/api';
  private thresholdSource = new BehaviorSubject<number>(100); 
  currentThreshold = this.thresholdSource.asObservable();

  // Shared HTTP options for session-based requests
  private httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  updateThreshold(newLimit: number) {
    this.thresholdSource.next(newLimit);
  }

  getLines(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lines`, this.httpOptions);
  }

  getMeters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/meters`, this.httpOptions);
  }

  getReadings(lineId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/readings`, {
      params: {
        lineId: lineId.toString(),
        date: date
      },
      ...this.httpOptions
    });
  }

  getLineTotals(lineId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/lineTotals`, {
      params: {
        lineId: lineId.toString(),
        date: date
      },
      ...this.httpOptions
    });
  }

  getPeakReading(lineId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/peaks`, {
      params: {
        lineId: lineId.toString(),
        date: date
      },
      ...this.httpOptions
    });
  }

  getLineComparison(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/comparison/lines`, {
      params: { date },
      ...this.httpOptions
    });
  }

  getMeterComparison(lineId: number, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/comparison/meters`, {
      params: { lineId: lineId.toString(), date },
      ...this.httpOptions
    });
  }

createLine(line: any) {
  return this.http.post('http://localhost:8090/api/lines', line, this.httpOptions);
}

createMeter(meter: any) {
  return this.http.post('http://localhost:8090/api/meters', meter, this.httpOptions);
}

}

