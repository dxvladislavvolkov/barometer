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
    service.getCommits().subscribe(({ data }) => {
      this.minValue = Math.min(...data.map(item => item.amount));
      this.maxValue = Math.max(...data.map(item => item.amount));

      this.dataSource = {
        fields: [{
          caption: 'Folder/File',
          width: 120,
          dataField: 'region',
          area: 'row'
        }, {
          caption: 'City',
          dataField: 'city',
          width: 150,
          area: 'row',
          selector: this.citySelector
        }, {
          dataField: 'date',
          dataType: 'date',
          area: 'column'
        }, {
          caption: 'Commits',
          dataField: 'amount',
          dataType: 'number',
          summaryType: 'sum',
          format: 'currency',
          area: 'data'
        }],
        store: data
      }
    });
  }

  citySelector(data) {
    return data.city + ' (' + data.country + ')';
  }

  cellPrepared(args) {
    const { cell, cellElement } = args;

    if (cell.value) {
      const color = (cell.value - this.minValue) / (this.maxValue - this.minValue);
      cellElement.style.backgroundColor = `rgb(${color * 255}, 255, 255)`;
    }
  }
}
