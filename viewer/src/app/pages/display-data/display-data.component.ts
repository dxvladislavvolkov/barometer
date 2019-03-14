import { Component } from '@angular/core';
import { Service } from './commits.service';

@Component({
  templateUrl: 'display-data.component.html'
})

export class DisplayDataComponent {
  dataSource: any;
  minValue: number;
  maxValue: number;

  constructor(service: Service) {
    service.getCommits().subscribe((data) => {
      const fileNames = Object.keys(data);

      const res = [];
      let maxIndex = 1;
      fileNames.forEach((fileName) => {
        const commitInfo = data[fileName];
        const folderNames = fileName.split('/');
        let index = 0;
        const folderObject = folderNames.reduce((acc, item) => {
          index++;
          maxIndex = Math.max(index, maxIndex);
          acc[`folder${index}`] = item;

          return acc;
        }, {});

        res.push(...commitInfo.map(item => Object.assign(folderObject, item)));
      })

      this.minValue = 0;
      this.maxValue = res.reduce((acc, item) => acc + item.changes, 0);

      // this.startDate = new Date(Math.min.apply(null, res.map(item => new Date(item.date))));
      // this.endDate = new Date(Math.max.apply(null, res.map(item => new Date(item.date))));

      const fields = [];
      for (let i = 1; i < maxIndex; i++) {
        fields.push({
          caption: 'Folder',
          dataField: `folder${i}`,
          area: 'row'
        });
      }
      fields.push(
        { area: "column", dataField: "date", dataType: "date", groupInterval: "year" },
        { area: "column", dataField: "date", dataType: "date", groupInterval: "quarter" },
        { area: "column", dataField: "date", dataType: "date", groupInterval: "month" },
        { area: "column", dataField: "date", dataType: "date", groupInterval: "day" },

        {
          caption: 'Commits',
          dataField: 'changes',
          dataType: 'number',
          summaryType: "sum",
          area: 'data'
        }
      );

      this.dataSource = {
        fields,
        store: res
      }
    });
  }

  cellPrepared(args) {
    const { cell, cellElement } = args;

    if (cell.value) {
      const color = 1 - (cell.value - this.minValue) / (this.maxValue - this.minValue);
      cellElement.style.backgroundColor = `rgb(${color * 255}, 255, 255)`;
    }
  }
}
