import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MidiInputService } from "../services/pipeline/inputs/midi-input.service";
import { PipelineService } from "../services/pipeline/pipeline.service";

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  midiInputs: Array<any>;
  notes: Array<any> = [];
  currentNote: string;

  constructor(
    private midiInputService: MidiInputService,
    private pipelineService: PipelineService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    handleAudio();
    this.midiInputs = this.midiInputService.getInputs();
    this.pipelineService.synthStream$
      .subscribe(note => {
        this.currentNote = note['note'];
        // this.notes.push(note);
        // this.cd.detectChanges();
      });
  }

  connectSource(event) {
    this.pipelineService.begin(event.target.value);
  }

}


function handleAudio() {
  var AudioContext;
  var audioContext;
  var oscillator;
  var gainNode;
  var analyser;
  var canvas = document.getElementById("theCanvas");
  var canvasContext = canvas['getContext']("2d");
  var dataArray;
  var analyserMethod = "getByteTimeDomainData";
  var frequencySlider = document.getElementById("frequencySlider");

  var canvasWidth = canvas['width'];
  var canvasHeight = canvas['height'];

  function initAudio() {
    AudioContext = window['AudioContext'] || window['webkitAudioContext'];
    audioContext = new AudioContext();
    // The oscillator creates the sound waves.
    // As you can see on the canvas when drawing
    // the square wave, the wave is not perfectly
    // square. What you see is the Gibbs phenomenon
    // caused by the oscillator using Fourier series
    // to approximate the different wave types.
    oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    // The tone A
    // http://en.wikipedia.org/wiki/A440_(pitch_standard)
    oscillator.frequency.value = 440;
    oscillator.start(0);
    // Controls the volume
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    // Provides info about the sound playing
    analyser = audioContext.createAnalyser();
    gainNode.connect(analyser);
    gainNode.connect(audioContext.destination);

    // Oscillator -- Gain +-- Out (speaker/phones)
    //                    |
    //                    +-- Analyser
  };

  function startDrawing() {
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = 'rgba(0, 0, 0, 1)';
    function drawAgain() {
      canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
      requestAnimationFrame(drawAgain);

      analyser[analyserMethod](dataArray);
      for(var i = 0; i < bufferLength; i++){
        canvasContext.beginPath();
        canvasContext.moveTo(i, 255);
        canvasContext.lineTo(i, 255 - dataArray[i]);
        canvasContext.closePath();
        canvasContext.stroke();
      }
    }

    drawAgain();
  }

  initAudio();
  startDrawing();
};