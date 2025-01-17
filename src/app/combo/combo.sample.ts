import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { cloneDeep } from 'lodash-es';
import { take } from 'rxjs/operators';

import { RemoteNWindService } from './remote-nwind.service';
import {
    ButtonGroupAlignment,
    ConnectedPositioningStrategy,
    ElasticPositionStrategy,
    GlobalPositionStrategy,
    HorizontalAlignment,
    IChangeCheckboxEventArgs,
    IComboFilteringOptions,
    IComboSearchInputEventArgs,
    IComboSelectionChangingEventArgs,
    IForOfState,
    ISimpleComboSelectionChangingEventArgs,
    IgxButtonDirective,
    IgxButtonGroupComponent,
    IgxComboAddItemDirective,
    IgxComboComponent,
    IgxComboFooterDirective,
    IgxComboHeaderDirective,
    IgxHintDirective,
    IgxIconComponent,
    IgxLabelDirective,
    IgxRippleDirective,
    IgxSimpleComboComponent,
    IgxSwitchComponent,
    IgxToastComponent,
    OverlaySettings,
    VerticalAlignment,
    IGX_COMBO_DIRECTIVES,
} from 'igniteui-angular';
import { scaleInCenter, scaleOutCenter } from 'igniteui-angular/animations';

@Component({
    selector: 'combo-sample',
    templateUrl: './combo.sample.html',
    styleUrls: ['combo.sample.scss'],
    imports: [
        FormsModule,
        IgxSimpleComboComponent,
        IgxLabelDirective,
        IgxHintDirective,
        IgxComboComponent,
        IgxButtonDirective,
        ReactiveFormsModule,
        IgxToastComponent,
        IgxComboHeaderDirective,
        IgxComboFooterDirective,
        IgxComboAddItemDirective,
        IgxRippleDirective,
        IgxIconComponent,
        IgxSwitchComponent,
        IgxButtonGroupComponent,
        AsyncPipe,
        IGX_COMBO_DIRECTIVES
    ]
})
export class ComboSampleComponent implements OnInit, AfterViewInit {
    @ViewChild('playgroundCombo', { static: true })
    public igxCombo: IgxComboComponent;

    @ViewChild('loadingToast')
    public loadingToast: IgxToastComponent;

    @ViewChild('remoteCombo')
    public remoteCombo: IgxComboComponent;

    @ViewChild('densityCombo')
    public densityCombo: IgxComboComponent;

    @ViewChild('remoteSimpleCombo')
    public remoteSimpleCombo: IgxSimpleComboComponent;

    @ViewChild('playgroundCombo', { read: ElementRef, static: true })
    private comboRef: ElementRef;

    @ViewChild('customItemTemplate', { read: TemplateRef, static: true })
    private customItemTemplate;

    @ViewChild('simpleCombo', { read: IgxSimpleComboComponent, static: true })
    private simpleCombo: IgxSimpleComboComponent;

    @ViewChild('simpleComboOpenOnClear')
    public simpleComboOpenOnClear: IgxSimpleComboComponent;

    public alignment: ButtonGroupAlignment = ButtonGroupAlignment.vertical;
    public toggleItemState = false;
    public disableFilteringFlag = false;
    public customValuesFlag = true;
    public autoFocusSearch = true;
    public items: any[] = [];
    public values1: Array<any> = ['Arizona'];
    public singleValue = 'Arizona';
    public values2: Array<any>;
    public isDisabled = false;

    public rData: any;
    public prevRequest: any;
    public simpleComboPrevRequest: any;
    private searchText = '';
    private defaultVirtState: IForOfState = { chunkSize: 6, startIndex: 0 };
    private currentVirtState: IForOfState = { chunkSize: 6, startIndex: 0 };
    private hasSelection: boolean;
    private additionalScroll = 0;
    private itemID = 1;
    private itemCount = 0;

    public valueKeyVar = 'field';
    public currentDataType = '';

    public genres = [];
    public user: UntypedFormGroup;
    public uniqueFalsyData: any[];
    private overlaySettings: OverlaySettings[] = [null, null, null, null];
    private initialItemTemplate: TemplateRef<any> = null;

    constructor(
        private remoteService: RemoteNWindService,
        public cdr: ChangeDetectorRef,
        fb: UntypedFormBuilder
    ) {
        this.user = fb.group({
            date: [''],
            dateTime: [''],
            email: ['', Validators.required],
            fullName: new UntypedFormControl('', Validators.required),
            genres: ['', Validators.required],
            movie: ['', Validators.required],
            phone: ['']
        });

        this.genres = [
            {
                type: 'Action',
                movies: [
                    'The Matrix',
                    'Kill Bill: Vol.1',
                    'The Dark Knight Rises',
                ],
            },
            {
                type: 'Adventure',
                movies: ['Interstellar', 'Inglourious Basterds', 'Inception'],
            },
            {
                type: 'Comedy',
                movies: [
                    'Wild Tales',
                    'In Bruges',
                    'Three Billboards Outside Ebbing, Missouri',
                    'Untouchable',
                    '3 idiots',
                ],
            },
            {
                type: 'Crime',
                movies: ['Training Day', 'Heat', 'American Gangster'],
            },
            {
                type: 'Drama',
                movies: [
                    'Fight Club',
                    'A Beautiful Mind',
                    'Good Will Hunting',
                    'City of God',
                ],
            },
            { type: 'Biography', movies: ['Amadeus', 'Bohemian Rhapsody'] },
            {
                type: 'Mystery',
                movies: ['The Prestige', 'Memento', 'Cloud Atlas'],
            },
            { type: 'Musical', movies: ['All That Jazz'] },
            {
                type: 'Romance',
                movies: ['Love Actually', 'In The Mood for Love'],
            },
            { type: 'Sci-Fi', movies: ['The Fifth Element'] },
            { type: 'Thriller', movies: ['The Usual Suspects'] },
            { type: 'Western', movies: ['Django Unchained'] },
        ];

        const division = {
            'New England 01': ['Connecticut', 'Maine', 'Massachusetts'],
            'New England 02': ['New Hampshire', 'Rhode Island', 'Vermont'],
            'Mid-Atlantic': ['New Jersey', 'New York', 'Pennsylvania'],
            'East North Central 02': ['Michigan', 'Ohio', 'Wisconsin'],
            'East North Central 01': ['Illinois', 'Indiana'],
            'West North Central 01': [
                'Missouri',
                'Nebraska',
                'North Dakota',
                'South Dakota',
            ],
            'West North Central 02': ['Iowa', 'Kansas', 'Minnesota'],
            'South Atlantic 01': ['Delaware', 'Florida', 'Georgia', 'Maryland'],
            'South Atlantic 02': [
                'North Carolina',
                'South Carolina',
                'Virginia',
            ],
            'South Atlantic 03': ['District of Columbia', 'West Virginia'],
            'East South Central 01': ['Alabama', 'Kentucky'],
            'East South Central 02': ['Mississippi', 'Tennessee'],
            'West South Central': [
                'Arkansas',
                'Louisiana',
                'Oklahome',
                'Texas',
            ],
            Mountain: [
                'Arizona',
                'Colorado',
                'Idaho',
                'Montana',
                'Nevada',
                'New Mexico',
                'Utah',
                'Wyoming',
            ],
            'Pacific 01': ['Alaska', 'California'],
            'Pacific 02': ['Hawaii', 'Oregon', 'Washington'],
        };

        this.uniqueFalsyData = [
            { field: 'null', value: null },
            { field: 'true', value: true },
            { field: 'false', value: false },
            { field: 'empty', value: '' },
            { field: 'undefined', value: undefined },
            { field: 'NaN', value: NaN }
        ];

        const keys = Object.keys(division);
        for (const key of keys) {
            division[key].map((e) => {
                this.items.push({
                    field: e,
                    region: key.substring(0, key.length - 3)
                });
            });
        }
    }

    public handleAddition(evt) {
        console.log(evt);
        evt.addedItem[this.igxCombo.groupKey] = 'MyCustomGroup';
    }

    public toggleItem(itemID) {
        this.toggleItemState = !this.toggleItemState;
        this.igxCombo.setSelectedItem(itemID, this.toggleItemState);
    }

    public ngOnInit() {
        this.igxCombo.opening.subscribe(() => {
            console.log('Opening log!');
        });

        this.igxCombo.opened.subscribe(() => {
            console.log('Opened log!');
        });

        this.igxCombo.opened.pipe(take(1)).subscribe(() => {
            console.log('Attaching');
            if (this.igxCombo.searchInput) {
                this.igxCombo.searchInput.nativeElement.onchange = (e) => {
                    console.log(e);
                };
            }
        });

        this.igxCombo.closing.subscribe(() => {
            console.log('Closing log!');
        });

        this.igxCombo.closed.subscribe(() => {
            console.log('Closed log!');
        });

        this.igxCombo.searchInputUpdate.subscribe((e) => {
            console.log(e);
        });

        this.rData = this.remoteService.remoteData;
    }

    public ngAfterViewInit() {
        this.overlaySettings[0] = cloneDeep(this.igxCombo.overlaySettings);
        this.overlaySettings[1] = {
            target: this.comboRef.nativeElement,
            positionStrategy: new ElasticPositionStrategy({
                verticalDirection: VerticalAlignment.Top,
                verticalStartPoint: VerticalAlignment.Bottom,
                horizontalDirection: HorizontalAlignment.Left,
                horizontalStartPoint: HorizontalAlignment.Right,
            }),
            modal: false,
            closeOnOutsideClick: true
        };
        this.overlaySettings[2] = {
            positionStrategy: new GlobalPositionStrategy({
                openAnimation: scaleInCenter,
                closeAnimation: scaleOutCenter,
            }),
            modal: true,
            closeOnOutsideClick: true
        };
        this.overlaySettings[3] = {
            target: this.comboRef.nativeElement,
            positionStrategy: new ConnectedPositioningStrategy(),
            modal: false,
            closeOnOutsideClick: true
        };
        const initSize = {
            startIndex: 0,
            chunkSize: Math.ceil(250 / this.remoteCombo.itemHeight),
        };
        this.remoteService.getData(initSize, null, (data) => {
            this.remoteCombo.totalItemCount =
                this.remoteSimpleCombo.totalItemCount = data['@odata.count'];
            this.itemCount = this.remoteSimpleCombo.totalItemCount;
        });
    }

    public changeOverlaySettings(index: number) {
        this.igxCombo.overlaySettings = this.overlaySettings[index];
    }

    public changeItemTemplate() {
        const comboTemplate = this.initialItemTemplate
            ? null
            : this.igxCombo.itemTemplate;
        this.igxCombo.itemTemplate = this.initialItemTemplate
            ? this.initialItemTemplate
            : this.customItemTemplate;
        this.initialItemTemplate = comboTemplate;
    }

    public changeFiltering(e: IChangeCheckboxEventArgs) {
        if (e.checked) {
            this.igxCombo.filterFunction = this.customFilterFunction;
            this.simpleCombo.filterFunction = this.customFilterFunction;
        } else {
            this.igxCombo.filterFunction = undefined;
            this.simpleCombo.filterFunction = undefined;
        }
    }

    public changeFilteringKey(e: IChangeCheckboxEventArgs) {
        if (e.checked) {
            this.igxCombo.filteringOptions.filteringKey = 'region';
            this.simpleCombo.filteringOptions.filteringKey = 'region';
        } else {
            this.igxCombo.filteringOptions.filteringKey = undefined;
            this.simpleCombo.filteringOptions.filteringKey = undefined;
        }
    }

    private customFilterFunction = (
        collection: any[],
        filterValue: any,
        filteringOptions: IComboFilteringOptions
    ) => {
        if (!filterValue) {
            return collection;
        }
        const searchTerm = filteringOptions.caseSensitive
            ? filterValue.trim()
            : filterValue.toLowerCase().trim();
        return collection.filter((i) =>
            filteringOptions.caseSensitive
                ? i[filteringOptions.filteringKey]?.includes(searchTerm) ||
                  i[this.igxCombo.groupKey]?.includes(searchTerm)
                : i[filteringOptions.filteringKey]
                      ?.toString()
                      .toLowerCase()
                      .includes(searchTerm) ||
                  i[this.igxCombo.groupKey]
                      ?.toString()
                      .toLowerCase()
                      .includes(searchTerm)
        );
    };

    public dataLoading() {
        if (this.prevRequest) {
            this.prevRequest.unsubscribe();
        }
        this.loadingToast.positionSettings.verticalDirection =
            VerticalAlignment.Middle;
        this.loadingToast.autoHide = false;
        this.loadingToast.open('Loading Remote Data...');
        this.cdr.detectChanges();

        this.prevRequest = this.remoteService.getData(
            this.remoteCombo.virtualizationState,
            this.searchText,
            (data) => {
                this.remoteCombo.totalItemCount = data['@odata.count'];
                this.loadingToast.close();
                this.cdr.detectChanges();
            }
        );
    }

    public searchInput(searchData: IComboSearchInputEventArgs) {
        this.searchText = searchData?.searchText || '';
        this.remoteService.getData(
            this.searchText
                ? this.remoteCombo.virtualizationState
                : this.defaultVirtState,
            this.searchText,
            (data) => {
                this.remoteCombo.totalItemCount = data['@odata.count'];
            }
        );
    }

    public onOpening() {
        this.remoteService.getData(
            this.hasSelection
                ? this.remoteCombo.virtualizationState
                : this.defaultVirtState,
            this.searchText,
            (data) => {
                this.remoteCombo.totalItemCount = data['@odata.count'];
            }
        );
    }

    public onClosing() {
        this.searchText = '';
    }

    public handleSelectionChanging(
        evt:
            | IComboSelectionChangingEventArgs
            | ISimpleComboSelectionChangingEventArgs
    ) {
        if ('added' in evt) {
            this.hasSelection = !!evt?.newSelection.length;
            return;
        }

        if (!evt.newSelection) {
            this.simpleComboOpenOnClear.open();
        }
    }

    public onSimpleComboDataLoading() {
        if (this.simpleComboPrevRequest) {
            this.simpleComboPrevRequest.unsubscribe();
        }
        this.loadingToast.positionSettings.verticalDirection =
            VerticalAlignment.Middle;
        this.loadingToast.autoHide = false;
        this.loadingToast.open('Loading Remote Data...');
        this.cdr.detectChanges();

        this.simpleComboPrevRequest = this.remoteService.getData(
            this.remoteSimpleCombo.virtualizationState,
            this.searchText,
            (data) => {
                this.remoteSimpleCombo.totalItemCount = data['@odata.count'];
                this.loadingToast.close();
                this.cdr.detectChanges();
            }
        );
    }

    public onSimpleComboOpened() {
        const scroll: number =
            this.remoteSimpleCombo.virtualScrollContainer.getScrollForIndex(
                this.itemID - 1
            );
        this.remoteSimpleCombo.virtualScrollContainer.scrollPosition =
            scroll + this.additionalScroll;
        this.cdr.detectChanges();
    }

    public onSimpleComboClosing() {
        this.searchText = '';
    }

    public onSimpleComboClosed() {
        this.currentVirtState.startIndex = (this.itemID || 1) - 1;
        this.remoteService.getData(
            this.currentVirtState,
            this.searchText,
            (data) => {
                this.remoteSimpleCombo.totalItemCount = data['@odata.count'];
                this.cdr.detectChanges();
            }
        );
    }

    public onSimpleComboSelectionChanging(
        evt: ISimpleComboSelectionChangingEventArgs
    ) {
        this.hasSelection = evt.newValue !== undefined;

        if (!this.hasSelection) {
            this.itemID = 1;
            this.currentVirtState = this.defaultVirtState;
            return;
        }

        this.currentVirtState.chunkSize = Math.ceil(
            this.remoteSimpleCombo.itemsMaxHeight /
                this.remoteSimpleCombo.itemHeight
        );

        this.itemCount === evt.newValue
            ? (this.additionalScroll = this.remoteSimpleCombo.itemHeight)
            : (this.additionalScroll = 0);

        if (
            this.itemCount - evt.newValue >=
            this.currentVirtState.chunkSize - 1
        ) {
            this.itemID = this.currentVirtState.startIndex = evt.newValue;
        } else {
            this.itemID = this.currentVirtState.startIndex =
                this.itemCount - (this.currentVirtState.chunkSize - 1);
        }
    }

    public onSimpleComboSearchInputUpdate(
        searchData: IComboSearchInputEventArgs
    ) {
        this.currentVirtState.startIndex = 0;
        this.currentVirtState.chunkSize = Math.ceil(
            this.remoteSimpleCombo.itemsMaxHeight /
                this.remoteSimpleCombo.itemHeight
        );
        this.searchText = searchData?.searchText || '';
        this.remoteService.getData(
            this.searchText ? this.currentVirtState : this.defaultVirtState,
            this.searchText,
            (data) => {
                this.remoteSimpleCombo.totalItemCount = data['@odata.count'];
            }
        );
    }
}
