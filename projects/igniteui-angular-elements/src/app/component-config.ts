import { Type } from '@angular/core';

export interface ComponentConfig {
    component: Type<any>,
    selector?: string;
    parents: Type<any>[],
    contentQueries: {
        property: string;
        childType: Type<any>;
        isQueryList: boolean;
    }[];
    methods: string[];
    templateProps?: string[];
}
