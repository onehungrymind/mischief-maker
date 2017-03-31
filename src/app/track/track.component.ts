import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { D3, D3Service } from 'd3-ng2-service';

import { DomSanitizer } from '@angular/platform-browser';
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
const WaveSurfer = window['WaveSurfer'];

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  notes: Array<any> = [];
  currentNote;
  noteTransforms = Object.keys(noteTransforms).map((key) => {
    return {frequency: key, note: noteTransforms[key]};
  });

  isRecording = false;
  audioRecorder = null;
  recIndex = 0;
  downloadLink;
  downloadFile;

  synth = null;
  meter = null;
  path = null;
  fft = null;
  waveform = null;

  wavesurfer = null;

  private d3: D3;
  private parentNativeElement: any;

  constructor(private cd: ChangeDetectorRef,
              private sanitizer: DomSanitizer,
              element: ElementRef,
              d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
    this.synth = this.initSynth();
    this.audioRecorder = new Recorder(this.synth);
  }

  ngOnInit() {
    this.initMidiInput();

    this.wavesurfer = WaveSurfer.create({
      container: '#trackwave',
      scrollParent: true,
      waveColor: 'violet',
      progressColor: 'purple'
    });
  }

  toggleRecording() {
    if (this.isRecording) {
      // stop recording
      this.audioRecorder.stop();
      this.audioRecorder.getBuffers(this.processBuffers.bind(this));
      this.isRecording = false;
    } else {
      // start recording
      if (!this.audioRecorder) {
        return;
      }

      this.isRecording = true;
      this.audioRecorder.clear();
      this.audioRecorder.record();
    }
  }

  processBuffers(buffers) {
    // let canvas: any = document.getElementById('replay-waveform');
    // this.drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

    this.audioRecorder.exportWAV(this.encode.bind(this));
  }

  encode(blob) {
    this.setupDownload(blob, 'myRecording' + ((this.recIndex < 10) ? '0' : '') + this.recIndex + '.wav');
    this.recIndex++;
  }

  setupDownload(blob, filename) {
    let url = (window.URL).createObjectURL(blob);
    this.downloadLink = this.sanitizer.bypassSecurityTrustUrl(url);
    this.downloadFile = filename || 'output.wav';

    // Now that we have a blob... spin up wavesurfer
    this.wavesurfer.loadBlob(blob);
  }

  drawBuffer(width, height, context, data) {
    let step = Math.ceil(data.length / width);
    let amp = height / 2;
    context.fillStyle = 'silver';
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        let datum = data[(i * step) + j];
        if (datum < min) {
          min = datum;
        }
        if (datum > max) {
          max = datum;
        }
      }
      context.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }

  // -------------------------------------------------------------------
  // RxJS MIDI with TONEJS
  // -------------------------------------------------------------------
  noteOn(note, velocity) {
    this.synth.triggerAttack(note, null, velocity);
    // this.synth.triggerAttack(note);
  }

  noteOff(note) {
    this.synth.triggerRelease(note);
    // this.synth.triggerRelease();
  }

  getAdjustedNoteHeight(note) {
    return `${50 + note.pressure / 2.5}%`;
  }

  private initMidiInput() {
    const midiAccess$ = Observable.fromPromise(navigator.requestMIDIAccess());
    const stateStream$ = midiAccess$.flatMap(access => this.stateChangeAsObservable(access));
    const inputStream$ = midiAccess$.map((midi: any) => midi.inputs.values().next().value);

    // .do((midi: any) => console.log('INPUTS', Array.from(midi.inputs)))

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
      this.notes = this.notes.concat(note);
      this.currentNote = noteTransforms[note.data[0]];

      this.processNoteTransforms(note);
      this.midiMessageReceived(note);
      this.cd.detectChanges();
    });
  }

  private processNoteTransforms(note) {
    const frequency = note.data[0] + ''; // hack to do strict equality comparison
    const pressure = note.data[1];

    this.noteTransforms
      .forEach(n => {
        if (n.frequency === frequency) {
          n['active'] = pressure > 0;
          n['pressure'] = pressure;
        }
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
    // NOTE: Check out https://github.com/Tonejs/Presets for more tones

    this.meter = new Tone.Meter('level');
    this.fft = new Tone.Analyser('fft', 32);
    this.waveform = new Tone.Analyser('waveform', 1024);

    // SYNTH
    // return new Tone.Synth().toMaster();

    // MONOSYNTH
    // return new Tone.MonoSynth({
    //     'portamento': 0.01,
    //     'oscillator': {
    //       'type': 'square'
    //     },
    //     'envelope': {
    //       'attack': 0.005,
    //       'decay': 0.2,
    //       'sustain': 0.4,
    //       'release': 1.4,
    //     },
    //     'filterEnvelope': {
    //       'attack': 0.005,
    //       'decay': 0.1,
    //       'sustain': 0.05,
    //       'release': 0.8,
    //       'baseFrequency': 300,
    //       'octaves': 4
    //     }
    //   }).toMaster();


    // POLYSYNTH
    // return new Tone.PolySynth(6, Tone.Synth, {
    //   'oscillator' : {
    //     'partials' : [0, 2, 3, 4],
    //   }
    // }).toMaster();

    // FATOSCILLATOR
    return new Tone.PolySynth(6, Tone.Synth, {
      'oscillator' : {
        'type' : 'fatsawtooth',
        'count' : 3,
        'spread' : 30
      },
      'envelope': {
        'attack': 0.01,
        'decay': 0.1,
        'sustain': 0.5,
        'release': 0.4,
        'attackCurve' : 'exponential'
      },
    })
      // .connect(this.meter)
      // .fan(this.fft, this.waveform)
      .toMaster();
  }

  // -------------------------------------------------------------------
  // METER STYLE VISUALIZATION
  // -------------------------------------------------------------------

  private initMeter() {
    let canvas: any = document.getElementById('fft');
    let meterContext = canvas.getContext('2d');

    let meterGradient;
    let canvasWidth, canvasHeight;
    let meter = this.meter;

    function drawMeter() {
      let level = meter.value * 0.8; // scale it since values go above 1 when clipping
      meterContext.clearRect(0, 0, canvasWidth, canvasHeight);
      meterContext.fillStyle = meterGradient;
      meterContext.fillRect(0, 0, canvasWidth, canvasHeight);
      meterContext.fillStyle = 'white';
      meterContext.fillRect(canvasWidth * level, 0, canvasWidth, canvasHeight);
    }

    function sizeCanvases() {
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      meterContext.canvas.width = canvasWidth;
      meterContext.canvas.height = canvasHeight;
      meterGradient = meterContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      meterGradient.addColorStop(0, '#BFFF02');
      meterGradient.addColorStop(0.8, '#02FF24');
      meterGradient.addColorStop(1, '#FF0202');
    }

    function loop() {
      requestAnimationFrame(loop);
      drawMeter();
    }

    window.addEventListener('resize', sizeCanvases);

    sizeCanvases();

    loop();
  }

  // -------------------------------------------------------------------
  // D3 VISUALIZATION
  // -------------------------------------------------------------------
  private doSomethingPretty() {
    let d3 = this.d3;

    // set the dimensions and margins of the graph
    let margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      angles = d3.range(0, 2 * Math.PI, Math.PI / 200);

    let svg = d3.select(this.parentNativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    this.path = svg.append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
      .attr('fill', 'none')
      .attr('stroke-width', 10)
      .attr('stroke-linejoin', 'round')
      .selectAll('path')
      .data(['cyan', 'magenta', 'yellow'])
      .enter().append('path')
      .attr('stroke', function (d) {
        return d;
      })
      .style('mix-blend-mode', 'darken')
      .datum(function (d, i) {
        return d3.radialLine()
          .curve(d3.curveLinearClosed)
          .angle((a: any) => a)
          .radius((a: any) => {
            let t = d3.now() / 1000;
            return 200 + Math.cos(a * 8 - i * 2 * Math.PI / 3 + t) * Math.pow((1 + Math.cos(a - t)) / 2, 3) * 32;
          });
      });

    d3.timer(() => this.path.attr('d', (d: any) => d(angles)));
  }

  // -------------------------------------------------------------------
  // D3 RANDOM CHART
  // -------------------------------------------------------------------
  private doSomethingRandom() {
    let d3 = this.d3;
    let canvas = document.querySelector('canvas'),
      context = canvas.getContext('2d'),
      width = canvas.width,
      height = canvas.height,
      color = d3.scaleSequential(d3.interpolateRainbow).domain([0, 1000]),
      randomX = d3.randomNormal(0.3),
      randomY = d3.randomNormal(0);

    render();

    canvas.onclick = render;

    function render() {
      let x0 = width / 20,
        y0 = height / 2,
        mainWalk = randomWalk(x0, y0, 1000);

      context.clearRect(0, 0, width, height);
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = 1.5;
      context.strokeStyle = 'black';
      renderWalk(mainWalk);

      context.globalCompositeOperation = 'multiply';
      context.lineWidth = 1;
      for (let i = 0; i < mainWalk.length; i += 2) {
        let branchStart = mainWalk[i],
          x0 = branchStart[0],
          y0 = branchStart[1];
        for (let j = 0; j < 1; ++j) {
          context.strokeStyle = color(i + (Math.random() - 0.5) * 50);
          let x1 = x0, y1 = y0;
          for (let k = 0, m = 20; k < m; ++k) {
            context.globalAlpha = (m - k - 1) / m;
            let pieceWalk = randomWalk(x1, y1, 10),
              pieceEnd = pieceWalk[pieceWalk.length - 1];
            renderWalk(pieceWalk);
            x1 = pieceEnd[0];
            y1 = pieceEnd[1];
          }
          context.globalAlpha = 1;
        }
      }
    }

    function renderWalk(walk) {
      let i, n = walk.length;
      context.beginPath();
      context.moveTo(walk[0][0], walk[0][1]);
      for (i = 1; i < n; ++i) {
        context.lineTo(walk[i][0], walk[i][1]);
      }
      context.stroke();
    }

    function randomWalk(x0, y0, n) {
      let points = new Array(n), i;
      points[0] = [x0, y0];
      for (i = 1; i < n; ++i) {
        points[i] = [
          x0 += randomX() * 2,
          y0 += randomY() * 2
        ];
      }
      return points;
    }
  }
}
