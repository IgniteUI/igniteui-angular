import {Component, ViewChild} from '@angular/core';
import * as Infragistics from '../../../src/main';

@Component({
    selector: 'sample-app',
    templateUrl: "app/main.html",
    directives: [
        Infragistics.Carousel,
        Infragistics.Slide
    ]
})

export class AppComponent {
    slides: Array<any> = [];
    interval: number = 750;
    pause: boolean = true;
    loop: boolean = true;

    constructor() {
            this.addNewSlide();
    }

    private addNewSlide() {
         this.slides.push(
            {image:'http://placekitten.com/600/300',text:'1'},
            {image:'http://placekitten.com/600/400',text:'2'},
            {image:'http://placekitten.com/600/350',text:'3'},
            {image:'http://placekitten.com/700/350',text:'4'},
            {image:'http://placekitten.com/650/250',text:'5'},
            {image:'http://placekitten.com/610/310',text:'6'}
        );
    }
}