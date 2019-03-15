import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Subject} from 'rxjs';
import devextremeData from '../../data/devextremeData.json';
import angularData from '../../data/angularData.json';
import devextremeAngularData from '../../data/devextremeAngularData.json';

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

    commitData: any;
    repoName: string;
    commitDataChange: Subject<any> = new Subject<any>();

    constructor(private http: HttpClient) {
        this.repoName = 'DevExtreme';
        this.commitData = devextremeData;
    }

    changeRepo(name) {
        this.repoName = name;
        
        switch (name) {
            case 'DevExtreme':
                this.commitData = devextremeData;
                break;
            
            case 'Angular':
                this.commitData = angularData;
                break;

            case 'Devextreme angular':
                this.commitData = devextremeAngularData;
                break;
        
            default:
                this.commitData = devextremeData;
                break;
        }

        this.commitDataChange.next(this.commitData);
    }
    
    getCommits() {
        return this.commitData;
    }
}