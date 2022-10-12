import { AbstractType, Type } from '@angular/core';

export interface ContentQueryMeta {
    property: string;
    childType: Type<any>;
    isQueryList: boolean;
    descendants?: boolean;
}
export interface ComponentConfig {
    component: Type<any>,
    selector?: string;
    parents: Type<any>[],
    contentQueries: ContentQueryMeta[];
    methods: string[];
    templateProps?: string[];
    provideAs?: Type<any> | AbstractType<any>;
}
