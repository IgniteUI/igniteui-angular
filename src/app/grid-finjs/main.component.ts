import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { FinancialData } from '../shared/financialData';
import { LocalService } from '../shared/local.service';
import { ControllerComponent } from './controllers.component';
import { GridFinJSComponent } from './grid-finjs.component';

@Component({
    providers: [LocalService],
    selector: 'app-finjs-main',
    styleUrls: ['./main.component.scss'],
    templateUrl: './main.component.html'
})
export class MainComponent implements AfterViewInit, OnDestroy {
    @ViewChild('grid', { static: true }) public finGrid: GridFinJSComponent;
    @ViewChild('controllers', { static: true }) public controller: ControllerComponent;

    @Output() public switch = new EventEmitter<any>();
    @Output() public recordsVolume = new EventEmitter<any>();
    @Output() public frequencyTimer = new EventEmitter<any>();
    @Output() public player = new EventEmitter<any>();

    public data = [];
    private subscription$;

    constructor(private localService: LocalService, private elRef: ElementRef) {
        this.subscription$ = this.localService.getFinancialData(1000);

    }

    public selectionMode = 'multiple';
    public theme = false;
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
    private _timer;

    public ngAfterViewInit() {
        this.localService.records.subscribe(x => {
            this.finGrid.data = x;
            this.finGrid.cdr.detectChanges();
        });
    }

    public onSwitchChanged(event: any) {
        switch (event.action) {
            case 'toolbar': {
                this.finGrid.showToolbar = event.value;
                break;
            }
            case 'grouped': {
                this.finGrid.toggleGrouping();
                break;
            }
            case 'theme': {
                this.changeTheme(event.value);
                break;
            }
            default:
                {
                    break;
                }
        }
    }

    public onVolumeChanged(event: any) {
        this.localService.getFinancialData(this.volume);
    }

    public onFrequencyChanged(event: any) {
        switch (event.switch) {
            case 'theme': {
                this.changeTheme(event.checked);
                break;
            }
            case 'grouped': {
                this.disableOtherButtons(event.index, true);
                const currData = this.finGrid.data;
                this._timer = setInterval(() => this.tickerAllPrices(currData), this.frequency);
                break;
            }
            case 'showToolbar': {
                this.stopFeed();
                break;
            }
            default:
                {
                    break;
                }
        }
    }

    public onPlayAction(event: any) {
        switch (event.action) {
            case 'playAll': {
                this.disableOtherButtons(event.index, true);
                const currData = this.finGrid.data;
                this._timer = setInterval(() => this.tickerAllPrices(currData), this.controller.frequency);
                break;
            }
            case 'playRandom': {
                this.disableOtherButtons(event.index, true);
                const currData = this.finGrid.data;
                this._timer = setInterval(() => this.ticker(currData), this.controller.frequency);
                break;
            }
            case 'stop': {
                this.stopFeed();
                break;
            }
            default:
                {
                    break;
                }
        }
    }

    /**
     * the below code is needed when accessing the sample through the navigation
     * it will style all the space below the sample component element, but not the navigation menu
     */
    public changeTheme(dark: true) {
        const parentEl = this.parentComponentEl();
        if (dark && parentEl.classList.contains('main')) {
            parentEl.classList.add('fin-dark-theme');
        } else {
            parentEl.classList.remove('fin-dark-theme');
        }
    }

    public stopFeed() {
        if (this._timer) {
            clearInterval(this._timer);
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private ticker(data: any) {
        this.finGrid.data = FinancialData.updateRandomPrices(data);
    }

    private tickerAllPrices(data: any) {
        this.finGrid.data = FinancialData.updateAllPrices(data);
    }

    private disableOtherButtons(ind: number, disableButtons: boolean) {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.controller.volumeSlider.disabled = disableButtons;
        this.controller.intervalSlider.disabled = disableButtons;
        this.selectedButton = ind;
        this.controller.buttonGroup1.buttons.forEach((button, index) => {
            if (index === 2) { button.disabled = !disableButtons; } else {
                this.controller.buttonGroup1.buttons[0].disabled = disableButtons;
                this.controller.buttonGroup1.buttons[1].disabled = disableButtons;
            }
        });
    }

    /**
     * returns the main div container of the Index Component,
     * if path is /samples/sample-url, or the appRoot, if path is /sample-url
     */
    private parentComponentEl() {
        return this.elRef.nativeElement.parentElement.parentElement;
    }

    get buttonSelected(): number {
        return this.selectedButton || this.selectedButton === 0 ? this.selectedButton : -1;
    }

    public ngOnDestroy() {
        this.stopFeed();
        this.subscription$.unsubscribe();
    }
}
