import { Component } from '@angular/core';
import { Service, CommitInfo } from '../../shared/services/commits.service';
import { isNgTemplate } from '@angular/compiler';

@Component({
  templateUrl: 'display-data.component.html'
})

export class DisplayDataComponent {
  dataSource: any;
  minValue: number;
  maxValue: number;
  _commitDataSubscription: any;

  constructor(service: Service) {
    this.prepareData(service.getCommits());

    this._commitDataSubscription = service.commitDataChange.subscribe((value) => {
        this.prepareData(value);
    });    
  }

  prepareData(data) {
    const fileNames = Object.keys(data);

      const dataItems = [];

      fileNames.forEach((path: string) => {
        const commits = data[path].map(item => {
          return {
            ...item,
            date: new Date(item.date)
          };
        });
        const folderNames = path.split('/');
        const fileName = folderNames.pop();
        const folderPath = folderNames.join('/');

        let rootPath = '';
        for (let i = 0; i < folderNames.length; i++) {
          const path = (rootPath ? rootPath + '/' : '') + folderNames[i];
          if (!dataItems.find(item => item.ID === path)) {
            const item: any = {
              ID: path,
              name: folderNames[i],
              commits
            };
            if (rootPath) item.Folder_ID = rootPath;
            dataItems.push(item);
          }

          rootPath = (rootPath ? rootPath + '/' : '') + folderNames[i];
        }


        const startDate = new Date(2017, 1, 1);
        const endDate = new Date();

        dataItems.push({
          ID: path,
          name: fileName,
          Folder_ID: folderPath,
          commits
        });
      })

      this.minValue = 0;
      this.maxValue = 600;

      this.dataSource = dataItems;
  }

  log(data) {
    console.log(data);
  }

  cellPrepared(args) {
    const { cell, cellElement } = args;

    if (cell.value) {
      const color = 1 - (cell.value - this.minValue) / (this.maxValue - this.minValue);
      cellElement.style.backgroundColor = `rgb(${color * 255}, 255, 255)`;
    }
  }
}
