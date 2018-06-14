import {Component, OnInit, OnDestroy} from '@angular/core';
import {TweetsBlockingService, TweetsService} from './shared/services';
import {AlertMessage, Tweet, GraphData} from './shared/models';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {filter, flatMap, switchMap, throttle, debounce, scan} from 'rxjs/operators';
import {interval} from 'rxjs/observable/interval';
import {from} from 'rxjs/observable/from';
import * as d3 from 'd3-selection';

/*
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
}
*/

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
/**/
export class AppComponent implements OnInit, OnDestroy {
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
  langData = [];
  verifiedStatusData = [];
  recordCount: number;
  recordCount2: Observable<number>;
  sub: Subscription;
  pagination: boolean;
  page: number;
  size: number;

  _dataSubscription: Subscription;
  streamingStatus: string = 'NONE';

  constructor(private tweetsService: TweetsService, private tweetsBlockingService: TweetsBlockingService) {
    this.pagination = true;
    this.page = 0;
    this.size = 50;

    this.supportedLanguages.forEach(item => {
      this.langGraphData.push({'language': item.name, 'code': item.code, 'count': 0});
    });
    console.log(' constructor - this.langGraphData:', this.langGraphData);
  }

  ngOnInit() {
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
  }

  ngOnDestroy(): void {
    this._dataSubscription.unsubscribe();
  }

  /*private drawChart() {
    this.graphData = [{language: 'en', count: 160}, {language: 'es', count: 140}, {language: 'de', count: 103}, {
      language: 'jp',
      count: 120
    }, {language: 'fr', count: 110}, {language: 'others', count: 200}];

    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawBars();

  }

  private initSvg() {
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.graphData.map((d) => d.letter));
    this.y.domain([0, d3Array.max(this.graphData, (d) => d.frequency)]);
  }

  private drawAxis() {
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y).ticks(10, '%'))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');
  }

  private drawBars() {
    this.g.selectAll('.bar')
      .data(this.graphData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.x(d.letter))
      .attr('y', (d) => this.y(d.frequency))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(d.frequency));
  }*/

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
            this.streamingStatus = 'STREAM-IN-PROGRESS';
            // console.log('app.component-getTweetsV2-item.count:', item);
            const summedUpData = this.sumUpData(item, 'language');
            // console.log('app.component-getTweetsV2-summedUpData:', summedUpData);
            this.langGraphData.forEach((rec, index) => {
              if (summedUpData[rec.code]) {
                this.langGraphData[index].count = summedUpData[rec.code];
              }
            });

            const verifiedData = this.sumUpData(item, 'verified');
            this.verifiedStatusData.forEach((rec, index) => {
              if (verifiedData[rec.status]) {
                this.verifiedStatusData[index].count = verifiedData[rec.status];
              }
            });

            this.drawVerifiedChart(this.verifiedStatusData);
            // console.log('app.component-getTweetsV2-verifiedData:', this.verifiedStatusData);

            /*console.log('app.component-getTweetsV2-this.langGraphData:', this.langGraphData);*/
            // Populate the Tweet table
            // this.tweetData = [].concat(item);
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

  drawVerifiedChart(data) {
    d3.select('.chart2')
      .selectAll('div')
      .data(data)
      .enter()
      .append('div')
      .style('width', function (d) {
        return d.count * 100 + 'px';
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

  groupByData(arr, property) {
    return arr.reduce(function (acc, obj) {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

}


