import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

declare const navigator: any;

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

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {

  currentNote: any = {
    name: 'N/A',
    status: 'N/A',
    pressure: 0
  };

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initMidiStream();
  }

  private initMidiStream() {
    // TODO: don't hardcode
    const midiID = 1951271040;
    // =======================

    const midiAccess$ = Observable.fromPromise(navigator.requestMIDIAccess());
    const stateStream$ = midiAccess$.flatMap(access => this.stateChangeAsObservable(access));
    const inputStream$ = midiAccess$
      .map((midi: any) => midi.inputs.get(midiID));

    const messages$ = inputStream$
      .filter(input => input !== undefined)
      .flatMap(input => this.midiMessageAsObservable(input))
      .map((message: any) => {
        const status = message.data[0] & 0xf0;
        return {
          // Collect relevant data from the message
          // See for example http://www.midi.org/techspecs/midimessages.php
          // TODO: very naive
          status: status === 144 ? 'PRESSED' : 'RELEASED',
          name: noteTransforms[message.data[1]],
          pressure: message.data[2]
        }})
    ;

    stateStream$.subscribe(state => console.log('STATE CHANGE EVENT', state));

    messages$.subscribe(message => {
      this.currentNote = message; // make immutable
      this.cd.detectChanges();
    });
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

}
