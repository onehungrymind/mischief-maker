import { Component } from '@angular/core';
import { SequencerService } from '../services/sequencer.service';

@Component({
  selector: 'polysynth-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
  providers: [
    SequencerService
  ]
})
export class ControlPanelComponent {

  constructor(private sequencer: SequencerService) { }

  record() {
    this.sequencer.record();
  }

  stop() {
    this.sequencer.stop();
  }

  playback() {
    this.sequencer.playback();
  }
}
