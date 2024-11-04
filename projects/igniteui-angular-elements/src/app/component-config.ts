import { AbstractType, Type } from '@angular/core';
import { PropertyInfo } from '../analyzer/types';

export interface ContentQueryMeta {
    property: string;
    childType: Type<any> | AbstractType<any>;
    isQueryList?: boolean;
    descendants?: boolean;
}
export interface ComponentConfig {
    component: Type<any>,
    selector: string;
    parents: Type<any>[],
    contentQueries: ContentQueryMeta[];
    additionalProperties: PropertyInfo[];
    methods: string[];
    templateProps?: string[];
    numericProps?: string[];
    boolProps?: string[];
    provideAs?: Type<any> | AbstractType<any>;
}
