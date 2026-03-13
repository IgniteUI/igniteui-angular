export interface IProduct {
    ProductID: number;
    ProductName: string;
    SupplierID: number;
    CategoryID: number;
    QuantityPerUnit: string;
    UnitPrice: number;
    UnitsInStock: number;
    UnitsOnOrder: number;
    ReorderLevel: number;
    Discontinued: boolean;
    OrderDate: Date;
    ProductionDate: Date;
    PackagedAt: Date;
    PercentInStock: number;
}

export interface ITreeData extends IProduct {
    ChildData?: ITreeData[];
}