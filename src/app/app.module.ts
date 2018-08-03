import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {Router, RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ChartsModule} from '@progress/kendo-angular-charts';
import {SparklineModule} from '@progress/kendo-angular-charts';
import {AppComponent} from './app.component';
import {SharedModule, TweetsService, StreamingDataService} from './shared';
import {MockupComponent} from './mockup/mockup.component';
import {MainComponent} from './main/main.component';
import {Test03Component} from './test-03/test-03.component';
import {AppRoutingModule} from './app-routing.module';
import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent, MockupComponent, MainComponent, Test03Component
  ],
  imports: [BrowserModule, HttpClientModule, SharedModule, BrowserAnimationsModule, ChartsModule, SparklineModule, AppRoutingModule
  ],
  providers: [TweetsService, StreamingDataService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router) {
    console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
