import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as EventSource from 'eventsource';

import {ApiService} from './api.service';
import {GraphData, Tweet, ServerStaus} from '../models';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class StreamingDataService {
  tweets: Tweet[] = [];
  serverStatus: ServerStaus[] = [];
  graphData: GraphData[] = [];
  serverData = [];
  graphData2 = {};
  url = 'https://tweet-service.herokuapp.com/stream';
  count = 0;
  groupedByData = [];

  constructor(private http: HttpClient) {
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

  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getServerDataV2(filter?: string, filterText?: string, language?: string, dateRange?: string, verified?: string): Observable<any> {
    this.serverStatus = [];
    this.graphData = [];
    // console.log('tweetsService.getTweets()');

    return Observable.create((observer) => {
      this.url = 'http://localhost:8080/api/test/get-stream-01';

      const eventSource = new EventSource(this.url);
      // console.log('TweetsService filter:', filter, filterText, language, dateRange, verified);

      eventSource.onmessage = (event) => {
        this.count++;

        const jsonData = JSON.parse(event.data);
        this.serverStatus.push(new ServerStaus(jsonData['server'], jsonData['status'], jsonData['language'], jsonData['verified']));

        // observer.next(this.serverStatus);
        if (filter !== 'all') {
          if (filterText !== '') {
            if (filter === 'contains') {
              this.serverStatus = this.serverStatus.filter(item => item.status.toLowerCase().indexOf(filterText.toLowerCase()) > -1);
            } else if (filter === 'equals') {
              this.serverStatus = this.serverStatus.filter(item => item.status.toLowerCase() === filterText.toLowerCase());
            } else if (filter === 'regex') {
              const re = '/[' + filterText.split(',').join('|') + ']/gi';
              console.log('regex string:', re);
              this.serverStatus = this.serverStatus.filter(item => item.status.match(re));
            }
          }
        }

        if (language !== 'all') {
          this.serverStatus = this.serverStatus.filter(item => item.language === language);
        }

        if (verified !== 'all') {
          this.serverStatus = this.serverStatus.filter(item => !!item.verified === !!verified);
        }
        observer.next(this.serverStatus);
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

  getNodeJsApiDataV1(filter?: string, filterText?: string, language?: string, dateRange?: string, verified?: string): Observable<any> {
    this.serverStatus = [];
    this.graphData = [];
    this.url = 'http://localhost:8080/api/test/get-stream-01';

    console.log('StreamingDataService.getServerDataV3()');

    return this.http.get(`${this.url}`)
      .map((res: HttpResponse<any>) => {
        // console.log('streaming-data.service-get response:', res);
        return res;
      });

  }

  getLocalStreamingDataV1(): Observable<any[]> {
    class StreamData {
      message: string;
      status: string;
      language: string;

      constructor(message, status, language) {
        this.message = message;
        this.status = status;
        this.language = language;
      }
    }

    const _servers = ['server-1', 'server-2', 'server-3', 'server-4', 'server-5'];
    const _stauses = ['rebooting', 'shutting down', 'memory full', 'out of space'];
    const _verifiedStatuses = ['true', 'false', 'maybe'];
    const _languages = ['en', 'de', 'fr', 'jp', 'es'];
    let _data = [];
    const _maxLimit = 10000;
    let _counter = 0;

    return Observable.create(observer => {
      _data = [];
      setInterval(() => {
        // _data = [];
        const _limit = Math.floor(Math.random() * (60 - 20)) + 20;
        while (_data.length < _limit) {
          _counter++;
          _data.push({
            'server': _servers[StreamingDataService.randomNumber(0, _servers.length - 1)],
            'status':  _stauses[StreamingDataService.randomNumber(0, _stauses.length - 1)],
            'verified': _verifiedStatuses[StreamingDataService.randomNumber(0, _verifiedStatuses.length - 1)],
            'language': _languages[StreamingDataService.randomNumber(0, _languages.length - 1)]
          });
        }
        observer.next(_data);
        if (_counter > _maxLimit) {
          console.log('Reached max limit');
          observer.complete();
        }
      }, 1500);
    });
  }

}
