import {Component, OnInit, OnDestroy} from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
/**/
export class AppComponent implements OnInit, OnDestroy {

  constructor() {
  }

  ngOnInit() {
    console.log("In app.component");
  }

  ngOnDestroy(): void {
  }

}


