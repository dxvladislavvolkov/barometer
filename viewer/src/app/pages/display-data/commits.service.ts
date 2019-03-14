import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class CommitInfo {
    id: number;
    region: string;
    country: string;
    city: string;
    amount: number;
    date: string;
}

@Injectable()
export class Service {
    constructor(private http: HttpClient) { }
    
    getCommits() {
        return this.http.get<{ data: CommitInfo[] }>('http://172.22.9.103:1234/getData');
    }

}