import { IgxCollapsibleComponent } from './../../../projects/igniteui-angular/src/lib/collapsible/collapsible.component';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
    // IgxCollapsibleComponent
} from 'igniteui-angular';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'collapsible-sample',
    templateUrl: './collapsible-sample.html',
    styleUrls: ['collapsible-sample.scss']
})
export class CollapsibleSampleComponent implements OnInit {
    @ViewChild(IgxCollapsibleComponent) public igxCollapsible: IgxCollapsibleComponent;
    @ViewChild('button') public button: ElementRef;


    ngOnInit() {
    }

    constructor() {
    }

    onOpening(event) {
    }
}
