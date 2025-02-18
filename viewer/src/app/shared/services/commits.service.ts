import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Subject} from 'rxjs';
import devextremeData from '../../data/devextremeData.json';
import angularData from '../../data/angularData.json';
import devextremeAngularData from '../../data/devextremeAngularData.json';
import testcafeData from '../../data/testcafeData.json';

export interface CommitsData {
    [key: string]: CommitInfo[];
}

export interface CommitInfo {
    date: string;
    additions: number;
    deleteons: number;
    type: string;
}

@Injectable()
export class Service {

    commitData: any;
    repoName: string;
    commitDataChange: Subject<any> = new Subject<any>();

    constructor(private http: HttpClient) {
        this.repoName = 'DevExpress/DevExtreme';
        this.commitData = devextremeData;
    }

    changeRepo(name) {
        this.repoName = name;
        switch (name) {
            case 'DevExpress/DevExtreme':
                this.commitData = devextremeData;
                break;
            
            case 'angular/angular':
                this.commitData = angularData;
                break;

            case 'DevExpress/devextreme-angular':
                this.commitData = devextremeAngularData;
                break;
            
            case 'DevExpress/testcafe':
                this.commitData = testcafeData;
                break;
        
            default:
                this.commitData = devextremeData;
                break;
        }

        this.commitDataChange.next(this.commitData);
    }
    
    getCommits() {
        debugger;
        return devextremeData;
    }
}