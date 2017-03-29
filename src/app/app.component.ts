import { Component, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MnFullpageOptions, MnFullpageService } from 'ng2-fullpage';

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

  @Input() public options: MnFullpageOptions = new MnFullpageOptions({
    controlArrows: false,
    scrollingSpeed: 1000,

    menu: '.menu',
    css3: true,
    anchors: [
      'intro', 'connect', 'capture', 'interpret',
      'display', 'record', 'replay', 'layer',
      'visualize', 'finale'
    ]
  });

  @Output() private templates = {
    install: require('raw!./templates/install.template.txt'),
    usage: {
      slides: {
        module: require('raw!./templates/usage/slides/slide1/module.template.txt'),
        html: require('raw!./templates/usage/slides/slide2/html.template.txt')
      }
    },
    configuration: {
      slides: {
        attributes: require('raw!./templates/configurartion/slides/slide1/usage.attributes.slide.template.txt'),
        classOptions: require('raw!./templates/configurartion/slides/slide2/usage.class.options.template.txt'),
        mix: require('raw!./templates/configurartion/slides/slide3/usage.mix.template.txt')
      }
    },
    service: require('raw!./templates/service.template.txt'),
  };

  constructor() { }

  ngOnInit() {
  }
}