import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {TweetsService} from '../shared/services';
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
  selector: 'app-mockup',
  templateUrl: './mockup.component.html',
  styleUrls: ['./mockup.component.css']
})
/**/
export class MockupComponent implements OnInit, OnDestroy {
  private width: number;
  private height: number;
  private margin = {top: 20, right: 20, bottom: 30, left: 40};
  private x: any;
  private y: any;
  private svg: any;
  private g: any;

  /* Filters */
  tweetFilter = 'all';
  tweetFilterText = '';
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
  langGraphData2: Observable<GraphData[]>;
  verifiedStatusData = [];
  verifiedStatusData2 = [];
  verifiedStatusData$: Observable<{}>;
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

  constructor(private tweetsService: TweetsService) {
    this.pagination = true;
    this.page = 0;
    this.size = 50;

    this.supportedLanguages.forEach(item => {
      this.langGraphData.push({'code': item.code, 'language': item.name, 'count': 0});
      // ,
    });
  }

  ngOnInit() {
    setInterval(() => {
      this.testData01 = this.generateTestData01();
      this.testData02 = this.generateTestData02();
      this.testData03 = this.generateTestData03();
    }, 2000);
    window.scroll(0, 0);
  }

  ngOnDestroy(): void {
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }
  }

  getTweets(): void {
    console.log('Fetching the data...');
    this.isProcessing = true;
    this.tweets = this.tweetsService.getTweets(this.page, this.size, this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified);
  }

  getTweetsV2(): void {
    this.isProcessing = true;
    const _limit = this.recordLimit === 'none' ? 0 : Number(this.recordLimit);

    console.log('starting getTweetsV2...');
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }

    this.langGraphData.forEach((rec, index) => {
      this.langGraphData[index].count = 0;
    });
    this.recordCount = 0;

    this.verifiedStatusData = [].concat([{'status': 'true', 'count': 0}, {'status': 'false', 'count': 0}]);

    if (!this._dataSubscription) {
      this._dataSubscription = this.tweetsService.getTweetsV2(this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified)
      // .throttleTime(1000)
        .take(_limit)
        .subscribe(item => {
            let _tempData = [], _tempData2 = []; // [].concat([{'status': 'true', 'count': 0}, {'status': 'false', 'count': 0}]);
            this.streamingStatus = 'STREAM-IN-PROGRESS';
            this.recordCount = Object.keys(item).length;

            const summedUpData = this.sumUpData(item, 'language');
            _tempData = [];

            this.langGraphData.forEach((rec, index) => {
              _tempData.push({'code': rec.code, 'count': summedUpData[rec.code]});
              if (summedUpData[rec.code]) {
                this.langGraphData[index].count = summedUpData[rec.code];
              }
            });

            const verifiedData = this.sumUpData(item, 'verified');
            _tempData2 = [];
            this.verifiedStatusData.forEach((rec, index) => {
              _tempData2.push({'status': rec.status, 'count': verifiedData[rec.status]});
              if (verifiedData[rec.status]) {
                this.verifiedStatusData[index].count = verifiedData[rec.status];
              }
            });
            this.verifiedStatusData = [].concat(_tempData2);

            this.verifiedStatusData$ = Observable.from(this.verifiedStatusData);
          },
          error => {
            console.log('app.component-getTweetsV2-error:', error);
            this.isProcessing = false;
            this.streamingStatus = 'STREAM-FAILED';
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
          }, () => {
            this.isProcessing = false;
            this.streamingStatus = 'STREAM-COMPLETE';
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
          });
    }
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


