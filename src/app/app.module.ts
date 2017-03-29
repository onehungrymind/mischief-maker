import 'jquery';
import 'fullpage.js';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';

import { MnFullpageDirective, MnFullpageService } from 'ng2-fullpage';
import { TrackComponent } from './track/track.component';

@NgModule({
  declarations: [
    AppComponent,
    MnFullpageDirective,
    TrackComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    D3Service,
    MnFullpageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
