import { Component, ViewChild } from '@angular/core';
import { Service, CommitInfo } from '../../shared/services/commits.service';

import DataSource from "devextreme/ui/pivot_grid/data_source";


import {
  DxPivotGridComponent,
  DxChartComponent } from 'devextreme-angular';

@Component({
  templateUrl: 'display-data.component.html'
})

export class DisplayDataComponent {
  
  @ViewChild(DxPivotGridComponent) pivotGrid: DxPivotGridComponent;
  @ViewChild(DxChartComponent) chart: DxChartComponent;
  dataSource: any;
  commitData: any;
  minValue: number;
  maxValue: number;
  _commitDataSubscription: any;

  constructor(service: Service) {
    this.prepareData(service.getCommits());

    this._commitDataSubscription = service.commitDataChange.subscribe((value) => {
        this.prepareData(value);
    });
  }

  prepareData (commitData) {
    const fileNames = Object.keys(commitData);
 
      const dataItems = [];
      let maxIndex = 1;
      fileNames.forEach((fileName: string) => {
        const commits = commitData[fileName];
        const folderNames = fileName.split('/');
        let index = 0;
        const folderObject = folderNames.reduce((acc, item) => {
          index++;
          maxIndex = Math.max(index, maxIndex);
          acc[`folder${index}`] = item;

          return acc;
        }, {});

        dataItems.push(...commits.map(item => Object.assign({
          ...folderObject,
          totalCommits: commits.length,
          ...item
        })));
      })

      this.minValue = 0;
      this.maxValue = 600;

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
          dataField: 'commits',
          dataType: 'number',
          summaryType: "sum",
          area: 'data'
        }
      );

      this.dataSource = new DataSource( {
        fields,
        store: dataItems.map(item => Object.assign({
          commits: 1,
          changes: item.additions + item.deleteons
        }, item))
      });
  }

  ngAfterViewInit() {
    this.pivotGrid.instance.bindChart(this.chart.instance, {
      dataFieldsDisplayMode: "splitPanes",
      alternateDataFields: false
    });

    setTimeout(() => {
        var dataSource = this.pivotGrid.instance.getDataSource();
        dataSource.expandHeaderItem('row', ['North America']);
        dataSource.expandHeaderItem('column', [2013]);
    }, 0);
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
      cellElement.style.backgroundColor = `rgb(${color * 255}, 255, 255)`;

      
      cellElement.addEventListener("click", () => {
          window.open(`https://github.com/angular/angular/commits/19_1/${cell.rowPath.join('/')}`, '_blank')
      });
    }
  }
}
