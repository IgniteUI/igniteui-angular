import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocalService } from '../shared/local.service';
import { ControllerComponent } from './controllers.component';
import { GridFinJSComponent } from './grid-finjs.component';

@Component({
    providers: [LocalService],
    selector: 'app-finjs-main',
    styleUrls: ['./main.component.scss'],
    templateUrl: './main.component.html'
})
export class MainComponent implements OnDestroy {
    @ViewChild('grid', { static: true }) public finGrid: GridFinJSComponent;
    @ViewChild('controllers', { static: true }) public controller: ControllerComponent;

    @Output() public switch = new EventEmitter<any>();
    @Output() public recordsVolume = new EventEmitter<any>();
    @Output() public frequencyTimer = new EventEmitter<any>();
    @Output() public player = new EventEmitter<any>();

    public volume = 1000;
    public frequency = 500;
    public darkTheme = true;
    public data$: any;
    private destroy$ = new Subject<any>();
    private _timer;

    constructor(public finService: LocalService) {
        this.finService.getFinancialData(this.volume);
        this.data$ = this.finService.records.pipe(takeUntil(this.destroy$));
    }

    public ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.complete();
        this.stopFeed();
    }

    public onSwitchChanged(event: any) {
        switch (event.action) {
            case 'toolbar': {
                this.finGrid.showToolbar = event.value;
                break;
            }
            case 'grouped': {
                this.finGrid.toggleGrouping(event.value);
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
        this.finService.getFinancialData(volume);
    }

    public onPlayAction(event: any) {
        switch (event.action) {
            case 'playAll': {
                const currData = this.finGrid.grid.filteredSortedData ?? this.finGrid.data;
                this._timer = setInterval(() => this.finService.updateAllPriceValues(currData), this.controller.frequency);
                break;
            }
            case 'playRandom': {
                const currData = this.finGrid.data;
                this._timer = setInterval(() => this.finService.updateRandomPriceValues(currData), this.controller.frequency);
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

    public stopFeed() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }
}
