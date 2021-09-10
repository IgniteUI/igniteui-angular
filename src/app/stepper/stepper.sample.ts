import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {
    IgxStepperLabelPosition, IgxStepperOrienatation, IgxStepperProgressLine, IgxStepType
} from 'projects/igniteui-angular/src/lib/stepper/common';
import { IgxStepperComponent } from 'projects/igniteui-angular/src/lib/stepper/igx-stepper.component';

@Component({
    templateUrl: 'stepper.sample.html',
    styleUrls: ['stepper.sample.scss']
})
export class IgxStepperSampleComponent implements AfterViewInit {
    @ViewChild('stepper', { static: true }) public stepper: IgxStepperComponent;

    public activeProp = true;
    // public stepType = IgxStepType.Full;
    // public labelPos = IgxStepperLabelPosition.Bottom;
    // public stepTypes = [
    //     { label: 'Indicator', stepType: IgxStepType.Indicator, selected: this.stepType === IgxStepType.Indicator, togglable: true },
    //     { label: 'Label', stepType: IgxStepType.Label, selected: this.stepType === IgxStepType.Label, togglable: true },
    //     { label: 'Full', stepType: IgxStepType.Full, selected: this.stepType === IgxStepType.Full, togglable: true }
    // ];
    // public labelPositions = [
    //     { label: 'Bottom', labelPos: IgxStepperLabelPosition.Bottom,
    //         selected: this.labelPos === IgxStepperLabelPosition.Bottom, togglable: true },
    //     { label: 'Top', labelPos: IgxStepperLabelPosition.Top,
    //         selected: this.labelPos === IgxStepperLabelPosition.Top, togglable: true },
    //     { label: 'End', labelPos: IgxStepperLabelPosition.End,
    //         selected: this.labelPos === IgxStepperLabelPosition.End, togglable: true },
    //     { label: 'Start', labelPos: IgxStepperLabelPosition.Start,
    //         selected: this.labelPos === IgxStepperLabelPosition.Start, togglable: true }
    // ];
    public ngAfterViewInit() {
        // requestAnimationFrame(() => {
        //     this.stepper.steps[1].completedStyle = IgxStepperProgressLine.Dashed;
        // });
    }
    // public toggleStepTypes(event){
    //     this.stepType = this.stepTypes[event.index].stepType;
    // }
    // public toggleLabelPos(event){
    //     this.labelPos = this.labelPositions[event.index].labelPos;
    // }

    public activeChanged(event, step) {
        console.log('ACTIVE CHANGED');
        console.log(event, step);
    }

    public activeStepChanged(ev) {
        console.log('ACTIVE STEP CHANGED');
        console.log(ev);
    }

    public activeStepChanging(ev) {
        ev.cancel = true;
        // ev.cancel = true;
        console.log('ACTIVE STEP CHANGING');
        console.log(ev);
    }

    public changeOrientation() {
        if (this.stepper.orientation === IgxStepperOrienatation.Horizontal) {
            this.stepper.orientation = IgxStepperOrienatation.Vertical;
        } else {
            this.stepper.orientation = IgxStepperOrienatation.Horizontal;
        }
    }
}
