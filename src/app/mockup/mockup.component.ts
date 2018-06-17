import {Component, OnInit, OnDestroy} from '@angular/core';
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

  public seriesData = [{
    product: 'Chai',
    sales: 200
  }, {
    product: 'Others',
    sales: 250
  }];

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
    console.log(' constructor - this.langGraphData:', this.langGraphData);
  }

  ngOnInit() {
    console.log("In mockup.component");
    const data = [30, 86, 168, 281, 303, 365];
    d3.select('.chart1')
      .selectAll('div')
      .data(data)
      .enter()
      .append('div')
      .style('width', function (d) {
        return d + 'px';
      })
      .text(function (d) {
        return d;
      });

    setInterval(() => {
      this.testData01 = this.generateTestData01();
      this.testData02 = this.generateTestData02();
      this.testData03 = this.generateTestData03();
    }, 2000);
  }

  ngOnDestroy(): void {
    this._dataSubscription.unsubscribe();
  }

  getTweets(): void {
    console.log('Fetching the data...');
    this.isProcessing = true;
    // this.alertMessage = {message: 'Processing the request...', alertType: 'warning'};

    this.tweets = this.tweetsService.getTweets(this.page, this.size, this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified);

    /*let source = this.tweetService.getSummaryData(this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified);
    console.log("source.count", source.count());
    let subscription = source.subscribe(
      (x) => {
        this.recordCount = x.length;
        //console.log("source.subscribe - x", x.length);
        if (x.length < 10){
          console.log(x);
        }
      },
      (err) => {
        console.log("source.subscribe - err", err);
      },
      () => {
        console.log("source.subscribe - completed");
      }
    );*/

    /*this.tweetService.getSummaryData(this.page, this.size, this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified)
      .switchMap(item => item)
      .subscribe(data => {
        if (typeof data === 'object' && Object.keys(data).length > 0) {
          //console.log('subscribe-data:', data);
          Object.keys(data).forEach(key => {
            this.langGraphData2[key] = data[key];
          });
        }
        //console.log('subscribe-langGraphData2:', this.langGraphData2);
      });*/
  }

  getTweetsV2(): void {
    this.isProcessing = true;
    const _limit = this.recordLimit === 'none' ? 0 : Number(this.recordLimit);

    // this.streamingStatus = 'STREAM-IN-PROGRESS';
    console.log('starting getTweetsV2...');
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }

    this.langGraphData.forEach((rec, index) => {
      this.langGraphData[index].count = 0;
    });
    this.recordCount = 0;

    /*this.verifiedStatusData.forEach((rec, index) => {
      this.verifiedStatusData[index].count = 0;
    });*/

    this.verifiedStatusData = [].concat([{'status': 'true', 'count': 0}, {'status': 'false', 'count': 0}]);

    // this.verifiedStatusData.push({'status': 'true', 'count': 0}, {'status': 'false', 'count': 0});

    // const delayedObservable = Observable.of(this.tweetsService.getTweetsV2(this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified));

    if (!this._dataSubscription) {
      /*this._dataSubscription = this.tweetsService.getTweetsV2(this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified)
        .take(100)
        .subscribe(item => {
            console.log('app.component-getTweetsV2-item.count:', item);
            const summedUpData = this.sumUpData(item, 'language');
            console.log('app.component-getTweetsV2-summedUpData:', summedUpData);
            /!*Object.keys(summedUpData).forEach((key) => {
              this.langGraphData.push({'language': key, 'count': summedUpData[key]});
            });
            console.log('app.component-getTweetsV2-this.langGraphData:', this.langGraphData);*!/
            this.tweetData = [].concat(item);
            // this.tweetData.push(item);
          },
          error => {
            console.log('app.component-getTweetsV2-error:', error);
          });*/

      this._dataSubscription = this.tweetsService.getTweetsV2(this.tweetFilter, this.tweetFilterText, this.language, this.dateRange, this.verified)
      // .throttleTime(1000)
        .take(_limit)
        .subscribe(item => {
            let _tempData = [], _tempData2 = []; // [].concat([{'status': 'true', 'count': 0}, {'status': 'false', 'count': 0}]);
            // this.verifiedStatusData = [].concat([{'status': 'true', 'count': 0}, {'status': 'false', 'count': 0}]);
            this.streamingStatus = 'STREAM-IN-PROGRESS';
            this.recordCount = Object.keys(item).length;

            // console.log('app.component-getTweetsV2-item:', item);
            const summedUpData = this.sumUpData(item, 'language');
            // console.log('app.component-getTweetsV2-summedUpData:', summedUpData);
            _tempData = [];
            this.langGraphData.forEach((rec, index) => {
              // console.log("this.langGraphData.forEach: rec", rec);
              _tempData.push({'code': rec.code, 'count': summedUpData[rec.code]});
              if (summedUpData[rec.code]) {
                this.langGraphData[index].count = summedUpData[rec.code];
              }
            });
            // console.log('_tempData:', _tempData);
            console.log('this.langGraphData:', this.langGraphData);
            // this.langGraphData = [].concat(_tempData);

            // this.langGraphData2 = Observable.from(this.langGraphData);

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
            // console.log('this.verifiedStatusData$:', this.verifiedStatusData$);

            const elem = document.getElementById('ver-chart');
            elem.innerHTML = '<div class="chart2"></div>';
            this.drawVerifiedChart();

            /*this.verifiedStatusData2 = Observable.create(observer => {
              observer.next(this.verifiedStatusData);
            });*/

            // this.verifiedStatusData2 = Observable.from(this.verifiedStatusData).switchMap(val => val);
            // this.verifiedStatusData2 = Observable.from([]);

            // console.log("this.verifiedStatusData2:", this.verifiedStatusData2);

            /*const _data2 = Observable.from(this.verifiedStatusData);
            const _data3 = _data2.subscribe(val => {
              // console.log('_data2.subscribe:', val);
              _dat.push(val);
            });
            console.log('_data2.subscribe-_dat:', _dat);*/
            /*
            const _sub1 = _data2.subscribe( val => {
              console.log("_sub1-val:", val);
              _data3.next(val);
            });

            */
            // this.drawBarChart(this.verifiedStatusData);
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
    // const _data = data.map(item => item);
    this.verifiedStatusData$.subscribe(val => {
      _dat.push(val);
    });

    // console.log('drawVerifiedChart-data:', _dat);
    // const _dat = [].concat(this.verifiedStatusData);

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


