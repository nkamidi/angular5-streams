import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {SharedModule, TweetsService, TweetsBlockingService} from './shared';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, SharedModule
  ],
  providers: [TweetsBlockingService, TweetsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
