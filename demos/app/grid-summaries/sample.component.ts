import { Component, OnInit, ViewChild } from "@angular/core";
import { IgxColumnComponent } from "../../lib/grid/column.component";
import { IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from "../../lib/grid/grid-summary";
import { IgxGridComponent } from "../../lib/grid/grid.component";

class MySummary extends IgxNumberSummaryOperand {

  constructor() {
    super();
  }

  operate(data?: any[]): IgxSummaryResult[] {
    const result = super.operate(data);
    result.push({
      key: "test",
      label: "Test",
      summaryResult: data.filter((rec) => rec > 10 && rec < 30).length
    });

    return result;
  }
}

@Component({
  selector: "igx-app-grid",
  templateUrl: "./sample.component.html"
})
export class GridSummaryComponent implements OnInit {

  @ViewChild("grid1", { read: IgxGridComponent })
  public grid1: IgxGridComponent;

  mySummary = MySummary;

  data = [{
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(1)",
      type: "NorthwindModel.Product"
    },
    ProductID: 1,
    ProductName: "Chai",
    SupplierID: 1,
    CategoryID: 1,
    QuantityPerUnit: "10 boxes x 20 bags",
    UnitPrice: "18.0000",
    UnitsInStock: 39,
    UnitsOnOrder: 0,
    ReorderLevel: 10,
    Discontinued: false,
    OrderDate: new Date("2012-02-12"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(1)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(1)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(1)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(2)",
      type: "NorthwindModel.Product"
    },
    ProductID: 2,
    ProductName: "Chang",
    SupplierID: 1,
    CategoryID: 1,
    QuantityPerUnit: "24 - 12 oz bottles",
    UnitPrice: "19.0000",
    UnitsInStock: 17,
    UnitsOnOrder: 40,
    ReorderLevel: 25,
    Discontinued: false,
    OrderDate: new Date("2003-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(2)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(2)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(2)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(3)",
      type: "NorthwindModel.Product"
    },
    ProductID: 3,
    ProductName: "Aniseed Syrup",
    SupplierID: 1,
    CategoryID: 2,
    QuantityPerUnit: "12 - 550 ml bottles",
    UnitPrice: "10.0000",
    UnitsInStock: 13,
    UnitsOnOrder: 70,
    ReorderLevel: 25,
    Discontinued: false,
    OrderDate: new Date("2006-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(3)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(3)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(3)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(4)",
      type: "NorthwindModel.Product"
    },
    ProductID: 4,
    ProductName: "Chef Antons Cajun Seasoning",
    SupplierID: 2,
    CategoryID: 2,
    QuantityPerUnit: "48 - 6 oz jars",
    UnitPrice: "22.0000",
    UnitsInStock: 53,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: false,
    OrderDate: new Date("2020-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(4)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(4)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(4)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(5)",
      type: "NorthwindModel.Product"
    },
    ProductID: 5,
    ProductName: "Chef Antons Gumbo Mix",
    SupplierID: 2,
    CategoryID: 2,
    QuantityPerUnit: "36 boxes",
    UnitPrice: "21.3500",
    UnitsInStock: 0,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: true,
    OrderDate: new Date("2011-11-11"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(5)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(5)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(5)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(6)",
      type: "NorthwindModel.Product"
    },
    ProductID: 6,
    ProductName: "Grandmas Boysenberry Spread",
    SupplierID: 3,
    CategoryID: 2,
    QuantityPerUnit: "12 - 8 oz jars",
    UnitPrice: "25.0000",
    UnitsInStock: 0,
    UnitsOnOrder: 0,
    ReorderLevel: 25,
    Discontinued: false,
    OrderDate: new Date("2017-12-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(6)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(6)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(6)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(7)",
      type: "NorthwindModel.Product"
    },
    ProductID: 7,
    ProductName: "Uncle Bobs Organic Dried Pears",
    SupplierID: 3,
    CategoryID: 7,
    QuantityPerUnit: "12 - 1 lb pkgs.",
    UnitPrice: "30.0000",
    UnitsInStock: 150,
    UnitsOnOrder: 0,
    ReorderLevel: 10,
    Discontinued: false,
    OrderDate: new Date("2016-07-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(7)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(7)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(7)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(8)",
      type: "NorthwindModel.Product"
    },
    ProductID: 8,
    ProductName: "Northwoods Cranberry Sauce",
    SupplierID: 3,
    CategoryID: 2,
    QuantityPerUnit: "12 - 12 oz jars",
    UnitPrice: "40.0000",
    UnitsInStock: 6,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: false,
    OrderDate: new Date("2025-01-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(8)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(8)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(8)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(9)",
      type: "NorthwindModel.Product"
    },
    ProductID: 9,
    ProductName: "Mishi Kobe Niku",
    SupplierID: 4,
    CategoryID: 6,
    QuantityPerUnit: "18 - 500 g pkgs.",
    UnitPrice: "$97.0000",
    UnitsInStock: 29,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: true,
    OrderDate: new Date("2010-02-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(9)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(9)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(9)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(10)",
      type: "NorthwindModel.Product"
    },
    ProductID: 10,
    ProductName: "Ikura",
    SupplierID: 4,
    CategoryID: 8,
    QuantityPerUnit: "12 - 200 ml jars",
    UnitPrice: "31.0000",
    UnitsInStock: 31,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: false,
    OrderDate: new Date("2008-05-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(10)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(10)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(10)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(11)",
      type: "NorthwindModel.Product"
    },
    ProductID: 11,
    ProductName: "Queso Cabrales",
    SupplierID: 5,
    CategoryID: 4,
    QuantityPerUnit: "1 kg pkg.",
    UnitPrice: "21.0000",
    UnitsInStock: 22,
    UnitsOnOrder: 30,
    ReorderLevel: 30,
    Discontinued: false,
    OrderDate: new Date("2009-01-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(11)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(11)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(11)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(12)",
      type: "NorthwindModel.Product"
    },
    ProductID: 12,
    ProductName: "Queso Manchego La Pastora",
    SupplierID: 5,
    CategoryID: 4,
    QuantityPerUnit: "10 - 500 g pkgs.",
    UnitPrice: "38.0000",
    UnitsInStock: 86,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: false,
    OrderDate: new Date("2015-11-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(12)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(12)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(12)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(13)",
      type: "NorthwindModel.Product"
    },
    ProductID: 13,
    ProductName: "Konbu",
    SupplierID: 6,
    CategoryID: 8,
    QuantityPerUnit: "2 kg box",
    UnitPrice: "6.0000",
    UnitsInStock: 24,
    UnitsOnOrder: 0,
    ReorderLevel: 5,
    Discontinued: false,
    OrderDate: new Date("2025-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(13)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(13)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(13)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(14)",
      type: "NorthwindModel.Product"
    },
    ProductID: 14,
    ProductName: "Tofu",
    SupplierID: 6,
    CategoryID: 7,
    QuantityPerUnit: "40 - 100 g pkgs.",
    UnitPrice: "23.2500",
    UnitsInStock: 35,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: false,
    OrderDate: new Date("2019-06-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(14)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(14)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(14)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(15)",
      type: "NorthwindModel.Product"
    },
    ProductID: 15,
    ProductName: "Genen Shouyu",
    SupplierID: 6,
    CategoryID: 2,
    QuantityPerUnit: "24 - 250 ml bottles",
    UnitPrice: "15.5000",
    UnitsInStock: 39,
    UnitsOnOrder: 0,
    ReorderLevel: 5,
    Discontinued: false,
    OrderDate: new Date("1995-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(15)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(15)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(15)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(16)",
      type: "NorthwindModel.Product"
    },
    ProductID: 16,
    ProductName: "Pavlova",
    SupplierID: 7,
    CategoryID: 3,
    QuantityPerUnit: "32 - 500 g boxes",
    UnitPrice: "17.4500",
    UnitsInStock: 29,
    UnitsOnOrder: 0,
    ReorderLevel: 10,
    Discontinued: false,
    OrderDate: new Date("2018-03-28"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(16)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(16)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(16)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(17)",
      type: "NorthwindModel.Product"
    },
    ProductID: 17,
    ProductName: "Alice Mutton",
    SupplierID: 7,
    CategoryID: 6,
    QuantityPerUnit: "20 - 1 kg tins",
    UnitPrice: "39.0000",
    UnitsInStock: 0,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: true,
    OrderDate: new Date("2015-08-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(17)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(17)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(17)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(18)",
      type: "NorthwindModel.Product"
    },
    ProductID: 18,
    ProductName: "Carnarvon Tigers",
    SupplierID: 7,
    CategoryID: 8,
    QuantityPerUnit: "16 kg pkg.",
    UnitPrice: "62.5000",
    UnitsInStock: 42,
    UnitsOnOrder: 0,
    ReorderLevel: 0,
    Discontinued: false,
    OrderDate: new Date("2005-09-27"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(18)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(18)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(18)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(19)",
      type: "NorthwindModel.Product"
    },
    ProductID: 19,
    ProductName: "Teatime Chocolate Biscuits",
    SupplierID: 8,
    CategoryID: 3,
    QuantityPerUnit: "",
    UnitPrice: "$9.2000",
    UnitsInStock: 25,
    UnitsOnOrder: 0,
    ReorderLevel: 5,
    Discontinued: false,
    OrderDate: new Date("2001-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(19)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(19)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(19)/Supplier"
      }
    }
  }, {
    __metadata: {
      uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)",
      type: "NorthwindModel.Product"
    },
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
    OrderDate: new Date("2005-03-17"),
    Category: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Category"
      }
    },
    Order_Details: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Order_Details"
      }
    },
    Supplier: {
      __deferred: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Supplier"
      }
    }
  }
  ];

  constructor() {
    const date = new Date();
    for (let i = 0; i < 10; i++) {
      this.data = this.data.concat(this.data);
    }
    this.data = this.data.slice(0, 15);
  }

  ngOnInit() {
  }

  updateData() {
    const d = [].concat(this.data).concat(this.data.slice(0, 15));
    this.data = d;
    // this.grid1.markForCheck();
    this.grid1.clearSummaryCache();
  }

  viewRecord(aRecord) {
  }
  initColunm(po: IgxColumnComponent) {

  }
  public enableSummary() {
    this.grid1.enableSummaries([{fieldName: "ReorderLevel", customSummary: this.mySummary},
    {fieldName: "ProductID"}]);
  }
  public addRow() {
    this.grid1.addRow({
      __metadata: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)",
        type: "NorthwindModel.Product"
      },
      ProductID: 21,
      ProductName: "Sir Rodneys Marmalade",
      SupplierID: 8,
      CategoryID: 3,
      QuantityPerUnit: undefined,
      UnitPrice: undefined,
      UnitsInStock: 999,
      UnitsOnOrder: 0,
      ReorderLevel: 0,
      Discontinued: false,
      OrderDate: new Date("1905-03-17"),
      Category: {
        __deferred: {
          uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Category"
        }
      },
      Order_Details: {
        __deferred: {
          uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Order_Details"
        }
      },
      Supplier: {
        __deferred: {
          uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Supplier"
        }
      }
    });
  }

  public deleteRow() {
    this.grid1.deleteRow(0);
  }
  public updateCell() {
    this.grid1.updateCell(70, 0, "ReorderLevel");
  }
  public updateRow() {
    this.grid1.updateRow({
      __metadata: {
        uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)",
        type: "NorthwindModel.Product"
      },
      ProductID: 28,
      ProductName: "Sir Rodneys Marmalade",
      SupplierID: 8,
      CategoryID: 3,
      QuantityPerUnit: undefined,
      UnitPrice: undefined,
      UnitsInStock: -99,
      UnitsOnOrder: 0,
      ReorderLevel: -12,
      Discontinued: false,
      OrderDate: new Date("1905-03-17"),
      Category: {
        __deferred: {
          uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Category"
        }
      },
      Order_Details: {
        __deferred: {
          uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Order_Details"
        }
      },
      Supplier: {
        __deferred: {
          uri: "http://services.odata.org/Northwind/Northwind.svc/Products(20)/Supplier"
        }
      }
    }, 0);
  }
  pin() {
    for (const name of ["UnitsInStock", "CategoryID"]) {
      if (this.grid1.getColumnByName(name).pinned) {
        this.grid1.unpinColumn(name);
      } else {
        this.grid1.pinColumn(name);
      }
    }
  }
}
