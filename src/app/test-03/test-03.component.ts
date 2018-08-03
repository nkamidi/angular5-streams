import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TweetsService, StreamingDataService} from '../shared/services';
import {AlertMessage, Tweet, GraphData} from '../shared/models';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {filter, flatMap, switchMap, throttle, debounce, scan} from 'rxjs/operators';
import {interval} from 'rxjs/observable/interval';
import {from} from 'rxjs/observable/from';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

import {Chart} from 'chart.js';

@Component({
  selector: 'app-test03',
  templateUrl: './test-03.component.html',
  styleUrls: ['./test-03.component.css']
})
/**/
export class Test03Component implements OnInit, OnDestroy {
  private width: number;
  private height: number;
  private margin = {top: 20, right: 20, bottom: 30, left: 40};
  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  /* Filters */
  filter = 'all';
  filterText = '';
  language = 'all';
  dateRange = '7d';
  verified = 'all';
  recordLimit = '1000';

  supportedLanguages = [{code: 'en', name: 'English'}, {code: 'es', name: 'Spanish'}, {code: 'de', name: 'German'}, {
    code: 'fr',
    name: 'French'
  }, {code: 'jp', name: 'Japanese'}];
  isProcessing: boolean = false;
  tweets: Observable<Tweet[]>;
  tweetData: any[] = [];
  graphData: Observable<GraphData>;
  langGraphData = [];
  serverGraphData = [];
  statusGraphData = [];
  langGraphData2: Observable<GraphData[]>;
  verifiedStatusData = [];
  verifiedStatusData2 = [];
  verifiedStatusData$: Observable<{}>;
  streamingData$: Observable<any[]>;
  recordCount: number;
  sub: Subscription;
  pagination: boolean;
  page: number;
  size: number;
  _dataSubscription: Subscription;
  streamingStatus: string = 'NONE';
  testData01 = [];
  testData02 = [];
  testData03 = [];
  days = ['Today', 'Day-1', 'Day-2', 'Day-3', 'Day-4', 'Day-5', 'Day-6', 'Day-7'];

  constructor(private tweetsService: TweetsService,
              private streamingDataService: StreamingDataService) {
    this.pagination = true;
    this.page = 0;
    this.size = 50;

    this.supportedLanguages.forEach(item => {
      this.langGraphData.push({'code': item.code, 'language': item.name, 'count': 0});
      // ,
    });
  }

  ngOnInit() {
    /*this._dataSubscription = this.streamingDataService.createStreamingData01().subscribe(item => {
      console.log(item);
    });*/

    /*setInterval(() => {
      this.testData01 = this.generateTestData01();
      this.testData02 = this.generateTestData02();
      this.testData03 = this.generateTestData03();
    }, 2000);*/
    window.scroll(0, 0);
  }

  ngOnDestroy(): void {
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }
  }

  getServerDataV1(): void {
    this.isProcessing = true;
    const _limit = this.recordLimit === 'none' ? 0 : Number(this.recordLimit);

    console.log('starting getServerDataV1...');
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }

    this.langGraphData.forEach((rec, index) => {
      this.langGraphData[index].count = 0;
    });
    this.recordCount = 0;

    this.streamingDataService.getNodeJsApiDataV1(this.filter, this.filterText, this.language, this.dateRange, this.verified)
      .subscribe(dat => {
        const data = dat.filter(item => {
          return item;
          // return item.status.indexOf('rebooting') > -1;
          /*if (this.filter !== 'all') {
            if (this.filterText !== '') {
              if (this.filter === 'contains') {
                return item.status.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1;
              } else if (this.filter === 'equals') {
                return item.status.toLowerCase() === this.filterText.toLowerCase();
              } else if (this.filter === 'regex') {
                const re = '/[' + this.filterText.split(',').join('|') + ']/gi';
                return item.status.match(re);
              }
            } else {
              return item;
            }
          }*/
        });
        this.recordCount = data.length;

        console.log('test-03.component - data:', data);
        let _tempData = [], summedUpData = [];
        this.serverGraphData = [];

        summedUpData = this.sumUpData(data, 'server');

        Object.keys(summedUpData).forEach(key => {
          this.serverGraphData.push({'server': key, 'results': summedUpData[key]});
        });
        // console.log('this.serverGraphData', this.serverGraphData);

        summedUpData = this.sumUpData(data, 'status');

        this.statusGraphData = [];
        Object.keys(summedUpData).forEach(key => {
          this.statusGraphData.push({'status': key, 'count3': summedUpData[key]});
        });

        summedUpData = this.sumUpData(data, 'language');

        _tempData = [];
        this.langGraphData.forEach((rec, index) => {
          _tempData.push({'code': rec.code, 'count': summedUpData[rec.code]});
          if (summedUpData[rec.code]) {
            this.langGraphData[index].count = summedUpData[rec.code];
          }
        });

        this.langGraphData = [].concat(_tempData);
        console.log('this.langGraphData', this.langGraphData);
      });

  }

  getServerDataV2(): void {
    this.isProcessing = true;
    const _limit = this.recordLimit === 'none' ? 0 : Number(this.recordLimit);

    console.log('starting getServerDataV1...');
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }

    this.langGraphData.forEach((rec, index) => {
      this.langGraphData[index].count = 0;
    });
    this.recordCount = 0;

    this.streamingDataService.getLocalStreamingDataV1()
      .subscribe(dat => {
        const data = dat.filter(item => {
          return item;
        });
        this.recordCount = data.length;

        console.log('test-03.component - data:', data);
        let _tempData = [], summedUpData = [];
        this.serverGraphData = [];

        summedUpData = this.sumUpData(data, 'server');

        Object.keys(summedUpData).forEach(key => {
          this.serverGraphData.push({'server': key, 'results': summedUpData[key]});
        });
        // console.log('this.serverGraphData', this.serverGraphData);

        summedUpData = this.sumUpData(data, 'status');

        this.statusGraphData = [];
        Object.keys(summedUpData).forEach(key => {
          this.statusGraphData.push({'status': key, 'count3': summedUpData[key]});
        });

        summedUpData = this.sumUpData(data, 'language');

        _tempData = [];
        this.langGraphData.forEach((rec, index) => {
          _tempData.push({'code': rec.code, 'count': summedUpData[rec.code]});
          if (summedUpData[rec.code]) {
            this.langGraphData[index].count = summedUpData[rec.code];
          }
        });

        this.langGraphData = [].concat(_tempData);
        console.log('this.langGraphData', this.langGraphData);
      });

  }

  blockStream(): void {
    console.log('blockStream triggered...');
    this.streamingStatus = 'STREAM-PAUSED';
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
      this._dataSubscription = null;
      // this.tweetData = [];
    }
  }

  drawVerifiedChart() {
    const _dat = [];
    this.verifiedStatusData$.subscribe(val => {
      _dat.push(val);
    });

    d3.select('.chart2')
      .selectAll('div')
      .data(_dat)
      .enter()
      .append('div')
      .style('width', function (d) {
        return d.count + 'px';
      })
      .text(function (d) {
        return d.status + ' ' + d.count;
      });
  }

  sumUpData(arr, property) {
    return arr.reduce(function (acc, obj) {
      const key = obj[property];
      // console.log('sumUpData: key', key);
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += 1;
      return acc;
    }, {});
  }

  private generateTestData01() {
    const statuses = ['true', 'false'];
    const dataArray = [];
    const minValue = 700, maxValue = 1000;

    statuses.forEach((item) => {
      dataArray.push({'category': item, 'count': Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue});
    });
    return dataArray;
  }

  private generateTestData02() {
    const items = ['English', 'Spanish', 'German', 'French', 'Japanese', 'Italian'];
    const dataArray = [];
    const minValue = 500, maxValue = 1000;

    items.forEach((item) => {
      dataArray.push({'language': item, 'count': Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue});
    });
    return dataArray;
  }

  private generateTestData03() {
    const languages = ['English', 'Spanish', 'German', 'French', 'Japanese', 'Italian'];
    const dataArray = [];
    const minValue = 50, maxValue = 100;

    languages.forEach((item) => {
      const _temp = [];
      while (_temp.length < 10) {
        _temp.push(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
      }
      dataArray.push({'language': item, 'data': _temp});
    });
    return dataArray;
  }

}
