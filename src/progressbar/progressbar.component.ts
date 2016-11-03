import { NgModule, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

const igProgressbarConfig = {
    max: 100,
    animated: false,
    striped: false,
    type: "default"
}

@Component({
    selector: 'ig-progressbar',
    template: `
        <div class="progress"
            [class.progress-animated]="animated"
            [class.progress-striped]="striped">
            <div class="progress-bar progress-bar{{type ? '-' + type : ''}}"
                aria-valuemin="0"
                [attr.aria-valuemax]="max"
                [attr.aria-valuenow]="getValue()"
                [style.width.%]="getPercentValue()">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .progress-bar {
            height: 100%
        }
        .progress {
            width: 100%;
            height: 20px;
            background-color: #F0F8FF;
            border: 1px solid black;
            border-radius: 5px;
        }
        .progress-striped > div{
            background-image:
            -webkit-linear-gradient(45deg,rgba(255,255,255,.15) 25%,
            transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,
            rgba(255,255,255,.15) 75%,
            transparent 75%,transparent);

            background-image:
            -o-linear-gradient(45deg,rgba(255,255,255,.15) 25%,
            transparent 25%,transparent 50%,
            rgba(255,255,255,.15) 50%,
            rgba(255,255,255,.15) 75%,
            transparent 75%,transparent);

            background-image:
            linear-gradient(45deg,rgba(255,255,255,.15) 25%,
            transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,
            rgba(255,255,255,.15) 75%,
            transparent 75%,transparent);
            -webkit-background-size: 40px 40px;
            background-size: 40px 40px;
        }
        .progress-animated > div {
            transition: width 1s linear;
        }
        .progress-bar > b {
            verticle-aling: middle;
        }
        .progress-bar-danger {
            background-color: #d9534f;
        }
        .progress-bar-warning {
            background-color: #f0ad4e;
        }
        .progress-bar-info {
            background-color: #5bc0de;
        }
        .progress-bar-success {
            background-color: #5cb85c;
        }
        .progress-bar-default {
            background-color: #337ab7;
        }
        `
    ]
})
export class IgProgressBar {
    @Input() max: number;
    @Input() animated: boolean;
    @Input() striped: boolean;
    @Input() type: string;
    @Input() value = 0;

    constructor(){
        this.max = igProgressbarConfig.max;
        this.animated = igProgressbarConfig.animated;
        this.striped = igProgressbarConfig.striped;
        this.type = igProgressbarConfig.type;
    }

    public getValue() {
        return getValueInRange(this.value, this.max);
    }

    public getPercentValue() {
        return 100 * this.getValue() / this.max;
    }
}

export function getValueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

@NgModule({
    imports: [ CommonModule],
    declarations: [IgProgressBar],
    exports: [IgProgressBar]
})
export class IgProgressBarModule {
}