import {
    Component,
    OnInit,
    ViewChild,
    HostBinding,
    inject,
    signal,
} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IgxNavigationDrawerComponent, IgxIconService, IgxRippleDirective, IGX_NAVIGATION_DRAWER_DIRECTIVES } from 'igniteui-angular';
import { DocumentDirection, PageHeaderComponent } from './pageHeading/pageHeading.component';
import { IgxIconComponent } from '../../projects/igniteui-angular/src/lib/icon/icon.component';
import { CommonModule } from '@angular/common';
import { PropertiesPanelComponent } from './properties-panel/properties-panel.component';
import { PropertyChangeService } from './properties-panel/property-change.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
        IgxNavigationDrawerComponent,
        IGX_NAVIGATION_DRAWER_DIRECTIVES,
        CommonModule,
        RouterLinkActive,
        RouterLink,
        IgxIconComponent,
        PageHeaderComponent,
        RouterOutlet,
        IgxRippleDirective,
        PropertiesPanelComponent
    ]
})
export class AppComponent implements OnInit {
    @HostBinding('attr.id')
    public appId = 'igniteui-demo-app';

    @ViewChild('navdrawer', { read: IgxNavigationDrawerComponent, static: true })
    public navdrawer: IgxNavigationDrawerComponent;

    public dirMode = signal<'ltr' | 'rtl'>('ltr');

    // This method will be triggered by PageHeaderComponent's toggleDirection event
    public onDirectionToggle(dir: DocumentDirection): void {
        this.dirMode.set(dir);
    }

    protected propertyChangeService = inject(PropertyChangeService);

    public urlString: string;

    public drawerState = {
        enableGestures: true,
        open: true,
        pin: false,
        pinThreshold: 768,
        position: 'left',
        width: '300px',
        miniWidth: '80px',
        miniVariant: false
    };

    public componentLinks = [
        {
            link: '/accordion',
            icon: 'horizontal_split',
            name: 'Accordion'
        },
        {
            link: '/action-strip',
            icon: 'view_list',
            name: 'Action Strip'
        },
        {
            link: '/autocomplete',
            icon: 'view_list',
            name: 'Autocomplete'
        },
        {
            link: '/avatar',
            icon: 'account_circle',
            name: 'Avatar'
        },
        {
            link: '/badge',
            icon: 'error',
            name: 'Badge'
        },
        {
            link: '/banner',
            icon: 'keyboard_arrow_down',
            name: 'Banner'
        },
        {
            link: '/bottom-navigation',
            icon: 'tab',
            name: 'Bottom Navigation'
        },
        {
            link: '/bottom-navigation-routing',
            icon: 'tab',
            name: 'Bottom Navigation Routing'
        },
        {
            link: '/buttonGroup',
            icon: 'group_work',
            name: 'Button Group'
        },
        {
            link: '/calendar',
            icon: 'event',
            name: 'Calendar'
        },
        {
            link: '/calendar-views',
            icon: 'event',
            name: 'Calendar Views'
        },
        {
            link: '/card',
            icon: 'home',
            name: 'Card'
        },
        {
            link: '/carousel',
            icon: 'view_carousel',
            name: 'Carousel'
        },
        {
            link: '/chip',
            icon: 'android',
            name: 'Chips'
        },
        {
            link: '/circular-progress',
            icon: 'poll',
            name: 'Progress (Circular)'
        },
        {
            link: '/combo',
            icon: 'arrow_drop_down_circle',
            name: 'Combo'
        },
        {
            link: '/combo-showcase',
            icon: 'arrow_drop_down_circle',
            name: 'Combo (showcase)'
        },
        {
            link: '/datePicker',
            icon: 'date_range',
            name: 'DatePicker'
        },
		{
			link: '/divider',
			icon: 'safety_divider',
			name: 'Divider'
		},
        {
            link: '/dialog',
            icon: 'all_out',
            name: 'Dialog'
        },
        {
            link: '/drag-drop',
            icon: 'view_column',
            name: 'Drag and Drop'
        },
        {
            link: '/hound',
            icon: 'horizontal_split',
            name: 'Hound sample'
        },
        {
            link: '/dropDown',
            icon: 'view_list',
            name: 'DropDown'
        },
        {
            link: '/virtual-dropdown',
            icon: 'horizontal_split',
            name: 'DropDown - Virtual'
        },
        {
            link: '/expansionPanel',
            icon: 'expand_more',
            name: 'ExpansionPanel'
        },
        {
            link: '/inputs',
            icon: 'web',
            name: 'Forms'
        },
        {
            link: '/grid',
            icon: 'view_column',
            name: 'Grid'
        },
        {
            link: '/gridAddRow',
            icon: 'view_column',
            name: 'Grid Add Row'
        }, {
            link: '/gridMasterDetail',
            icon: 'view_column',
            name: 'Grid Master Detail'
        },
        {
            link: '/gridCellEditing',
            icon: 'view_column',
            name: 'Grid Cell Editing'
        },
        {
            link: '/gridClipboard',
            icon: 'insert_comment',
            name: 'Grid Clipboard Interaction'
        },
        {
            link: '/gridColumnGroups',
            icon: 'view_column',
            name: 'Grid Column Groups'
        },
        {
            link: '/gridMRL',
            icon: 'view_column',
            name: 'Grid MRL'
        },
        {
            link: '/gridMRLConfig',
            icon: 'view_column',
            name: 'Grid MRL Config'
        },
        {
            link: '/gridMRLCustomNav',
            icon: 'view_column',
            name: 'Grid MRL Custom Navigation'
        },
        {
            link: '/gridFilterTemplate',
            icon: 'view_column',
            name: 'Grid Filter Template'
        },
        {
            link: '/gridEsfLoadOnDemand',
            icon: 'view_column',
            name: 'Grid ESF Load On Demand'
        },
        {
            link: '/gridColumnMoving',
            icon: 'view_column',
            name: 'Grid Column Moving'
        },
        {
            link: '/gridColumnTypes',
            icon: 'view_column',
            name: 'Grid Column Types'
        },
        {
            link: '/gridColumnSelecting',
            icon: 'view_column',
            name: 'Grid Column Selection'
        },
        {
            link: '/gridColumnPinning',
            icon: 'view_column',
            name: 'Grid Column Pinning'
        },
        {
            link: '/gridColumnActions',
            icon: 'view_column',
            name: 'Grid Column Actions'
        },
        {
            link: '/gridRowPinning',
            icon: 'view_column',
            name: 'Grid Row Pinning'
        },
        {
            link: '/gridRowAPI',
            icon: 'view_column',
            name: 'Grid Row API'
        },
        {
            link: '/gridCellAPI',
            icon: 'view_column',
            name: 'Grid Cell API'
        },
        {
            link: '/gridColumnResizing',
            icon: 'view_column',
            name: 'Grid Column Resizing'
        },
        {
            link: '/gridConditionalCellStyling',
            icon: 'view_column',
            name: 'Grid Cell Styling'
        },
        {
            link: '/gridGroupBy',
            icon: 'view_column',
            name: 'Grid GroupBy'
        },
        {
            link: '/gridPercentage',
            icon: 'view_column',
            name: 'Grid Percentage'
        },
        {
            link: '/gridAutoSize',
            icon: 'view_column',
            name: 'Grid Auto Size'
        },
        {
            link: '/gridDockManager',
            icon: 'view_column',
            name: 'Grid in DockManager'
        },
        {
            link: '/gridFlex',
            icon: 'view_column',
            name: 'Grid Flex'
        },
        {
            link: '/gridPerformance',
            icon: 'view_column',
            name: 'Grid Performance'
        },
        {
            link: '/gridFormatting',
            icon: 'view_column',
            name: 'Grid Formatting'
        },
        {
            link: '/gridEvents',
            icon: 'view_column',
            name: 'Grid Events'
        },
        {
            link: '/gridFinJS',
            icon: 'view_column',
            name: 'Grid FinJS'
        },
        {
            link: '/gridUpdates',
            icon: 'view_column',
            name: 'Grid Nested Props Update'
        },
        {
            link: '/gridRemoteVirtualization',
            icon: 'view_column',
            name: 'Grid Remote Virtualization'
        },
        {
            link: '/gridScrollVirtualization',
            icon: 'view_column',
            name: 'Grid Remote Virtualization with Scroll'
        },
        {
            link: '/gridRemotePaging',
            icon: 'view_column',
            name: 'Grid Remote Paging'
        },
        {
            link: '/gridRowEdit',
            icon: 'view_column',
            name: 'Grid Row Editing'
        },
        {
            link: '/gridValidation',
            icon: 'view_column',
            name: 'Grid Validation'
        },
        {
            link: '/gridLocalization',
            icon: 'view_column',
            name: 'Grid Localization'
        },
        {
            link: '/gridSelection',
            icon: 'view_column',
            name: 'Grid Selection'
        },
        {
            link: '/gridRowDrag',
            icon: 'view_column',
            name: 'Grid Row Drag'
        },
        {
            link: '/gridRowReorder',
            icon: 'view_column',
            name: 'Grid Row Reorder'
        },
        {
            link: '/gridSummary',
            icon: 'view_column',
            name: 'Grid Summary'
        },
        {
            link: '/gridToolbar',
            icon: 'view_column',
            name: 'Grid Toolbar'
        },
        {
            link: '/gridReCreate',
            icon: 'view_column',
            name: 'Grid ReCreate'
        },
        {
            link: '/gridToolbarCustom',
            icon: 'view_column',
            name: 'Grid Toolbar Custom Content'
        },
        {
            link: '/gridExport',
            icon: 'view_column',
            name: 'Grid Export'
        },
        {
            link: '/gridSearch',
            icon: 'view_column',
            name: 'Grid Search'
        },
        {
            link: '/gridFiltering',
            icon: 'view_column',
            name: 'Grid Filtering'
        },
        {
            link: '/gridExternalFiltering',
            icon: 'view_column',
            name: 'Grid External Filtering'
        },
        {
            link: '/gridState',
            icon: 'view_column',
            name: 'Grid State Persistence'
        },
        {
            link: '/icon',
            icon: 'android',
            name: 'Icon'
        },
        {
            link: '/icon-button',
            icon: 'favorite',
            name: 'Icon Button'
        },
        {
            link: '/input-controls',
            icon: 'check_box',
            name: 'Input Controls'
        },
        {
            link: '/linear-progress',
            icon: 'poll',
            name: 'Progress (Linear)'
        },
        {
            link: '/list',
            icon: 'list',
            name: 'List'
        },
        {
            link: '/listPanning',
            icon: 'list',
            name: 'List Panning'
        },
        {
            link: '/listPerformance',
            icon: 'list',
            name: 'List Performance'
        },
        {
            link: '/monthPicker',
            icon: 'event',
            name: 'Month Picker',
        },
        {
            link: '/navbar',
            icon: 'arrow_back',
            name: 'Navbar'
        },
        {
            link: '/navdrawer',
            icon: 'menu',
            name: 'Navdrawer'
        },
        {
            link: '/overlay',
            icon: 'flip_to_front',
            name: 'Overlay'
        },
        {
            link: '/overlay-presets',
            icon: 'flip_to_front',
            name: 'Overlay Settings Presets'
        },

        {
            link: '/overlay-animation',
            icon: 'flip_to_front',
            name: 'Overlay Animation'
        },
        {
            link: '/pagination',
            icon: 'menu',
            name: 'Paginator'
        },
        {
            link: '/radio',
            icon: 'radio_button_checked',
            name: 'Radio Group'
        },
        {
            link: '/rating',
            icon: 'star',
            name: 'Rating'
        },
        {
            link: '/reactive',
            icon: 'web',
            name: 'Reactive Form'
        },
        {
            link: '/slider',
            icon: 'tab',
            name: 'Slider'
        },
        {
            link: '/range-slider',
            icon: 'open_in_full',
            name: 'Slider (Range)'
        },
        {
            link: '/slider-showcase',
            icon: 'tune',
            name: 'Slider (showcase)'
        },
        {
            link: '/splitter',
            icon: 'linear_scale',
            name: 'Splitter'
        },
        {
            link: '/snackbar',
            icon: 'feedback',
            name: 'Snackbar'
        },
        {
            link: '/stepper',
            icon: 'format_list_bulleted',
            name: 'Stepper'
        },
        {
            link: '/tabs',
            icon: 'tab',
            name: 'Tabs'
        },
        {
            link: '/tabs-routing',
            icon: 'tab',
            name: 'Tabs Routing'
        },
        {
            link: '/timePicker',
            icon: 'date_range',
            name: 'TimePicker'
        },
        {
            link: '/toast',
            icon: 'notifications',
            name: 'Toast'
        },
        {
            link: '/hierarchicalGrid',
            icon: 'view_column',
            name: 'Hierarchical Grid'
        }, {
            link: '/hierarchicalGridRemote',
            icon: 'swap_vert',
            name: 'Hierarchical Grid Remote Load on Demand'
        }, {
            link: '/hierarchicalGridRemoteVirtualization',
            icon: 'swap_vert',
            name: 'Hierarchical Grid Remote Virtualization'
        }, {
            link: '/hierarchicalGridUpdating',
            icon: 'edit',
            name: 'Hierarchical Grid Updating'
        },
        {
            link: '/hierarchicalGridAddRow',
            icon: 'view_column',
            name: 'HierarchicalGrid Add Row'
        },
        {
            link: '/tree',
            icon: 'account_tree',
            name: 'Tree'
        },
        {
            link: '/tree-showcase',
            icon: 'account_tree',
            name: 'Tree (showcase)'
        },
        {
            link: '/treeGrid',
            icon: 'view_column',
            name: 'Tree Grid'
        },
        {
            link: '/treeGridFlatData',
            icon: 'view_column',
            name: 'Tree Grid Flat Data'
        },
        {
            link: '/treeGridGroupBy',
            icon: 'view_column',
            name: 'Tree Grid GroupBy'
        },
        {
            link: '/treeGridLoadOnDemand',
            icon: 'view_column',
            name: 'Tree Grid Load On Demand'
        },
        {
            link: '/treeGridAddRow',
            icon: 'view_column',
            name: 'TreeGrid Add Row'
        },
        {
            link: '/dateRange',
            icon: 'date_range',
            name: 'DateRange'
        },
        {
            link: '/grid-nested-props',
            icon: 'view_column',
            name: 'Grid nested properties data source'
        },
        {
            link: '/pivot',
            icon: 'view_column',
            name: 'Pivot Grid'
        },
        {
            link: '/pivot-hierarchy',
            icon: 'view_column',
            name: 'Pivot Grid Hierarchy'
        },
        {
            link: '/pivot-noop',
            icon: 'view_column',
            name: 'Noop Pivot Grid'
        },
        {
            link: '/query-builder',
            icon: 'view_column',
            name: 'Query Builder'
        },
        {
            link: '/pivot-state',
            icon: 'view_column',
            name: 'Pivot Grid State Persistance'

        }
    ].sort((componentLink1, componentLink2) => componentLink1.name > componentLink2.name ? 1 : -1);

    public directiveLinks = [
        {
            link: '/buttons',
            icon: 'radio_button_unchecked',
            name: 'Buttons'
        },
        {
            link: '/input-group',
            icon: 'web',
            name: 'Input Group'
        },
        {
            link: '/layout',
            icon: 'view_quilt',
            name: 'Layout'
        },
        {
            link: '/mask',
            icon: 'view_column',
            name: 'Mask Directive'
        },
        {
            link: '/date-time-editor',
            icon: 'view_column',
            name: 'DateTime Editor'
        },
        {
            link: '/ripple',
            icon: 'wifi_tethering',
            name: 'Ripple'
        },
        {
            link: '/tooltip',
            icon: 'info',
            name: 'Tooltip'
        },
        {
            link: '/virtualForDirective',
            icon: 'view_column',
            name: 'Virtual-For Directive'
        },
        {
            link: '/labelDirective',
            icon: 'label',
            name: 'Label Directive'
        }
    ].sort((componentLink1, componentLink2) => componentLink1.name > componentLink2.name ? 1 : -1);

    public styleLinks = [
        {
            link: '/animations',
            icon: 'color_lens',
            name: 'Animations'
        },
        {
            link: '/colors',
            icon: 'color_lens',
            name: 'Colors'
        },
        {
            link: '/shadows',
            icon: 'layers',
            name: 'Shadows'
        },
        {
            link: '/typography',
            icon: 'font_download',
            name: 'Typography'
        }
    ].sort((componentLink1, componentLink2) => componentLink1.name > componentLink2.name ? 1 : -1);

    constructor(private router: Router, private iconService: IgxIconService) {
        iconService.setFamily('fa-solid', { className: 'fa', type: 'font', prefix: 'fa-'});
        iconService.setFamily('fa-brands', { className: 'fab', type: 'font' });

        router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
            for (const component of this.componentLinks) {
                if (component.link === router.url) {
                    this.urlString = component.name;
                }
            }
        });
    }

    public ngOnInit() {
        this.router.events.pipe(
            filter(x => x instanceof NavigationStart)
        )
            .subscribe((event: NavigationStart) => {
                if (event.url !== '/' && !this.navdrawer.pin) {
                    this.navdrawer.close();
                }
            });

        // register custom SVG icons
        this.iconService.addSvgIcon('rain', '../assets/images/card/icons/rain.svg', 'material');
        this.iconService.addSvgIcon('fa-breeze', '../assets/images/card/icons/breeze.svg', 'fa-solid');
        this.iconService.addSvgIcon('rain', '../assets/images/card/icons/rain.svg', 'weather-icons');
        this.iconService.addSvgIcon('breeze', '../assets/images/card/icons/breeze.svg', 'weather-icons');
    }
}
