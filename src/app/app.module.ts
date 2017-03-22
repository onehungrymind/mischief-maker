import 'jquery';
import 'fullpage.js';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';

import { AudioOutputService, MidiInputService, PipelineService, SynthesisService } from './services';

import { PianoKeyboardComponent } from './keyboard';
import { MnFullpageDirective, MnFullpageService } from 'ng2-fullpage';

@NgModule({
  declarations: [
    AppComponent,
    MnFullpageDirective,
    PianoKeyboardComponent,
    ControlPanelComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    MnFullpageService,
    MidiInputService,
    AudioOutputService,
    SynthesisService,
    PipelineService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
