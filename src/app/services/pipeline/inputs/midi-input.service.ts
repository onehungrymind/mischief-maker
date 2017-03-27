import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { SynthMessage, SynthNoteOn } from '../../../models/synth-note-message';

@Injectable()
export class MidiInputService {

  inputs: any[] = []; // TODO - stronger typing

  // reference to pipeline's synth service stream
  private synthStream$: Subject<SynthMessage>;

  noteTransforms = {
    // TODO Map the rest
    48: 'C2', 49: 'C#2', 50: 'D2', 51: 'D#2', 52: 'E2', 53: 'F2', 54: 'F#2', 55: 'G2', 56: 'G#2', 57: 'A2', 58: 'A#2', 59: 'B2',
    60: 'C3', 61: 'C#3', 62: 'D3', 63: 'D#3', 64: 'E3', 65: 'F3', 66: 'F#3', 67: 'G3', 68: 'G#3', 69: 'A3', 70: 'A#3', 71: 'B3',
    72: 'C4', 73: 'C#4', 74: 'D4', 75: 'D#4', 76: 'E4', 77: 'F4', 78: 'F#4', 79: 'G4', 80: 'G#4', 81: 'A4', 82: 'A#4', 83: 'B4',
  };

  getInputs() {
    if ('navigator' in window && 'requestMIDIAccess' in window['navigator']) {
      return window.navigator['requestMIDIAccess']()
        .then((access) => Array.from(access.inputs).map(item => item[1]))
        .then(this.cacheInputs.bind(this));
    } else {
      return Promise.reject(new Error('Could not get MIDI controllers'));
    }
  }

  cacheInputs(inputs) {
    this.inputs = inputs;
    return inputs;
  }

  setup(synthStream$: Subject<SynthMessage>, inputId: any) {
    // hold ref to synth note and control stream
    this.synthStream$ = synthStream$;

    // request MIDI access
    if (this.inputs && this.inputs.length > 0) {
      let selectedInput = this.inputs.find(input => input.id === inputId);
      this.connect(selectedInput);
    } else {
      console.log('no midi inputs');
    }
  }

  private connectDefaultInput() {
    if (this.inputs && this.inputs.length > 0) {
      return this.connect(this.inputs[0]);
    } else {
      console.log('no midi inputs');
    }
  }

  // does the heavy lifting
  private connect(input) {
    let self = this;
    input.open()
      .then(
        (channelInputStream$: any) => {
          console.log('channelInputStream$', channelInputStream$);
          channelInputStream$.onmidimessage = (midiChannelData) => {
            let parsedMessage: SynthMessage = self.decode(midiChannelData);
            // some notes don't map to a message, ignore those
            if (parsedMessage) {
              self.synthStream$.next(parsedMessage);
            }
          };
        },
        (error) => {
          console.error('Failure opening MIDI channel', error);
        });
  }

  private decode(midiChannelMessage): SynthMessage {
    let response: SynthMessage = null;

    console.log('midiChannelMessage.data[0]', midiChannelMessage.data);

    switch (midiChannelMessage.data[0]) {
      // case 145:
      //   if (midiChannelMessage.data[1] === 1) {
      //     console.log('mod level set to to', midiChannelMessage.data[2]);
      //   } else if (midiChannelMessage.data[1] === 2) {
      //     response = new WaveformChange(midiChannelMessage.data[2]);
      //   } else if (midiChannelMessage.data[1] === 3) {
      //     response = new VolumeChange(midiChannelMessage.data[2]);
      //   }
      //   break;
      case 128:
      case 144:
      case 149:
        // IGNORE NOTE OFF EVENTS
        if (midiChannelMessage.data[2] === 0) {
          return;
        }

        response = new SynthNoteOn(this.noteTransforms[midiChannelMessage.data[1]]);
        break;

      default:
        // TODO not sure, nothing returned
        console.log('invalid midiChannelMessage?', midiChannelMessage);
    }
    return response;
  }
}
