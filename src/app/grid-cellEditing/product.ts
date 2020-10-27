export class Product {

    get Discontinued() {
        return this.discontinued;
    }
    set Discontinued(val) {
        this.discontinued = val;
    }
    get OrderDate() {
        return this.orderDate;
    }
    set OrderDate(val) {
        this.orderDate = val;
    }
    get ProductID() {
        return this.productID;
    }
    set ProductID(val) {
        this.productID = val;
    }
    get ProductName() {
        return this.productName;
    }
    set ProductName(val) {
        this.productName = val;
    }
    get QuantityPerUnit() {
        return this.quantityPerUnit;
    }
    set QuantityPerUnit(val) {
        this.quantityPerUnit = val;
    }
    get ReorderLevel() {
        return this.reorderLevel;
    }
    set ReorderLevel(val) {
        this.reorderLevel = val;
    }
    get UnitPrice() {
        return this.unitPrice;
    }
    set UnitPrice(val) {
        this.unitPrice = val;
    }
    get UnitsInStock() {
        return this.unitsInStock;
    }
    set UnitsInStock(val) {
        this.unitsInStock = val;
    }
    get Locations(): any[] {
        return this.locations;
    }
    set Locations(val: any[]) {
        this.locations = val;
    }
    private discontinued: boolean;
    private orderDate: Date;
    private productID: number;
    private productName: string;
    private quantityPerUnit: string;
    private reorderLevel: number;
    private unitPrice: number;
    private unitsInStock: number;
    private locations: any[];

    constructor(id: number) {
        this.discontinued = false;
        this.orderDate = new Date();
        this.productID = id;
        this.productName = "";
        this.quantityPerUnit = "";
        this.reorderLevel = 0;
        this.unitPrice = 0;
        this.unitsInStock = 0;
        this.locations = [];
    }
}
