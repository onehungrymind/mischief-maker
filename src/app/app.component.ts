import { Component, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MnFullpageOptions, MnFullpageService } from 'ng2-fullpage';
window['Tone'] = require('tone/build/Tone');

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  styles: [
    require('fullpage.js/dist/jquery.fullpage.css'),
    require('./app.component.scss')
  ],
  template: require('./app.component.html')
})
export class AppComponent implements OnInit {

  rehearsal = false;

  @Input() public options: MnFullpageOptions = new MnFullpageOptions({
    controlArrows: false,
    scrollingSpeed: 1000,
    loopHorizontal: false,
    onLeave: (index: number, nextIndex: number, direction: string) => {
      console.log('NEXT INDEX', nextIndex);
    },
    onSlideLeave: (anchorLink: string, index: number, slideIndex: number, direction: string, nextSlideIndex: number) => {
      console.log('NEXT SLIDE INDEX', index, nextSlideIndex);
    },
    menu: '.menu',
    css3: true,
    anchors: [
      'intro', 'enlighten', 'know', 'understand',
      'manifest', 'perceive', 'reflect', 'evolve', 'review'
    ]
  });

  @Output() private templates = {
    connect: require('raw!./templates/connect.template.txt'),
    capture: require('raw!./templates/capture.template.txt'),
    convert: require('raw!./templates/convert.template.txt'),
    playSynth: require('raw!./templates/play-synth.template.txt'),
    playMidi: require('raw!./templates/play-midi.template.txt'),
    record: require('raw!./templates/record.template.txt'),
    recordProcess: require('raw!./templates/record-process.template.txt'),
    replay: require('raw!./templates/replay.template.txt'),
    layer: require('raw!./templates/layer.template.txt')
  };

  constructor() { }

  ngOnInit() {
  }
}