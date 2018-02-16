import { Component, Injectable, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { IgxColumnComponent } from "../../lib/grid/column.component";
import { IgxGridComponent } from "../../lib/grid/grid.component";
import {
	DataContainer,
	IDataState,
	IPagingState,
	PagingError,
	SortingDirection,
	StableSortingStrategy
} from "../../lib/main";

@Injectable()
export class LocalService {
	public records: Observable<any[]>;
	private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Alphabetical_list_of_products";
	private _records: BehaviorSubject<any[]>;
	private dataStore: any[];

	constructor(private http: Http) {
		this.dataStore = [];
		this._records = new BehaviorSubject([]);
		this.records = this._records.asObservable();
	}

	public getData() {
		return this.http.get(this.url)
			.map((response) => response.json())
			.subscribe((data) => {
				this.dataStore = data.value;
				this._records.next(this.dataStore);
			});
	}

}

@Injectable()
export class RemoteService {
	public remoteData: Observable<any[]>;
	private url: string = "http://services.odata.org/V4/Northwind/Northwind.svc/Products";
	private _remoteData: BehaviorSubject<any[]>;

	constructor(private http: Http) {
		this._remoteData = new BehaviorSubject([]);
		this.remoteData = this._remoteData.asObservable();
	}

	public getData(dataState?: IDataState, cb?: () => void): any {
		return this.http
			.get(this.buildUrl(dataState))
			.map((response) => response.json())
			.map((response) => {
				if (dataState) {
					const p: IPagingState = dataState.paging;
					if (p) {
						const countRecs: number = response["@odata.count"];
						p.metadata = {
							countPages: Math.ceil(countRecs / p.recordsPerPage),
							countRecords: countRecs,
							error: PagingError.None
						};
					}
				}
				if (cb) {
					cb();
				}
				return response;
			})
			.subscribe((data) => {
				this._remoteData.next(data.value);
			});
	}

	private buildUrl(dataState: IDataState): string {
		let qS: string = "";
		if (dataState && dataState.paging) {
			const skip = dataState.paging.index * dataState.paging.recordsPerPage;
			const top = dataState.paging.recordsPerPage;
			qS += `$skip=${skip}&$top=${top}&$count=true`;
		}
		if (dataState && dataState.sorting) {
			const s = dataState.sorting;
			if (s && s.expressions && s.expressions.length) {
				qS += (qS ? "&" : "") + "$orderby=";
				s.expressions.forEach((e, ind) => {
					qS += ind ? "," : "";
					qS += `${e.fieldName} ${e.dir === SortingDirection.Asc ? "asc" : "desc"}`;
				});
			}
		}
		qS = qS ? `?${qS}` : "";
		return `${this.url}${qS}`;
	}
}

@Component({
	providers: [LocalService, RemoteService],
	selector: "grid-sample",
	styleUrls: ["../app.samples.css", "sample.component.css"],
	templateUrl: "sample.component.html"
})

export class GridColumnFixingSampleComponent {
	@ViewChild("grid1") public grid1: IgxGridComponent;
	public data: Observable<any[]>;
	public remote: Observable<any[]>;
	public localData: any[] = [];
	public selectedCell;
	public selectedRow;
	public newRecord = "";
	public editCell;
	public columns;
	constructor(private localService: LocalService,
		private remoteService: RemoteService) { }
	public ngOnInit(): void {
		this.data = this.localService.records;
		this.remote = this.remoteService.remoteData;
		var cols = [];
		for (var j = 0; j < 300; j++) {
			cols.push({
				field: j.toString(),
				width: 200
			});
		}

		cols[0].fixed = true;
		cols[1].fixed = true;

		this.columns = cols;

		this.localService.getData();
		for (let i = 0; i < 100000; i++) {
			var obj = {};
			for (var j = 0; j < cols.length; j++) {
				var col = cols[j].field;
				obj[col] = 10 * i * j;
			}
			this.localData.push(obj);
		}
	}

	public ngAfterViewInit() {
	}

	toggleFirstLeft() {
		var col = this.grid1.getColumnByName("0");
		if (col.pinnedToLeft) {
			this.grid1.unpinColumn("0");
		} else {
			this.grid1.pinToLeft("0");
		}
	}

	toggleSecondLeft() {
		var col = this.grid1.getColumnByName("1");
		if (col.pinnedToLeft) {
			this.grid1.unpinColumn("1");
		} else {
			this.grid1.pinToLeft("1");
		}
	}

	toggleFirstRight() {
		var col = this.grid1.getColumnByName("0");
		if (col.pinnedToRight) {
			this.grid1.unpinColumn("0");
		} else {
			this.grid1.pinToRight("0");
		}
	}

	toggleSecondRight() {
		var col = this.grid1.getColumnByName("1");
		if (col.pinnedToRight) {
			this.grid1.unpinColumn("1");
		} else {
			this.grid1.pinToRight("1");
		}
	}

}
