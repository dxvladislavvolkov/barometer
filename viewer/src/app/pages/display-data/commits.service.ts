import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CommitsData {
    [key: string]: CommitInfo[];
}

export interface CommitInfo {
    date: string;
    additions: number;
    deleteons: number;
}

@Injectable()
export class Service {
    constructor(private http: HttpClient) { }
    
    getCommits() {
        return this.http.get<CommitsData>('http://172.22.9.103:1234/getData');
    }

}