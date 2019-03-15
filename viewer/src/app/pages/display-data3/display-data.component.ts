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

  dataSource: DataSource;
  minValue: number;
  maxValue: number;

  sliderValue = 50;

  constructor(service: Service) {
    service.getCommits().subscribe((data) => {
      const fileNames = Object.keys(data);
      
      const dataItems = [];
      fileNames.forEach((fileName: string) => {
        const commits = data[fileName];

        dataItems.push(...commits.map(item => {
          const prevCommits = commits.filter(itm => {
            const itemDate = new Date(item.date);
            const quarterDate = new Date(itemDate);
            quarterDate.setMonth(quarterDate.getMonth() - 3);
            const commitDate = new Date(itm.date);
            return itemDate > commitDate && commitDate > quarterDate;
          });
          const totalFixes = prevCommits.filter(itm => itm.type === 'fix').length;

          return {
            ...item,
            totalCommits: commits.length,
            relation: prevCommits.length ? Math.round(totalFixes / prevCommits.length * 100) : 0,
            folder: fileName
          };
        }));
      })

      this.minValue = 20;
      this.maxValue = 100;
 
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

        {
          caption: 'Commits',
          dataField: 'relation',
          dataType: 'number',
          summaryType: "avg",
          format: {
            type: "decimal",
            precision: 2
          },
          area: 'data'
        }
      );

      this.dataSource = new DataSource({
        fields,
        store: dataItems,
        filter: ["totalCommits", ">", this.sliderValue],
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
