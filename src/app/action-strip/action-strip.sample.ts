import { Component, ViewChild } from '@angular/core';
import { IgxActionStripComponent } from 'igniteui-angular';

@Component({
    selector: 'app-action-strip-sample',
    styleUrls: ['action-strip.sample.css'],
    templateUrl: `action-strip.sample.html`
})
export class ActionStripSampleComponent {
    @ViewChild('actionstrip') actionStrip: IgxActionStripComponent;
    public result: string;
    private counter = 0;

    doSomeAction() {
        this.result = `Clicked ${this.counter++} times`;
    }

    showActions() {
        this.actionStrip.hidden = false;
    }

    hideActions() {
        this.actionStrip.hidden = true;
    }
}