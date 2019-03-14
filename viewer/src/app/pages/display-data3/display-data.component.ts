import { Component, ViewChild } from '@angular/core';
import { Service, CommitInfo } from '../../shared/services/commits.service';
import DataSource from "devextreme/ui/pivot_grid/data_source";

import {
  DxPivotGridComponent,
  DxChartComponent } from 'devextreme-angular';

@Component({
  templateUrl: 'display-data.component.html',
  styles: [
    `
      :host ::ng-deep .dx-pivotgrid .dx-word-wrap .dx-pivotgrid-collapsed > span {
        display: none;
      }
    `
  ]
})

export class DisplayDataComponent {
  @ViewChild(DxPivotGridComponent) pivotGrid: DxPivotGridComponent;
  @ViewChild(DxChartComponent) chart: DxChartComponent;

  dataSource: DataSource;
  minValue: number;
  maxValue: number;

  constructor(service: Service) {
    service.getCommits().subscribe((data) => {
      const fileNames = Object.keys(data);
      
      const dataItems = [];
      fileNames.forEach((fileName: string) => {
        const commits = data[fileName];

        dataItems.push(...commits.map(item => Object.assign({
          ...item,
          totalCommits: commits.length,
          folder: fileName
        })));
      })

      this.minValue = 0;
      this.maxValue = 30;
 
      const fields = [];
      fields.push({
        caption: 'Folder',
        dataField: `folder`,
        area: 'row'
      });
      fields.push(
        { area: "column", dataField: "date", dataType: "date", groupInterval: "year" },
        { area: "column", dataField: "date", dataType: "date", groupInterval: "quarter" },
        { area: "column", dataField: "date", dataType: "date", groupInterval: "month" },
        { area: "column", dataField: "date", dataType: "date", groupInterval: "day" },

        {
          caption: 'Commits',
          dataField: 'commits',
          dataType: 'number',
          summaryType: "sum",
          area: 'data'
        }
      );

      this.dataSource = new DataSource({
        fields,
        store: dataItems.map(item => Object.assign({
          commits: 1,
          changes: item.additions + item.deleteons
        }, item)),
        filter: ["totalCommits", ">", 50],
      });
    });
  }

  ngAfterViewInit() {
    this.pivotGrid.instance.bindChart(this.chart.instance, {
      dataFieldsDisplayMode: "splitPanes",
      alternateDataFields: false
    });
  }
  
  customizeTooltip(args) {
    return {
      html: args.seriesName + " | Total<div class='currency'>" + args.valueText + "</div>"
    };
  }

  slideChanged(args) {
    this.dataSource.filter(["totalCommits", ">", args.value]);
    this.dataSource.reload();
  }

  cellPrepared(args) {
    const { cell, cellElement } = args;

    if (cell.value) {
      const color = 1 - (cell.value - this.minValue) / (this.maxValue - this.minValue);
      cellElement.style.backgroundColor = `rgb(255, ${color * 100 + 155}, ${color * 100 + 155})`;

      cellElement.addEventListener("click", () => {
        window.open(`https://github.com/DevExpress/DevExtreme/commits/19_1/${cell.rowPath.join('/')}`, '_blank')
    });
    }
  }
}
