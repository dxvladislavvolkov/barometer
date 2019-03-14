import { Component } from '@angular/core';
import { Service, CommitInfo } from './commits.service';

@Component({
  templateUrl: 'display-data.component.html'
})

export class DisplayDataComponent {
  dataSource: any;
  minValue: number;
  maxValue: number;

  constructor(service: Service) {
    const commits = service.getCommits();
    this.minValue = Math.min(...commits.map(item => item.amount));
    this.maxValue = Math.max(...commits.map(item => item.amount));

    this.dataSource = {
      fields: [{
        caption: 'Region',
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
        caption: 'Sales',
        dataField: 'amount',
        dataType: 'number',
        summaryType: 'sum',
        format: 'currency',
        area: 'data'
      }],
      store: commits
    }
  }

  citySelector(data) {
    return data.city + ' (' + data.country + ')';
  }

  cellPrepared(args) {
    const { cell, cellElement } = args;

    if (cell.value) {
      const color = (cell.value - this.minValue) / (this.maxValue - this.minValue);
      console.log(color)
      cellElement.style.backgroundColor = `rgb(${color * 255}, 255, 255)`; 
    }
  }
}
