import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { FinancialData } from '../shared/financialData';
import { ControllerComponent } from './controllers.component';
import { GridFinJSComponent } from './grid-finjs.component';

@Component({
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
    public theme = false;
    public volume = 1000;
    public frequency = 500;

    private subscription$;
    private _timer;

    constructor() { }

    public ngAfterViewInit() {
        // this.subscription$ = this.localService.records.subscribe(x => {
        //     this.finGrid.data = x;
        // });
    }

    public ngOnDestroy() {
        this.stopFeed();
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

    public onVolumeChanged(volume: any) {
        this.finGrid.grid.deselectAllRows();
        this.finGrid.finService.getFinancialData(volume);
    }

    public onPlayAction(event: any) {
        switch (event.action) {
            case 'playAll': {
                const currData = this.finGrid.grid.filteredSortedData ?? this.finGrid.data;
                this._timer = setInterval(() => this.finGrid.finService.updateAllPriceValues(currData), this.controller.frequency);
                break;
            }
            case 'playRandom': {
                const currData = this.finGrid.data;
                this._timer = setInterval(() => this.finGrid.finService.updateRandomPriceValues(currData), this.controller.frequency);
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
        if (this.subscription$) {
            this.subscription$.unsubscribe();
        }
    }

    /**
     * returns the main div container of the Index Component,
     * if path is /samples/sample-url, or the appRoot, if path is /sample-url
     */
    private parentComponentEl() {
        return this.elRef.nativeElement.parentElement.parentElement;
    }
}
