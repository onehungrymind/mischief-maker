import 'jquery';
import 'fullpage.js';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';

import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';

import { MnFullpageDirective, MnFullpageService } from 'ng2-fullpage';
import { TrackComponent } from './track/track.component';
import { DevicesComponent } from './devices/devices.component';
import { MessagesComponent } from './messages/messages.component';
import { NotesComponent } from './notes/notes.component';
import { SynthComponent } from './synth/synth.component';
import { RecordComponent } from './record/record.component';
import { WorkspaceComponent } from './workspace/workspace.component';

export const firebaseConfig = {
  apiKey: "AIzaSyBQP1n1psPzLlK8QUTX2of9AbDi8CshVsM",
  authDomain: "mischief-maker-data-aggregator.firebaseapp.com",
  databaseURL: "https://mischief-maker-data-aggregator.firebaseio.com",
  projectId: "mischief-maker-data-aggregator",
  storageBucket: "mischief-maker-data-aggregator.appspot.com",
  messagingSenderId: "592007581287"
};

@NgModule({
  declarations: [
    AppComponent,
    MnFullpageDirective,
    TrackComponent,
    DevicesComponent,
    MessagesComponent,
    NotesComponent,
    SynthComponent,
    RecordComponent,
    WorkspaceComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [
    D3Service,
    MnFullpageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
