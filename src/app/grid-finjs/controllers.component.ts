import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { timer } from 'rxjs';
import { debounce } from 'rxjs/operators';

import {
    IgxButtonGroupComponent,
    IgxSliderComponent,
    IgxSwitchComponent,
} from 'igniteui-angular';

@Component({
    selector: 'app-finjs-controllers',
    styleUrls: ['./controllers.component.scss'],
    templateUrl: './controllers.component.html',
    imports: [IgxSwitchComponent, IgxSliderComponent, FormsModule, IgxButtonGroupComponent, NgIf]
})
export class ControllerComponent implements OnInit, OnDestroy {
    @ViewChild('buttonGroup1', { static: true }) public playButtons: IgxButtonGroupComponent;
    @ViewChild('slider1', { static: true }) public volumeSlider: IgxSliderComponent;
    @ViewChild('slider2', { static: true }) public intervalSlider: IgxSliderComponent;

    @Output() public switchChanged = new EventEmitter<any>();
    @Output() public volumeChanged = new EventEmitter<any>();
    @Output() public playAction = new EventEmitter<any>();

    public darkTheme = true;
    public volume = 1000;
    public frequency = 500;
    public controls = [
        {
            disabled: false,
            icon: 'update',
            label: 'LIVE PRICES',
            selected: false
        },
        {
            disabled: false,
            icon: 'update',
            label: 'LIVE ALL PRICES',
            selected: false
        },
        {
            disabled: true,
            icon: 'stop',
            label: 'Stop',
            selected: false
        }
    ];

    private subscription;
    private selectedButton;
    private volumeChanged$;

    public get buttonSelected(): number {
        return this.selectedButton || this.selectedButton === 0 ? this.selectedButton : -1;
    }

    public ngOnInit() {
        this.volumeChanged$ = this.volumeSlider.valueChange.pipe(debounce(() => timer(200)));
        this.volumeChanged$.subscribe(() => this.volumeChanged.emit(this.volumeSlider.value));
    }

    public onButtonSelected(event: any) {
        switch (event.index) {
            case 0: {
                this.disableOtherButtons(event.index, true);
                this.playAction.emit({ action: 'playRandom'});
                break;
            }
            case 1: {
                this.disableOtherButtons(event.index, true);
                this.playAction.emit({ action: 'playAll'});
                break;
            }
            case 2: {
                this.disableOtherButtons(event.index, false);
                this.playAction.emit({ action: 'stop'});
                break;
            }
            default:
                {
                    break;
                }
        }
    }

    public onChange(action: string, event: any) {
        this.switchChanged.emit({action, value: event.checked });
    }

    public ngOnDestroy() {
        this.volumeChanged$.unsubscribe();
    }

    private disableOtherButtons(ind: number, disableButtons: boolean) {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.volumeSlider.disabled = disableButtons;
        this.intervalSlider.disabled = disableButtons;
        this.selectedButton = ind;
        this.playButtons.buttons.forEach((button, index) => {
            if (index === 2) {
                button.disabled = !disableButtons;
            } else {
                this.playButtons.buttons[0].disabled = disableButtons;
                this.playButtons.buttons[1].disabled = disableButtons;
            }
        });
    }
}
