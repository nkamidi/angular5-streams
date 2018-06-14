import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as EventSource from 'eventsource';
import {Http, Response} from '@angular/http';

import {ApiService} from './api.service';
import {GraphData, Tweet} from '../models';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';


@Injectable()
export class TweetsBlockingService {
  //private currentTweetsSubject = new BehaviorSubject<Tweet>(new Tweet());
  //public currentTweets = this.currentTweetsSubject.asObservable();
  tweets: Tweet[] = [];
  graphData: GraphData[] = [];
  graphData2 = {};
  url = 'https://tweet-service.herokuapp.com/stream';
  count: number = 0;
  groupedByData = [];

  constructor(private http: Http) {
  }

  static validJSON(data) {
    try {
      JSON.parse(data);
    }
    catch (e) {
      //console.log('invalid json, error:', e);
      //console.log('invalid JSON', data);
      return false;
    }
    return true;
  }

  getTweets(page?: number, size?: number, tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<Array<Tweet>> {
    this.tweets = [];
    this.graphData = [];
    // console.log('tweetsService.getTweets()');

    return this.http.get(this.url)
      .map((res: Response) => {
        console.log('tweets-blocking.service-get response:', res.json());
        return res.json();
      });
  }

  //getSummaryData(page?: number, size?: number, tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<Array<GraphData>> {
  getSummaryData(tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<Array<GraphData>> {
    this.tweets = [];
    this.graphData = [];
    this.graphData2 = {};
    this.count = 0;
    console.log('tweetsService.getSummaryData()');

    return Observable.create((observer) => {
      this.url = 'https://tweet-service.herokuapp.com/stream';

      let eventSource = new EventSource(this.url);
      console.log('TweetsService filter:', tweetFilter, tweetFilterText, language, dateRange, verified);

      eventSource.onmessage = (event) => {
        let jsonData = JSON.parse(event.data);
        //this.updateLanguageObject(event.data);

        this.tweets.push(new Tweet(jsonData['tweet'], jsonData['user'], jsonData['retweet_count'], jsonData['created_at'], jsonData['verified'], jsonData['lang']));
        /*this.count++;
        if (this.count === 100) {
          console.log(this.tweets);
        }*/

        if (tweetFilter !== 'all') {
          if (tweetFilterText !== '') {
            if (tweetFilter === 'contains') {
              this.tweets = this.tweets.filter(item => item.tweet.indexOf(tweetFilterText) > -1);
            }
            else if (tweetFilter === 'equals') {
              this.tweets = this.tweets.filter(item => item.tweet.toLowerCase() === tweetFilterText.toLowerCase());
            }
            else if (tweetFilter === 'regex') {
              let re = '/[' + tweetFilterText.split(',').join('|') + ']/gi';
              console.log('regex string:', re);
              this.tweets = this.tweets.filter(item => item.tweet.match(re));
            }
          }
        }

        if (language !== 'all') {
          this.tweets = this.tweets.filter(item => item.language === language);
        }

        if (verified !== 'all') {
          this.tweets = this.tweets.filter(item => !!item.verified == !!verified);
        }
        // this.tweets = this.tweets.filter(item => item.createdTimestamp > dt);

        let summedUpData = this.sumUpData(this.tweets, 'language');
        //console.log("tweets.service - summedUpData:", summedUpData);

        Object.keys(summedUpData).forEach((key) => {
          // this.graphData.push({'language': key, 'count': summedUpData[key]});
          this.graphData.push(new GraphData(key, summedUpData[key]));
        });

        observer.next(this.graphData);

        /*this.graphData.push(summedUpData);
        */

        /*this.graphData2 = Object.assign(summedUpData);
        console.log("tweets.service-this.graphData2:", this.graphData2);
        observer.next(this.graphData2);*/

        //observer.next(this.tweets);
      };
      /**/
      eventSource.onerror = (error) => {
        if (eventSource.readyState === 0) {
          console.log('The stream has been closed by the server.');
          eventSource.close();
          observer.complete();
        } else {
          observer.error('EventSource error: ' + error);
        }
      };

      return () => {
        console.log('Closing eventSource');
        eventSource.close();
      };

    });
  }

  updateLanguageObject(obj) {
    let _found = false;
    /*for (let i=0; i< this.graphData.length; i++){
      if (this.graphData[i].language === obj.lang) {
        _found = true;
        this.graphData[i].count++;
      }
    }*/
    this.graphData.forEach((item, index) => {
      if (item.language === obj.lang) {
        _found = true;
        this.graphData[index].count++;
      }
    });
    if (!_found) {
      this.graphData.push({'language': obj.lang, 'count': 1});
    }
  };

  groupByData(arr, property) {
    return arr.reduce(function (acc, obj) {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

  sumUpData(arr, property) {
    return arr.reduce(function (acc, obj) {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += 1;
      return acc;
    }, {});
  }

}
