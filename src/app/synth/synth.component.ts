import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { D3 } from 'd3-ng2-service';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

const noteTransforms = {
  33: 'A0', 34: 'A#0', 35: 'B0',
  36: 'C1', 37: 'C#1', 38: 'D1', 39: 'D#1', 40: 'E1', 41: 'F1', 42: 'F#1', 43: 'G1', 44: 'G#1', 45: 'A1', 46: 'A#1', 47: 'B1',
  48: 'C2', 49: 'C#2', 50: 'D2', 51: 'D#2', 52: 'E2', 53: 'F2', 54: 'F#2', 55: 'G2', 56: 'G#2', 57: 'A2', 58: 'A#2', 59: 'B2',
  60: 'C3', 61: 'C#3', 62: 'D3', 63: 'D#3', 64: 'E3', 65: 'F3', 66: 'F#3', 67: 'G3', 68: 'G#3', 69: 'A3', 70: 'A#3', 71: 'B3',
  72: 'C4', 73: 'C#4', 74: 'D4', 75: 'D#4', 76: 'E4', 77: 'F4', 78: 'F#4', 79: 'G4', 80: 'G#4', 81: 'A4', 82: 'A#4', 83: 'B4',
  84: 'C5', 85: 'C#5', 86: 'D5', 87: 'D#5', 88: 'E5', 89: 'F5', 90: 'F#5', 91: 'G5', 92: 'G#5', 93: 'A5', 94: 'A#5', 95: 'B5',
  96: 'C6', 97: 'C#6', 98: 'D6', 99: 'D#6', 100: 'E6', 101: 'F6', 102: 'F#6', 103: 'G6', 104: 'G#6', 105: 'A6', 106: 'A#6', 107: 'B6',
  108: 'C7', 109: 'C#7', 110: 'D7', 111: 'D#7', 112: 'E7', 113: 'F7', 114: 'F#7', 115: 'G7', 116: 'G#7', 117: 'A7', 118: 'A#7', 119: 'B7',
  120: 'C8'
};

declare const navigator: any;
const Tone = window['Tone'];
const Recorder = window['Recorder'];

@Component({
  selector: 'app-synth',
  templateUrl: './synth.component.html',
  styleUrls: ['./synth.component.css']
})
export class SynthComponent implements OnInit {
  @ViewChild('fftElement') fftElement;
  @ViewChild('waveformElement') waveformElement;

  notes: Array<any> = [];
  currentNote;
  noteTransforms = Object.keys(noteTransforms).map((key) => {
    return {frequency: key, note: noteTransforms[key]};
  });

  synth = null;
  fft = null;
  waveform = null;

  constructor(private cd: ChangeDetectorRef) {
    this.synth = this.initSynth();
  }

  ngOnInit() {
    this.initMidiInput();
    this.initAnalyzer();
  }

  // -------------------------------------------------------------------
  // RxJS MIDI with TONEJS
  // -------------------------------------------------------------------
  noteOn(note, velocity) {
    this.synth.triggerAttack(note, null, velocity);
  }

  noteOff(note) {
    this.synth.triggerRelease(note);
  }

  private initMidiInput() {
    const midiAccess$ = Observable.fromPromise(navigator.requestMIDIAccess());
    const stateStream$ = midiAccess$.flatMap(access => this.stateChangeAsObservable(access));
    const inputStream$ = midiAccess$.map((midi: any) => midi.inputs.values().next().value);

    const messages$ = inputStream$
      .filter(input => input !== undefined)
      .flatMap(input => this.midiMessageAsObservable(input))
      .map((message: any) => ({
        // Collect relevant data from the message
        // See for example http://www.midi.org/techspecs/midimessages.php
        status: message.data[0] & 0xf0,
        data: [
          message.data[1],
          message.data[2],
        ],
      }))
    ;

    stateStream$.subscribe(state => console.log('STATE CHANGE EVENT', state));

    messages$.subscribe(note => {
      this.midiMessageReceived(note);
      this.cd.detectChanges();
    });
  }

  private midiMessageReceived(message: any) {
    let cmd = message.status >> 4;
    let channel = message.status & 0xf;
    let noteNumber = noteTransforms[message.data[0]];
    let velocity = 0;
    if (message.data.length > 1) {
      velocity = message.data[1] / 120; // needs to be between 0 and 1 and sometimes it is over 100 ¯\_(ツ)_/¯
    }

    // MIDI noteon with velocity=0 is the same as noteoff
    if (cmd === 8 || ((cmd === 9) && (velocity === 0))) { // noteoff
      this.noteOff(noteNumber);
    } else if (cmd === 9) { // note on
      this.noteOn(noteNumber, velocity);
    } else if (cmd === 11) { // controller message
      // do something eventually!
    } else {
      // probably sysex!
    }
  }

  private stateChangeAsObservable(midi) {
    const source = new Subject();
    midi.onstatechange = event => source.next(event);
    return source.asObservable();
  }

  private midiMessageAsObservable(input) {
    const source = new Subject();
    input.onmidimessage = note => source.next(note);
    return source.asObservable();
  }

  private initSynth() {
    this.fft = new Tone.Analyser('fft', 32);
    this.waveform = new Tone.Analyser('waveform', 1024);

    return new Tone.PolySynth(6, Tone.Synth, {
        'oscillator': {
          'type': 'fatsawtooth',
          'count': 3,
          'spread': 30
        },
        'envelope': {
          'attack': 0.01,
          'decay': 0.1,
          'sustain': 0.5,
          'release': 0.4,
          'attackCurve': 'exponential'
        },
      })
      .fan(this.fft, this.waveform)
      .toMaster();
  }

  private initAnalyzer() {
    this.initFFTAnalyzer();
    this.initWaveAnalyzer();
  }

  // TODO Break into components
  private initFFTAnalyzer() {
    let fft = this.fft;
    let element: any = document.getElementById('fftElement'); // change
    let fftContext = element.getContext('2d');
    let canvasWidth, canvasHeight;

    function drawFFT(values){
      fftContext.clearRect(0, 0, canvasWidth, canvasHeight);
      let barWidth = canvasWidth / fft.size;
      for (let i = 0, len = values.length; i < len; i++){
        let val = values[i] / 255;
        let x = canvasWidth * (i / len);
        let y = val * canvasHeight;
        fftContext.fillStyle = 'rgba(210, 50, 88, ' + val + ')';
        fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
      }
    }

    function resize() {
      canvasWidth = element.width;
      canvasHeight = element.height;
    }

    function loop(){
      requestAnimationFrame(loop);
      // get the fft data and draw it
      let fftValues = fft.analyse();
      drawFFT(fftValues);
    }

    window.addEventListener('resize', resize);

    resize();

    loop();
  }

  initWaveAnalyzer() {
    let waveform = this.waveform;
    let element: any = document.getElementById('waveElement'); // change
    let waveContext = element.getContext('2d');
    let canvasWidth, canvasHeight, waveformGradient;

    function drawWaveform(values) {
      // draw the waveform
      waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
      waveContext.beginPath();
      waveContext.lineJoin = 'round';
      waveContext.lineWidth = 6;
      waveContext.strokeStyle = waveformGradient;
      waveContext.moveTo(0, (values[0] / 255) * canvasHeight);

      for (let i = 1, len = values.length; i < len; i++){
        let val = values[i] / 255;
        let x = canvasWidth * (i / len);
        let y = val * canvasHeight;
        waveContext.lineTo(x, y);
      }
      waveContext.stroke();
    }

    function resize() {
      canvasWidth = element.width;
      canvasHeight = element.height;

      waveformGradient = waveContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      waveformGradient.addColorStop(0, '#814f98');
      waveformGradient.addColorStop(1, '#46a8d7');
    }

    function loop(){
      requestAnimationFrame(loop);
      // get the waveform valeus and draw it
      let waveformValues = waveform.analyse();
      drawWaveform(waveformValues);
    }

    window.addEventListener('resize', resize);

    resize();

    loop();
  }
}
