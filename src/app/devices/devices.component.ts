import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

declare const navigator: any;

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
    styleUrls: ['./devices.component.css']
  })
  export class DevicesComponent implements OnInit {
  devices: any[] = null;

  constructor() { }

  ngOnInit() {
    this.fetchDevices();
  }

  private fetchDevices() {
    Observable
      .fromPromise(navigator.requestMIDIAccess())
      .map((midi: any) => Array.from(midi.inputs)) // convert from iterable
      .map((devices: any) => devices.map(device => device[1])) // grab just the MIDIInput
      .subscribe((devices: any) => this.devices = devices)
    ;
  }
}
