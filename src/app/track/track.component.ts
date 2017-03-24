import { Component, OnInit } from '@angular/core';
import { MidiInputService } from "../services/pipeline/inputs/midi-input.service";
import { PipelineService } from "../services/pipeline/pipeline.service";

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  midiInputs: [any];

  constructor(
    private midiInputService: MidiInputService,
    private pipelineService: PipelineService
  ) { }

  ngOnInit() {
    this.midiInputs = this.midiInputService.getInputs();
  }

  connectSource(event) {
    this.pipelineService.begin(event.target.value);
  }

}
