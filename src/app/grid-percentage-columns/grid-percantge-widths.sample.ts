import { Component, OnInit, ViewChild } from '@angular/core';
import { IgxGridComponent, IgxStringFilteringOperand } from 'igniteui-angular';
 @Component({
    providers: [],
    selector: 'ap-grid-percantge-widths.sample',
    templateUrl: 'grid-percantge-widths.sample.html'
})
 export class GridColumnPercentageWidthsSampleComponent implements OnInit {
     public data: Array<any>;
     public data1: Array<any>;

     @ViewChild("grid1", { read: IgxGridComponent })
     public grid1: IgxGridComponent;

     public ngOnInit(): void {
       this.data1 = [{
        ProductID: 1,
        ProductName: "Chai",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "10 boxes x 20 bags",
        UnitPrice: 18.0000,
        UnitsInStock: 39,
        UnitsOnOrder: 0,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2012-02-12")
      }, {
        ProductID: 2,
        ProductName: "Chang",
        SupplierID: 1,
        CategoryID: 1,
        QuantityPerUnit: "24 - 12 oz bottles",
        UnitPrice: 19.0000,
        UnitsInStock: 17,
        UnitsOnOrder: 40,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2003-03-17")
      }, {
        ProductID: 3,
        ProductName: "Aniseed Syrup",
        SupplierID: 1,
        CategoryID: 2,
        QuantityPerUnit: "12 - 550 ml bottles",
        UnitPrice: 10.0000,
        UnitsInStock: 13,
        UnitsOnOrder: 70,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2006-03-17")
      }, {
        ProductID: 4,
        ProductName: "Chef Antons Cajun Seasoning",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "48 - 6 oz jars",
        UnitPrice: 22.0000,
        UnitsInStock: 53,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2016-03-17")
      }, {
        ProductID: 5,
        ProductName: "Chef Antons Gumbo Mix",
        SupplierID: 2,
        CategoryID: 2,
        QuantityPerUnit: "36 boxes",
        UnitPrice: 21.3500,
        UnitsInStock: 0,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2011-11-11")
      }, {
        ProductID: 6,
        ProductName: "Grandmas Boysenberry Spread",
        SupplierID: 3,
        CategoryID: 2,
        QuantityPerUnit: "12 - 8 oz jars",
        UnitPrice: 25.0000,
        UnitsInStock: 0,
        UnitsOnOrder: 0,
        ReorderLevel: 25,
        Discontinued: false,
        OrderDate: new Date("2017-12-17")
      }, {
        ProductID: 7,
        ProductName: "Uncle Bobs Organic Dried Pears",
        SupplierID: 3,
        CategoryID: 7,
        QuantityPerUnit: "12 - 1 lb pkgs.",
        UnitPrice: 30.0000,
        UnitsInStock: 150,
        UnitsOnOrder: 0,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2016-07-17")
      }, {
        ProductID: 8,
        ProductName: "Northwoods Cranberry Sauce",
        SupplierID: 3,
        CategoryID: 2,
        QuantityPerUnit: "12 - 12 oz jars",
        UnitPrice: 40.0000,
        UnitsInStock: 6,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2018-01-17")
      }, {
        ProductID: 9,
        ProductName: "Mishi Kobe Niku",
        SupplierID: 4,
        CategoryID: 6,
        QuantityPerUnit: "18 - 500 g pkgs.",
        UnitPrice: 97.0000,
        UnitsInStock: 29,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2010-02-17")
      }, {
        ProductID: 10,
        ProductName: "Ikura",
        SupplierID: 4,
        CategoryID: 8,
        QuantityPerUnit: "12 - 200 ml jars",
        UnitPrice: 31.0000,
        UnitsInStock: 31,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2008-05-17")
      }, {
        ProductID: 11,
        ProductName: "Queso Cabrales",
        SupplierID: 5,
        CategoryID: 4,
        QuantityPerUnit: "1 kg pkg.",
        UnitPrice: 21.0000,
        UnitsInStock: 22,
        UnitsOnOrder: 30,
        ReorderLevel: 30,
        Discontinued: false,
        OrderDate: new Date("2009-01-17")
      }, {
        ProductID: 12,
        ProductName: "Queso Manchego La Pastora",
        SupplierID: 5,
        CategoryID: 4,
        QuantityPerUnit: "10 - 500 g pkgs.",
        UnitPrice: 38.0000,
        UnitsInStock: 86,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2015-11-17")
      }, {
        ProductID: 13,
        ProductName: "Konbu",
        SupplierID: 6,
        CategoryID: 8,
        QuantityPerUnit: "2 kg box",
        UnitPrice: 6.0000,
        UnitsInStock: 24,
        UnitsOnOrder: 0,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2015-03-17")
      }, {
        ProductID: 14,
        ProductName: "Tofu",
        SupplierID: 6,
        CategoryID: 7,
        QuantityPerUnit: "40 - 100 g pkgs.",
        UnitPrice: 23.2500,
        UnitsInStock: 35,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2017-06-17")
      }, {
        ProductID: 15,
        ProductName: "Genen Shouyu",
        SupplierID: 6,
        CategoryID: 2,
        QuantityPerUnit: "24 - 250 ml bottles",
        UnitPrice: 15.5000,
        UnitsInStock: 39,
        UnitsOnOrder: 0,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2014-03-17")
      }, {
        ProductID: 16,
        ProductName: "Pavlova",
        SupplierID: 7,
        CategoryID: 3,
        QuantityPerUnit: "32 - 500 g boxes",
        UnitPrice: 17.4500,
        UnitsInStock: 29,
        UnitsOnOrder: 0,
        ReorderLevel: 10,
        Discontinued: false,
        OrderDate: new Date("2018-03-28")
      }, {
        ProductID: 17,
        ProductName: "Alice Mutton",
        SupplierID: 7,
        CategoryID: 6,
        QuantityPerUnit: "20 - 1 kg tins",
        UnitPrice: 39.0000,
        UnitsInStock: 0,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: true,
        OrderDate: new Date("2015-08-17")
      }, {
        ProductID: 18,
        ProductName: "Carnarvon Tigers",
        SupplierID: 7,
        CategoryID: 8,
        QuantityPerUnit: "16 kg pkg.",
        UnitPrice: 62.5000,
        UnitsInStock: 42,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2005-09-27")
      }, {
        ProductID: 19,
        ProductName: "Teatime Chocolate Biscuits",
        SupplierID: 8,
        CategoryID: 3,
        QuantityPerUnit: "",
        UnitPrice: 9.2000,
        UnitsInStock: 25,
        UnitsOnOrder: 0,
        ReorderLevel: 5,
        Discontinued: false,
        OrderDate: new Date("2001-03-17")
      }, {
        ProductID: 20,
        ProductName: "Sir Rodneys Marmalade",
        SupplierID: 8,
        CategoryID: 3,
        QuantityPerUnit: undefined,
        UnitPrice: undefined,
        UnitsInStock: 40,
        UnitsOnOrder: 0,
        ReorderLevel: 0,
        Discontinued: false,
        OrderDate: new Date("2005-03-17")
      }];

      this.data = [{
            ProductID: 1,
            ProductName: "Chai",
            QuantityPerUnit: "10 boxes x 20 bags",
            UnitPrice: 18.0000,
            UnitsInStock: 39,
            ReorderLevel: 10,
            Discontinued: false,
            OrderDate: new Date("2012-02-12")
          }, {
            ProductID: 2,
            ProductName: "Chang",
            QuantityPerUnit: "24 - 12 oz bottles",
            UnitPrice: 19.0000,
            UnitsInStock: 17,
            ReorderLevel: 25,
            Discontinued: false,
            OrderDate: new Date("2003-03-17")
          }, {
            ProductID: 3,
            ProductName: "Aniseed Syrup",
            QuantityPerUnit: "12 - 550 ml bottles",
            UnitPrice: 10.0000,
            UnitsInStock: 13,
            ReorderLevel: 25,
            Discontinued: false,
            OrderDate: new Date("2006-03-17")
          }, {
            ProductID: 4,
            ProductName: "Chef Antons Cajun Seasoning",
            QuantityPerUnit: "48 - 6 oz jars",
            UnitPrice: 22.0000,
            UnitsInStock: 53,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2016-03-17")
          }, {
            ProductID: 5,
            ProductName: "Chef Antons Gumbo Mix",
            QuantityPerUnit: "36 boxes",
            UnitPrice: 21.3500,
            UnitsInStock: 0,
            ReorderLevel: 0,
            Discontinued: true,
            OrderDate: new Date("2011-11-11")
          }, {
            ProductID: 6,
            ProductName: "Grandmas Boysenberry Spread",
            QuantityPerUnit: "12 - 8 oz jars",
            UnitPrice: 25.0000,
            UnitsInStock: 0,
            ReorderLevel: 25,
            Discontinued: false,
            OrderDate: new Date("2017-12-17")
          }, {
            ProductID: 7,
            ProductName: "Uncle Bobs Organic Dried Pears",
            QuantityPerUnit: "12 - 1 lb pkgs.",
            UnitPrice: 30.0000,
            UnitsInStock: 150,
            ReorderLevel: 10,
            Discontinued: false,
            OrderDate: new Date("2016-07-17")
          }, {
            ProductID: 8,
            ProductName: "Northwoods Cranberry Sauce",
            QuantityPerUnit: "12 - 12 oz jars",
            UnitPrice: 40.0000,
            UnitsInStock: 6,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2018-01-17")
          }, {
            ProductID: 9,
            ProductName: "Mishi Kobe Niku",
            QuantityPerUnit: "18 - 500 g pkgs.",
            UnitPrice: 97.0000,
            UnitsInStock: 29,
            ReorderLevel: 0,
            Discontinued: true,
            OrderDate: new Date("2010-02-17")
          }, {
            ProductID: 10,
            ProductName: "Ikura",
            QuantityPerUnit: "12 - 200 ml jars",
            UnitPrice: 31.0000,
            UnitsInStock: 31,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2008-05-17")
          }, {
            ProductID: 11,
            ProductName: "Queso Cabrales",
            QuantityPerUnit: "1 kg pkg.",
            UnitPrice: 21.0000,
            UnitsInStock: 22,
            ReorderLevel: 30,
            Discontinued: false,
            OrderDate: new Date("2009-01-17")
          }, {
            ProductID: 12,
            ProductName: "Queso Manchego La Pastora",
            QuantityPerUnit: "10 - 500 g pkgs.",
            UnitPrice: 38.0000,
            UnitsInStock: 86,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2015-11-17")
          }, {
            ProductID: 13,
            ProductName: "Konbu",
            QuantityPerUnit: "2 kg box",
            UnitPrice: 6.0000,
            UnitsInStock: 24,
            ReorderLevel: 5,
            Discontinued: false,
            OrderDate: new Date("2015-03-17")
          }, {
            ProductID: 14,
            ProductName: "Tofu",
            QuantityPerUnit: "40 - 100 g pkgs.",
            UnitPrice: 23.2500,
            UnitsInStock: 35,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2017-06-17")
          }, {
            ProductID: 15,
            ProductName: "Genen Shouyu",
            QuantityPerUnit: "24 - 250 ml bottles",
            UnitPrice: 15.5000,
            UnitsInStock: 39,
            ReorderLevel: 5,
            Discontinued: false,
            OrderDate: new Date("2014-03-17")
          }, {
            ProductID: 16,
            ProductName: "Pavlova",
            QuantityPerUnit: "32 - 500 g boxes",
            UnitPrice: 17.4500,
            UnitsInStock: 29,
            ReorderLevel: 10,
            Discontinued: false,
            OrderDate: new Date("2018-03-28")
          }, {
            ProductID: 17,
            ProductName: "Alice Mutton",
            QuantityPerUnit: "20 - 1 kg tins",
            UnitPrice: 39.0000,
            UnitsInStock: 0,
            ReorderLevel: 0,
            Discontinued: true,
            OrderDate: new Date("2015-08-17")
          }, {
            ProductID: 18,
            ProductName: "Carnarvon Tigers",
            QuantityPerUnit: "16 kg pkg.",
            UnitPrice: 62.5000,
            UnitsInStock: 42,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2005-09-27")
          }, {
            ProductID: 19,
            ProductName: "Teatime Chocolate Biscuits",
            QuantityPerUnit: "",
            UnitPrice: 9.2000,
            UnitsInStock: 25,
            ReorderLevel: 5,
            Discontinued: false,
            OrderDate: new Date("2001-03-17")
          }, {
            ProductID: 20,
            ProductName: "Sir Rodneys Marmalade",
            QuantityPerUnit: undefined,
            UnitPrice: undefined,
            UnitsInStock: 40,
            ReorderLevel: 0,
            Discontinued: false,
            OrderDate: new Date("2005-03-17")
          }];
        }


        public formatDate(val: Date) {
          return new Intl.DateTimeFormat("en-US").format(val);
      }

      public formatCurrency(val: string) {
          return parseInt(val, 10).toFixed(2);
      }

      public filter(term) {
        this.grid1.filter("ProductName", term, IgxStringFilteringOperand.instance().condition("contains"));
    }
}
