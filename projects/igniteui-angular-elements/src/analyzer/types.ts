import * as ts from 'typescript';

export type MethodInfo = { name: string }

export type ContentQuery = {
    property: string,
    childType: ts.InterfaceType,
    isQueryList: boolean,
    descendants: boolean,
}

export type ComponentMetadata<T = ts.InterfaceType> = {
    parents: T[],
    contentQueries: ContentQuery[],
    methods: MethodInfo[],
    templateProperties?: string[],
    booleanProperties?: string[],
    numericProperties?: string[],
    provideAs?: ts.Type,
}
