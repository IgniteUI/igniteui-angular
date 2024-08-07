import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { FinancialData, Stock } from '../shared/financialData2';

@Injectable({
    providedIn: 'root'
})
export class SignalRService implements OnDestroy {
    public data: BehaviorSubject<Stock[]>;
    public hasRemoteConnection: boolean;
    private hubConnection!: signalR.HubConnection;
    private _timer!: ReturnType<typeof setInterval>;

    constructor(private zone: NgZone) {
        this.data = new BehaviorSubject([] as Stock[]);
    }

    public ngOnDestroy(): void {
        this.stopLiveData();
    }

    public startConnection = (interval = 500, volume = 1000, live = false, updateAll = true): void => {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.Trace)
            .withUrl('https://www.infragistics.com/angular-apis/webapi/streamHub')
            .build();
        this.hubConnection
            .start()
            .then(() => {
                this.hasRemoteConnection = true;
                this.registerSignalEvents();
                this.broadcastParams(interval, volume, live, updateAll);
            })
            .catch(() => {
                this.hasRemoteConnection = false;
                if (this._timer) {
                    this.stopFeed();
                 }
                const data = FinancialData.generateData(volume);
                live ? this._timer = setInterval(() => updateAll ?
                    this.updateAllPriceValues(data) : this.updateRandomPriceValues(data), interval) :
                        this.getData(volume);
            });
    };

    public broadcastParams = (frequency, volume, live, updateAll = true): void => {
        this.hubConnection.invoke('updateparameters', frequency, volume, live, updateAll)
            .then(() => console.log('requestLiveData', volume))
            .catch(err => {
                console.error(err);
            });
    };

    public stopLiveData = (): void => {
        if (this.hasRemoteConnection) {
            this.hubConnection.invoke('StopTimer')
            .catch(err => console.error(err));
        } else {
            this.stopFeed();
        }
    };

    public getData(count: number = 10): void {
        this.data.next(FinancialData.generateData(count));
    }

    public updateAllPriceValues(data: Stock[]): void {
        this.zone.runOutsideAngular(() =>  {
            const newData = FinancialData.updateAllPrices(data);
            this.data.next(newData);
        });
    }

    public updateRandomPriceValues(data: Stock[]): void {
        this.zone.runOutsideAngular(() =>  {
            const newData = FinancialData.updateRandomPrices(data);
            this.data.next(newData);
        });
    }

    private stopFeed(): void {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }

    // Register signalR events
    private registerSignalEvents(): void {
        this.hubConnection.onclose(() => {
            this.hasRemoteConnection = false;
        });
        this.hubConnection.on('transferdata', (data: Stock[]) => {
            this.data.next(data);
        });
    }
}
