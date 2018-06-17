import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as EventSource from 'eventsource';

import {ApiService} from './api.service';
import {GraphData, Tweet} from '../models';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';


@Injectable()
export class TweetsService {
  // private currentTweetsSubject = new BehaviorSubject<Tweet>(new Tweet());
  // public currentTweets = this.currentTweetsSubject.asObservable();
  tweets: Tweet[] = [];
  graphData: GraphData[] = [];
  graphData2 = {};
  url = 'https://tweet-service.herokuapp.com/stream';
  count = 0;
  groupedByData = [];

  constructor() {
  }

  static validJSON(data) {
    try {
      JSON.parse(data);
    } catch (e) {
      // console.log('invalid json, error:', e);
      // console.log('invalid JSON', data);
      return false;
    }
    return true;
  }

  getTweets(page?: number, size?: number, tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<Array<Tweet>> {
    this.tweets = [];
    this.graphData = [];
    // console.log('tweetsService.getTweets()');

    return Observable.create((observer) => {
      this.url = 'https://tweet-service.herokuapp.com/stream';
      if (page != null) {
        this.url += '?page=' + page + '&size=' + size;
      }
      const eventSource = new EventSource(this.url);
      console.log('TweetsService filter:', tweetFilter, tweetFilterText, language, dateRange, verified);

      eventSource.onmessage = (event) => {
        this.count++;

        const jsonData = JSON.parse(event.data);
        this.tweets.push(new Tweet(jsonData['tweet'], jsonData['user'], jsonData['retweet_count'], jsonData['created_at'], jsonData['verified'], jsonData['lang']));

        // observer.next(this.tweets);
        if (tweetFilter !== 'all') {
          if (tweetFilterText !== '') {
            if (tweetFilter === 'contains') {
              this.tweets = this.tweets.filter(item => item.tweet.indexOf(tweetFilterText) > -1);
            } else if (tweetFilter === 'equals') {
              this.tweets = this.tweets.filter(item => item.tweet.toLowerCase() === tweetFilterText.toLowerCase());
            } else if (tweetFilter === 'regex') {
              const re = '/[' + tweetFilterText.split(',').join('|') + ']/gi';
              console.log('regex string:', re);
              this.tweets = this.tweets.filter(item => item.tweet.match(re));
            }
          }
        }

        if (language !== 'all') {
          this.tweets = this.tweets.filter(item => item.language === language);
        }

        if (verified !== 'all') {
          this.tweets = this.tweets.filter(item => !!item.verified === !!verified);
        }

        const summedUpData = this.sumUpData(this.tweets, 'language');
        console.log("tweets.service - summedUpData:", summedUpData);

        /*Object.keys(summedUpData).forEach((key) => {
          this.graphData.push({'language': key, 'count': summedUpData[key]});
        });*/

        console.log("tweets.service-this.tweets.length:", this.tweets.length);
        observer.next(this.tweets);
      };

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
        eventSource.close();
      };

    });
  }

  getTweetsV2(tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<any> {
    this.tweets = [];
    this.graphData = [];
    // console.log('tweetsService.getTweets()');

    return Observable.create((observer) => {
      this.url = 'https://tweet-service.herokuapp.com/stream';

      const eventSource = new EventSource(this.url);
      // console.log('TweetsService filter:', tweetFilter, tweetFilterText, language, dateRange, verified);

      eventSource.onmessage = (event) => {
        this.count++;

        const jsonData = JSON.parse(event.data);
        this.tweets.push(new Tweet(jsonData['tweet'], jsonData['user'], jsonData['retweet_count'], jsonData['created_at'], jsonData['verified'], jsonData['lang']));

        // observer.next(this.tweets);
        if (tweetFilter !== 'all') {
          if (tweetFilterText !== '') {
            if (tweetFilter === 'contains') {
              this.tweets = this.tweets.filter(item => item.tweet.toLowerCase().indexOf(tweetFilterText.toLowerCase()) > -1);
            } else if (tweetFilter === 'equals') {
              this.tweets = this.tweets.filter(item => item.tweet.toLowerCase() === tweetFilterText.toLowerCase());
            } else if (tweetFilter === 'regex') {
              const re = '/[' + tweetFilterText.split(',').join('|') + ']/gi';
              console.log('regex string:', re);
              this.tweets = this.tweets.filter(item => item.tweet.match(re));
            }
          }
        }

        if (language !== 'all') {
          this.tweets = this.tweets.filter(item => item.language === language);
        }

        if (verified !== 'all') {
          this.tweets = this.tweets.filter(item => !!item.verified === !!verified);
        }

        /*const summedUpData = this.sumUpData(this.tweets, 'language');
        console.log("tweets.service - summedUpData:", summedUpData);

        Object.keys(summedUpData).forEach((key) => {
          this.graphData.push({'language': key, 'count': summedUpData[key]});
        });*/

        // console.log("tweets.service-this.tweets.length:", this.tweets.length);
        // console.log("tweets.service-this.tweets:", this.tweets);
        observer.next(this.tweets);
      };

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
        eventSource.close();
      };

    });
  }

  // getSummaryData(page?: number, size?: number, tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<Array<GraphData>> {
    getSummaryData(tweetFilter?: string, tweetFilterText?: string, language?: string, dateRange?: string, verified?: string): Observable<Array<GraphData>> {
    this.tweets = [];
    this.graphData = [];
    this.graphData2 = {};
    this.count = 0;
    console.log('tweetsService.getSummaryData()');

    return Observable.create((observer) => {
      this.url = 'https://tweet-service.herokuapp.com/stream';

      const eventSource = new EventSource(this.url);
      console.log('TweetsService filter:', tweetFilter, tweetFilterText, language, dateRange, verified);

      eventSource.onmessage = (event) => {
        const jsonData = JSON.parse(event.data);
        // this.updateLanguageObject(event.data);

        this.tweets.push(new Tweet(jsonData['tweet'], jsonData['user'], jsonData['retweet_count'], jsonData['created_at'], jsonData['verified'], jsonData['lang']));
        /*this.count++;
        if (this.count === 100) {
          console.log(this.tweets);
        }*/

        if (tweetFilter !== 'all') {
          if (tweetFilterText !== '') {
            if (tweetFilter === 'contains') {
              this.tweets = this.tweets.filter(item => item.tweet.indexOf(tweetFilterText) > -1);
            } else if (tweetFilter === 'equals') {
              this.tweets = this.tweets.filter(item => item.tweet.toLowerCase() === tweetFilterText.toLowerCase());
            } else if (tweetFilter === 'regex') {
              const re = '/[' + tweetFilterText.split(',').join('|') + ']/gi';
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

        const summedUpData = this.sumUpData(this.tweets, 'language');
        // console.log("tweets.service - summedUpData:", summedUpData);

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

        // observer.next(this.tweets);
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

  sumUpData(arr, property) {
    return arr.reduce(function (acc, obj) {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += 1;
      return acc;
    }, {});
  }

}
