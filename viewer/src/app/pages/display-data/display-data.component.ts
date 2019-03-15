import { Component, ViewChild } from '@angular/core';
import { Service, CommitInfo } from '../../shared/services/commits.service';

import DataSource from "devextreme/ui/pivot_grid/data_source";

import {
  DxPivotGridComponent,
  DxChartComponent
} from 'devextreme-angular';

@Component({
  templateUrl: 'display-data.component.html'
})

export class DisplayDataComponent {

  @ViewChild(DxPivotGridComponent) pivotGrid: DxPivotGridComponent;
  @ViewChild(DxChartComponent) chart: DxChartComponent;
  dataSource: any;
  minValue: number;
  maxValue: number;

  startDate: Date;
  endDate: Date;
  minDate: Date = new Date();
  maxDate: Date = new Date();

  tags: string[];
  selectedTags: string[] = [];

  sliderValue = 30;

  constructor(service: Service) {
    service.getCommits().subscribe((data) => {
      const fileNames = Object.keys(data);

      const dataItems = [];
      let maxIndex = 1;
      fileNames.forEach((fileName: string) => {
        const commits = data[fileName];
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

      this.startDate = new Date(Math.min.apply(null, dataItems.map(item => new Date(item.date))));
      this.endDate = new Date(Math.max.apply(null, dataItems.map(item => new Date(item.date))));
      this.tags = dataItems.reduce((acc, item) => {
        if (acc.indexOf(item.type) === -1) acc.push(item.type);
        return acc;
      }, []);

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

      this.dataSource = new DataSource({
        fields,
        store: dataItems.map(item => Object.assign({
          commits: 1,
          changes: item.additions + item.deleteons
        }, item)),
        filter: this.dataFilter
      });
    });
  }

  get dataFilter() {
    const res = [
      ["totalCommits", ">", this.sliderValue],
      "and",
      [
        ["date", "<", this.maxDate],
        "and",
        ["date", ">", this.minDate]
      ]
    ];

    const tgs = this.selectedTags.length ? this.selectedTags : this.tags;
    if (tgs.length === 1) {
      res.push("and", ["type", "=", tgs[0]])
    } else if (tgs.length > 1) {
      const orTags: any[] = [["type", "=", tgs[0]]];

      for (let i = 1; i < tgs.length; i++) {
        orTags.push("or", ["type", "=", tgs[i]]);
      }

      res.push("and", orTags);
    }

    return res;
  }

  onDateChanged = (e) => {
    this.minDate = new Date(e.value[0]);
    this.maxDate = new Date(e.value[1]);
    this.updateFilter();
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

  updateFilter() {
    if (this.dataSource) {
      this.dataSource.filter(this.dataFilter);
      this.dataSource.reload();
    }
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
