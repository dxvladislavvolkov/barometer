import { Component } from '@angular/core';
import { Service, CommitInfo } from './commits.service';

@Component({
  templateUrl: 'display-data.component.html'
})

export class DisplayDataComponent {
  sales: CommitInfo[];
  dataSource: any;

  constructor(service: Service) {
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
      store: service.getSales()
    }
  }

  citySelector(data) {
    return data.city + ' (' + data.country + ')';
  }
}
