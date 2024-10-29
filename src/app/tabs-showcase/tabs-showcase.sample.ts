import {Component, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation} from '@angular/core';
import { NgFor } from '@angular/common';
import { IgxAvatarComponent, IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxListActionDirective, IgxListComponent, IgxListItemComponent, IgxListLineSubTitleDirective, IgxListLineTitleDirective, IgxListThumbnailDirective, IgxPrefixDirective, IgxRippleDirective, IgxSuffixDirective, IgxTabContentComponent, IgxTabHeaderComponent, IgxTabHeaderIconDirective, IgxTabHeaderLabelDirective, IgxTabItemComponent, IgxTabsComponent } from 'igniteui-angular';
import { defineComponents, IgcTabsComponent, IgcTabComponent, IgcTabPanelComponent } from 'igniteui-webcomponents';
import { PropertyPanelConfig, PropertyChangeService, Properties } from '../properties-panel/property-change.service';

defineComponents(IgcTabsComponent, IgcTabComponent, IgcTabPanelComponent);

@Component({
    selector: 'app-tabs-showcase-sample',
    styleUrls: ['tabs-showcase.sample.scss'],
    templateUrl: 'tabs-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [IgxButtonDirective, IgxTabsComponent, IgxTabItemComponent, IgxTabHeaderComponent, IgxRippleDirective, IgxIconComponent, IgxTabHeaderIconDirective, IgxIconButtonDirective, IgxTabHeaderLabelDirective, IgxTabContentComponent, IgxListComponent, NgFor, IgxListItemComponent, IgxAvatarComponent, IgxListThumbnailDirective, IgxListLineTitleDirective, IgxListLineSubTitleDirective, IgxListActionDirective, IgxPrefixDirective, IgxSuffixDirective]
})
export class TabsShowcaseSampleComponent {
    public panelConfig: PropertyPanelConfig = {
        alignment: {
            control: {
                type: 'select',
                options: ['start', 'end', 'center', 'justify'],
                defaultValue: 'start'
            }
        },
        activation: {
            control: {
                type: 'button-group',
                options: ['manual', 'auto'],
                defaultValue: 'auto'
            }
        }
    }

    public properties: Properties;

    constructor(private propertyChangeService: PropertyChangeService) {
        this.propertyChangeService.setPanelConfig(this.panelConfig);

        this.propertyChangeService.propertyChanges.subscribe(properties => {
            this.properties = properties;
        });
    }

    public contacts: any[] = [{
        avatar: 'assets/images/avatar/1.jpg',
        favorite: true,
        key: '1',
        link: '#',
        phone: '770-504-2217',
        text: 'Terrance Orta'
    }, {
        avatar: 'assets/images/avatar/2.jpg',
        favorite: false,
        key: '2',
        link: '#',
        phone: '423-676-2869',
        text: 'Richard Mahoney'
    }, {
        avatar: 'assets/images/avatar/3.jpg',
        favorite: false,
        key: '3',
        link: '#',
        phone: '859-496-2817',
        text: 'Donna Price'
    }, {
        avatar: 'assets/images/avatar/4.jpg',
        favorite: false,
        key: '4',
        link: '#',
        phone: '901-747-3428',
        text: 'Lisa Landers'
    }];
}

