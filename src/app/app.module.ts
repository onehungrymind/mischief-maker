import 'jquery';
import 'fullpage.js';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MnFullpageDirective, MnFullpageService } from 'ng2-fullpage';

@NgModule({
  declarations: [
    AppComponent,
    MnFullpageDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [MnFullpageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
