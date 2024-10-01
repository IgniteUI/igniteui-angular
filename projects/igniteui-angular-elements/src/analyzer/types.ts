import * as ts from 'typescript';

export type MethodInfo = { name: string };
export type PropertyInfo = { name: string, writable?: boolean };

export type ContentQuery = {
    property: string,
    childType: ts.InterfaceType,
    isQueryList: boolean,
    descendants: boolean,
}

export type ComponentMetadata<T = ts.InterfaceType> = {
    selector: string;
    parents: T[],
    contentQueries: ContentQuery[],
    methods: MethodInfo[],
    additionalProperties: PropertyInfo[];
    templateProperties?: string[],
    booleanProperties?: string[],
    numericProperties?: string[],
    provideAs?: ts.Type,
}
