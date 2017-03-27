import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit } from '@angular/core';
import { D3, D3Service, Timer } from 'd3-ng2-service';

import { MidiInputService } from '../services/pipeline/inputs/midi-input.service';
import { PipelineService } from '../services/pipeline/pipeline.service';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.css']
})
export class TrackComponent implements OnInit {
  midiInputs: Array<any>;
  notes: Array<any> = [];
  currentNote: string;

  private d3: D3;
  private parentNativeElement: any;

  constructor(private midiInputService: MidiInputService,
              private pipelineService: PipelineService,
              private cd: ChangeDetectorRef,
              element: ElementRef,
              d3Service: D3Service) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    this.doSomethingLoud();
    // this.doSomethingViolent();
    // this.doSomethingPretty();
    // this.doSomethingRandom();
    this.doSomethingMicrophony();
  }

  doSomethingWavy() {
    let wavesurfer = window['WaveSurfer'].create({
      container: '#waveform',
      waveColor: 'violet',
      progressColor: 'purple'
    });

    wavesurfer.load('assets/audio/TellMeHow.mp3');
  }

  doSomethingMicrophony() {
    let wavesurfer = window['WaveSurfer'].create({
      container: '#waveform',
      waveColor: 'violet'
    });

    let microphone = Object.create(window['WaveSurfer'].Microphone);

    microphone.init({
      wavesurfer: wavesurfer
    });

    microphone.on('deviceReady', function(stream) {
      console.log('Device ready!', stream);
    });
    microphone.on('deviceError', function(code) {
      console.warn('Device error: ' + code);
    });

    // pause rendering
    //microphone.pause();

    // resume rendering
    //microphone.play();

    // stop visualization and disconnect microphone
    //microphone.stopDevice();

    // same as stopDevice() but also clears the wavesurfer canvas
    //microphone.stop();

    // destroy the plugin
    //microphone.destroy();

    microphone.start();
  }


  doSomethingRandom() {
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
  
  
  doSomethingPretty() {
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

    let path = svg.append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
      .attr('fill', 'none')
      .attr('stroke-width', 10)
      .attr('stroke-linejoin', 'round')
      .selectAll('path')
      .data(['cyan', 'magenta', 'yellow'])
      .enter().append('path')
      .attr('stroke', function(d) { return d; })
      .style('mix-blend-mode', 'darken')
      .datum(function(d, i) {
        return d3.radialLine()
          .curve(d3.curveLinearClosed)
          .angle((a: any) => a)
          .radius((a: any) => {
            let t = d3.now() / 1000;
            return 200 + Math.cos(a * 8 - i * 2 * Math.PI / 3 + t) * Math.pow((1 + Math.cos(a - t)) / 2, 3) * 32;
          });
      });

    d3.timer(function() {
      path.attr('d', (d: any) => d(angles));
    });    
  }
  
  doSomethingViolent() {
    let data = [
      {date: '1-May-12' , close: '58.13'},
      {date: '30-Apr-12', close: '53.98'},
      {date: '27-Apr-12', close: '67.00'},
      {date: '26-Apr-12', close: '89.70'},
      {date: '25-Apr-12', close: '99.00'},
      {date: '24-Apr-12', close: '130.28'},
      {date: '23-Apr-12', close: '166.70'},
      {date: '20-Apr-12', close: '234.98'},
      {date: '19-Apr-12', close: '345.44'},
      {date: '18-Apr-12', close: '443.34'},
      {date: '17-Apr-12', close: '543.70'},
      {date: '16-Apr-12', close: '580.13'},
      {date: '13-Apr-12', close: '605.23'},
      {date: '12-Apr-12', close: '622.77'},
      {date: '11-Apr-12', close: '626.20'},
      {date: '10-Apr-12', close: '628.44'},
      {date: '9-Apr-12' , close: '636.23'},
      {date: '5-Apr-12' , close: '633.68'},
      {date: '4-Apr-12' , close: '624.31'},
      {date: '3-Apr-12' , close: '629.32'},
      {date: '2-Apr-12' , close: '618.63'},
      {date: '30-Mar-12', close: '599.55'},
      {date: '29-Mar-12', close: '609.86'},
      {date: '28-Mar-12', close: '617.62'},
      {date: '27-Mar-12', close: '614.48'},
      {date: '26-Mar-12', close: '606.98'},
    ];

    let d3 = this.d3;

    // set the dimensions and margins of the graph
    let margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // parse the date / time
    let parseTime = d3.timeParse('%d-%b-%y');

    // set the ranges
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    // define the line
    let valueline: any = d3.line()
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.close));

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    let svg = d3.select(this.parentNativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // format the data
    data.forEach((d: any) => {
      d.date = parseTime(d.date);
      d.close = +d.close;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, (d: any) => d.date));
    y.domain([0, d3.max(data, (d: any) => d.close)]);

    // Add the valueline path.
    svg.append('path')
      .data([data])
      .attr('class', 'line')
      .attr('d', valueline);

    // Add the X Axis
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append('g')
      .call(d3.axisLeft(y));
  }


  private doSomethingLoud() {
    this.midiInputs = this.midiInputService.getInputs();
    this.pipelineService.synthStream$
      .subscribe(note => {
        this.currentNote = note['note'];
        // this.notes.push(note);
        // this.cd.detectChanges();
      });
  }

  private connectSource(event) {
    this.pipelineService.begin(event.target.value);
  }
}
