import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    DestroyRef,
    OnInit,
    ChangeDetectorRef,
    ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IGX_GRID_DIRECTIVES,
    IgxGridComponent,
    IgSizeDirective,
    ColumnPinningPosition,
    RowPinningPosition,
    IPinningConfig, IGX_ACTION_STRIP_DIRECTIVES, IGX_GRID_ACTION_STRIP_DIRECTIVES
} from 'igniteui-angular';
import {
    Properties,
    PropertyChangeService,
    PropertyPanelConfig,
} from '../properties-panel/property-change.service';
import { DATA } from './data';

@Component({
    selector: 'app-showcase-grid-sample',
    styleUrls: ['../app.component.scss', './showcase-grid-sample.component.scss'],
    templateUrl: 'showcase-grid-sample.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IGX_GRID_DIRECTIVES,
        FormsModule,
        IgSizeDirective,
        IGX_ACTION_STRIP_DIRECTIVES,
        IGX_GRID_ACTION_STRIP_DIRECTIVES,
    ]
})
export class ShowcaseGridSampleComponent {
    @ViewChild('grid', { static: true })
    public grid: IgxGridComponent;

    public data: any[] = DATA;

    public panelConfig: PropertyPanelConfig = {
        size: {
            control: {
                type: 'button-group',
                options: ['small', 'medium', 'large'],
                defaultValue: 'large'
            }
        },
        rowSelection: {
            control: {
                type: 'select',
                options: ['none', 'single', 'multiple'],
                defaultValue: 'none'
            }
        },
        columnSelection: {
            control: {
                type: 'select',
                options: ['none', 'single', 'multiple'],
                defaultValue: 'none'
            }
        },
        allowFiltering: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        filterMode: {
            control: {
                type: 'select',
                options: ['quickFilter', 'excelStyleFilter'],
                defaultValue: 'quickFilter'
            }
        },
        sorting: {
            label: 'Allow Sorting',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        grouping: {
            label: 'Allow Grouping',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        moving: {
            label: 'Column Moving',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        resizing: {
            label: 'Column Resizing',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        columnPinning: {
            label: 'Column Pinning',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        rowPinning: {
            label: 'Row Pinning',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        paging: {
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        toolbar: {
            label: 'Show Toolbar',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        actionStrip: {
            label: 'Grid Actions',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        hideID: {
             label: 'Hide ID Column',
             control: {
                 type: 'boolean',
                 defaultValue: false
             }
        },
        summaries: {
            label: 'Enable Summaries',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        masterDetail: {
            label: 'Master Detail',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        mrl: {
            label: 'Multi-Row Layout',
            control: {
                type: 'boolean',
                defaultValue: false
            }
        },
        cellSelection: {
            control: {
                type: 'select',
                options: ['none', 'single', 'multiple'],
                defaultValue: 'none'
            }
        }
    };

    public properties: Properties = {} as any;

    public get pinningConfig(): IPinningConfig {
        return {
            rows: this.properties.rowPinning ? RowPinningPosition.Top : RowPinningPosition.Bottom,
            columns: ColumnPinningPosition.Start
        };
    }

    constructor(
        private propertyChangeService: PropertyChangeService,
        private destroyRef: DestroyRef,
        private cdr: ChangeDetectorRef
    ) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        const propertyChange =
            this.propertyChangeService.propertyChanges.subscribe(
                (properties) => {
                    this.properties = properties;
                    this.cdr.detectChanges();
                    if (this.grid) {
                        this.grid.markForCheck();
                    }
                }
            );

        this.destroyRef.onDestroy(() => propertyChange.unsubscribe());
    }
}
