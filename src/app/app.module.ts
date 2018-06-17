import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ChartsModule} from '@progress/kendo-angular-charts';
import {SparklineModule} from '@progress/kendo-angular-charts';
import {AppComponent} from './app.component';
import {SharedModule, TweetsService} from './shared';
import {MockupComponent} from './mockup/mockup.component';
import {MainComponent} from './main/main.component';
import { AppRoutingModule } from './app-routing.module';

import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent, MockupComponent, MainComponent
  ],
  imports: [
    BrowserModule, SharedModule, BrowserAnimationsModule, ChartsModule, SparklineModule, AppRoutingModule
  ],
  providers: [TweetsService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
