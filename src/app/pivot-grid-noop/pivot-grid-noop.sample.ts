import { Component, ViewChild } from '@angular/core';
import {
    IgxPivotGridComponent, IgxPivotNumericAggregate, IPivotConfiguration, IPivotDimension,
    IPivotValue,
    NoopPivotDimensionsStrategy
} from 'igniteui-angular';



export class MyRowStrategy extends NoopPivotDimensionsStrategy {
    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}

export class MyColumnStrategy extends NoopPivotDimensionsStrategy {
    public process(collection: any[], _: IPivotDimension[], __: IPivotValue[]): any[] {
        return collection;
    }
}


@Component({
    providers: [],
    selector: 'app-tree-grid-sample',
    styleUrls: ['pivot-grid-noop.sample.css'],
    templateUrl: 'pivot-grid-noop.sample.html'
})

export class PivotGridNoopSampleComponent {
    @ViewChild('grid1', { static: true }) public grid1: IgxPivotGridComponent;
    public pivotConfigHierarchy: IPivotConfiguration = {
        columnStrategy: NoopPivotDimensionsStrategy.instance(),
        rowStrategy: NoopPivotDimensionsStrategy.instance(),
        columns: [
            {
                memberName: 'Country',
                enabled: true
            },
        ]
        ,
        rows: [
            {
                memberFunction: () => 'All',
                memberName: 'AllProducts',
                enabled: true,
                width: '25%',
                childLevel: {
                    memberName: 'ProductCategory',
                    enabled: true
                }
            },
            {
                memberName: 'AllSeller',
                memberFunction: () => 'All Sellers',
                enabled: true,
                childLevel: {
                    enabled: true,
                    memberName: 'SellerName'
                }
            },
        ],
        values: [
            {
                member: 'UnitsSold',
                aggregate: {
                    aggregator: IgxPivotNumericAggregate.sum,
                    key: 'sum',
                    label: 'Sum'
                },
                enabled: true
            },
        ],
        filters: null
    };

    public mockRemoteData = [
        {
          "AllSeller": "All Sellers",
          "AllSeller_records": [
            {
              "SellerName": "David",
              "records": [
                {
                  "ProductCategory": "Accessories",
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "processed": true,
                  "USA": 293
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Accessories",
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "processed": true,
                  "USA": 293
                }
              ],
              "ProductCategory": "Accessories",
              "UnitPrice": 85.58,
              "Country": "USA",
              "City": "New York",
              "Date": "04/07/2021",
              "UnitsSold": 293,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "USA": 293
            },
            {
              "SellerName": "Lydia",
              "records": [
                {
                  "ProductCategory": "Bikes",
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "processed": true,
                  "Uruguay": 68
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Bikes",
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "processed": true,
                  "Uruguay": 68
                }
              ],
              "ProductCategory": "Bikes",
              "UnitPrice": 3.56,
              "Country": "Uruguay",
              "City": "Ciudad de la Costa",
              "Date": "01/06/2020",
              "UnitsSold": 68,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "Uruguay": 68
            },
            {
              "SellerName": "Elisa",
              "records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 49.57,
                  "SellerName": "Elisa",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "01/05/2019",
                  "UnitsSold": 296,
                  "processed": true,
                  "USA": 296
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 49.57,
                  "SellerName": "Elisa",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "01/05/2019",
                  "UnitsSold": 296,
                  "processed": true,
                  "USA": 296
                }
              ],
              "ProductCategory": "Clothing",
              "UnitPrice": 49.57,
              "Country": "USA",
              "City": "New York",
              "Date": "01/05/2019",
              "UnitsSold": 296,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "USA": 296
            },
            {
              "SellerName": "Larry",
              "records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 68.33,
                  "SellerName": "Larry",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "05/12/2020",
                  "UnitsSold": 456,
                  "processed": true,
                  "Uruguay": 456
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 68.33,
                  "SellerName": "Larry",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "05/12/2020",
                  "UnitsSold": 456,
                  "processed": true,
                  "Uruguay": 456
                }
              ],
              "ProductCategory": "Clothing",
              "UnitPrice": 68.33,
              "Country": "Uruguay",
              "City": "Ciudad de la Costa",
              "Date": "05/12/2020",
              "UnitsSold": 456,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "Uruguay": 456
            },
            {
              "SellerName": "Stanley",
              "records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 12.81,
                  "SellerName": "Stanley",
                  "Country": "Bulgaria",
                  "City": "Sofia",
                  "Date": "01/01/2021",
                  "UnitsSold": 282,
                  "processed": true,
                  "Bulgaria": 282
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 12.81,
                  "SellerName": "Stanley",
                  "Country": "Bulgaria",
                  "City": "Sofia",
                  "Date": "01/01/2021",
                  "UnitsSold": 282,
                  "processed": true,
                  "Bulgaria": 282
                }
              ],
              "ProductCategory": "Clothing",
              "UnitPrice": 12.81,
              "Country": "Bulgaria",
              "City": "Sofia",
              "Date": "01/01/2021",
              "UnitsSold": 282,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "Bulgaria": 282
            },
            {
              "SellerName": "Walter",
              "records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 16.05,
                  "SellerName": "Walter",
                  "Country": "Bulgaria",
                  "City": "Plovdiv",
                  "Date": "02/19/2020",
                  "UnitsSold": 492,
                  "processed": true,
                  "Bulgaria": 492
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 16.05,
                  "SellerName": "Walter",
                  "Country": "Bulgaria",
                  "City": "Plovdiv",
                  "Date": "02/19/2020",
                  "UnitsSold": 492,
                  "processed": true,
                  "Bulgaria": 492
                }
              ],
              "ProductCategory": "Clothing",
              "UnitPrice": 16.05,
              "Country": "Bulgaria",
              "City": "Plovdiv",
              "Date": "02/19/2020",
              "UnitsSold": 492,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "Bulgaria": 492
            },
            {
              "SellerName": "John",
              "records": [
                {
                  "ProductCategory": "Components",
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "processed": true,
                  "USA": 240
                }
              ],
              "SellerName_records": [
                {
                  "ProductCategory": "Components",
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "processed": true,
                  "USA": 240
                }
              ],
              "ProductCategory": "Components",
              "UnitPrice": 18.13,
              "Country": "USA",
              "City": "New York",
              "Date": "12/08/2021",
              "UnitsSold": 240,
              "AllProducts": "All",
              "AllProducts_records": [
                {
                  "ProductCategory": "Accessories",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "AllSeller_records": [
                    {
                      "SellerName": "David",
                      "records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Accessories",
                          "UnitPrice": 85.58,
                          "SellerName": "David",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "04/07/2021",
                          "UnitsSold": 293,
                          "processed": true,
                          "USA": 293
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 293
                },
                {
                  "ProductCategory": "Bikes",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "AllSeller_records": [
                    {
                      "SellerName": "Lydia",
                      "records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Bikes",
                          "UnitPrice": 3.56,
                          "SellerName": "Lydia",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "01/06/2020",
                          "UnitsSold": 68,
                          "processed": true,
                          "Uruguay": 68
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "Uruguay": 68
                },
                {
                  "ProductCategory": "Clothing",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [
                    {
                      "SellerName": "Elisa",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "SellerName": "Larry",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "SellerName": "Stanley",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "SellerName": "Walter",
                      "records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 49.57,
                          "SellerName": "Elisa",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "01/05/2019",
                          "UnitsSold": 296,
                          "processed": true,
                          "USA": 296
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 68.33,
                          "SellerName": "Larry",
                          "Country": "Uruguay",
                          "City": "Ciudad de la Costa",
                          "Date": "05/12/2020",
                          "UnitsSold": 456,
                          "processed": true,
                          "Uruguay": 456
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 12.81,
                          "SellerName": "Stanley",
                          "Country": "Bulgaria",
                          "City": "Sofia",
                          "Date": "01/01/2021",
                          "UnitsSold": 282,
                          "processed": true,
                          "Bulgaria": 282
                        },
                        {
                          "ProductCategory": "Clothing",
                          "UnitPrice": 16.05,
                          "SellerName": "Walter",
                          "Country": "Bulgaria",
                          "City": "Plovdiv",
                          "Date": "02/19/2020",
                          "UnitsSold": 492,
                          "processed": true,
                          "Bulgaria": 492
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 296,
                  "Uruguay": 456,
                  "Bulgaria": 774
                },
                {
                  "ProductCategory": "Components",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "AllSeller_records": [
                    {
                      "SellerName": "John",
                      "records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "SellerName_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "ProductCategory_records": [
                        {
                          "ProductCategory": "Components",
                          "UnitPrice": 18.13,
                          "SellerName": "John",
                          "Country": "USA",
                          "City": "New York",
                          "Date": "12/08/2021",
                          "UnitsSold": 240,
                          "processed": true,
                          "USA": 240
                        }
                      ],
                      "AllSeller_records": [],
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller": "All Sellers",
                  "processed": true,
                  "USA": 240
                }
              ],
              "processed": true,
              "USA": 240
            }
          ],
          "records": [
            {
              "ProductCategory": "Accessories",
              "UnitPrice": 85.58,
              "SellerName": "David",
              "Country": "USA",
              "City": "New York",
              "Date": "04/07/2021",
              "UnitsSold": 293,
              "processed": true,
              "USA": 293
            },
            {
              "ProductCategory": "Bikes",
              "UnitPrice": 3.56,
              "SellerName": "Lydia",
              "Country": "Uruguay",
              "City": "Ciudad de la Costa",
              "Date": "01/06/2020",
              "UnitsSold": 68,
              "processed": true,
              "Uruguay": 68
            },
            {
              "ProductCategory": "Clothing",
              "UnitPrice": 49.57,
              "SellerName": "Elisa",
              "Country": "USA",
              "City": "New York",
              "Date": "01/05/2019",
              "UnitsSold": 296,
              "processed": true,
              "USA": 296
            },
            {
              "ProductCategory": "Clothing",
              "UnitPrice": 68.33,
              "SellerName": "Larry",
              "Country": "Uruguay",
              "City": "Ciudad de la Costa",
              "Date": "05/12/2020",
              "UnitsSold": 456,
              "processed": true,
              "Uruguay": 456
            },
            {
              "ProductCategory": "Clothing",
              "UnitPrice": 12.81,
              "SellerName": "Stanley",
              "Country": "Bulgaria",
              "City": "Sofia",
              "Date": "01/01/2021",
              "UnitsSold": 282,
              "processed": true,
              "Bulgaria": 282
            },
            {
              "ProductCategory": "Clothing",
              "UnitPrice": 16.05,
              "SellerName": "Walter",
              "Country": "Bulgaria",
              "City": "Plovdiv",
              "Date": "02/19/2020",
              "UnitsSold": 492,
              "processed": true,
              "Bulgaria": 492
            },
            {
              "ProductCategory": "Components",
              "UnitPrice": 18.13,
              "SellerName": "John",
              "Country": "USA",
              "City": "New York",
              "Date": "12/08/2021",
              "UnitsSold": 240,
              "processed": true,
              "USA": 240
            }
          ],
          "AllProducts": "All",
          "AllProducts_records": [
            {
              "ProductCategory": "Accessories",
              "records": [
                {
                  "ProductCategory": "Accessories",
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "processed": true,
                  "USA": 293
                }
              ],
              "ProductCategory_records": [
                {
                  "ProductCategory": "Accessories",
                  "UnitPrice": 85.58,
                  "SellerName": "David",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "processed": true,
                  "USA": 293
                }
              ],
              "UnitPrice": 85.58,
              "SellerName": "David",
              "Country": "USA",
              "City": "New York",
              "Date": "04/07/2021",
              "UnitsSold": 293,
              "AllSeller_records": [
                {
                  "SellerName": "David",
                  "records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "ProductCategory": "Accessories",
                  "UnitPrice": 85.58,
                  "Country": "USA",
                  "City": "New York",
                  "Date": "04/07/2021",
                  "UnitsSold": 293,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Accessories",
                      "UnitPrice": 85.58,
                      "SellerName": "David",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "04/07/2021",
                      "UnitsSold": 293,
                      "processed": true,
                      "USA": 293
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "USA": 293
                }
              ],
              "AllSeller": "All Sellers",
              "processed": true,
              "USA": 293
            },
            {
              "ProductCategory": "Bikes",
              "records": [
                {
                  "ProductCategory": "Bikes",
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "processed": true,
                  "Uruguay": 68
                }
              ],
              "ProductCategory_records": [
                {
                  "ProductCategory": "Bikes",
                  "UnitPrice": 3.56,
                  "SellerName": "Lydia",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "processed": true,
                  "Uruguay": 68
                }
              ],
              "UnitPrice": 3.56,
              "SellerName": "Lydia",
              "Country": "Uruguay",
              "City": "Ciudad de la Costa",
              "Date": "01/06/2020",
              "UnitsSold": 68,
              "AllSeller_records": [
                {
                  "SellerName": "Lydia",
                  "records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "ProductCategory": "Bikes",
                  "UnitPrice": 3.56,
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "01/06/2020",
                  "UnitsSold": 68,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Bikes",
                      "UnitPrice": 3.56,
                      "SellerName": "Lydia",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "01/06/2020",
                      "UnitsSold": 68,
                      "processed": true,
                      "Uruguay": 68
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "Uruguay": 68
                }
              ],
              "AllSeller": "All Sellers",
              "processed": true,
              "Uruguay": 68
            },
            {
              "ProductCategory": "Clothing",
              "records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 49.57,
                  "SellerName": "Elisa",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "01/05/2019",
                  "UnitsSold": 296,
                  "processed": true,
                  "USA": 296
                },
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 68.33,
                  "SellerName": "Larry",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "05/12/2020",
                  "UnitsSold": 456,
                  "processed": true,
                  "Uruguay": 456
                },
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 12.81,
                  "SellerName": "Stanley",
                  "Country": "Bulgaria",
                  "City": "Sofia",
                  "Date": "01/01/2021",
                  "UnitsSold": 282,
                  "processed": true,
                  "Bulgaria": 282
                },
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 16.05,
                  "SellerName": "Walter",
                  "Country": "Bulgaria",
                  "City": "Plovdiv",
                  "Date": "02/19/2020",
                  "UnitsSold": 492,
                  "processed": true,
                  "Bulgaria": 492
                }
              ],
              "ProductCategory_records": [
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 49.57,
                  "SellerName": "Elisa",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "01/05/2019",
                  "UnitsSold": 296,
                  "processed": true,
                  "USA": 296
                },
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 68.33,
                  "SellerName": "Larry",
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "05/12/2020",
                  "UnitsSold": 456,
                  "processed": true,
                  "Uruguay": 456
                },
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 12.81,
                  "SellerName": "Stanley",
                  "Country": "Bulgaria",
                  "City": "Sofia",
                  "Date": "01/01/2021",
                  "UnitsSold": 282,
                  "processed": true,
                  "Bulgaria": 282
                },
                {
                  "ProductCategory": "Clothing",
                  "UnitPrice": 16.05,
                  "SellerName": "Walter",
                  "Country": "Bulgaria",
                  "City": "Plovdiv",
                  "Date": "02/19/2020",
                  "UnitsSold": 492,
                  "processed": true,
                  "Bulgaria": 492
                }
              ],
              "AllSeller_records": [
                {
                  "SellerName": "Elisa",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    }
                  ],
                  "ProductCategory": "Clothing",
                  "UnitPrice": 49.57,
                  "Country": "USA",
                  "City": "New York",
                  "Date": "01/05/2019",
                  "UnitsSold": 296,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "USA": 296
                },
                {
                  "SellerName": "Larry",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    }
                  ],
                  "ProductCategory": "Clothing",
                  "UnitPrice": 68.33,
                  "Country": "Uruguay",
                  "City": "Ciudad de la Costa",
                  "Date": "05/12/2020",
                  "UnitsSold": 456,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "Uruguay": 456
                },
                {
                  "SellerName": "Stanley",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    }
                  ],
                  "ProductCategory": "Clothing",
                  "UnitPrice": 12.81,
                  "Country": "Bulgaria",
                  "City": "Sofia",
                  "Date": "01/01/2021",
                  "UnitsSold": 282,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "Bulgaria": 282
                },
                {
                  "SellerName": "Walter",
                  "records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "ProductCategory": "Clothing",
                  "UnitPrice": 16.05,
                  "Country": "Bulgaria",
                  "City": "Plovdiv",
                  "Date": "02/19/2020",
                  "UnitsSold": 492,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 49.57,
                      "SellerName": "Elisa",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "01/05/2019",
                      "UnitsSold": 296,
                      "processed": true,
                      "USA": 296
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 68.33,
                      "SellerName": "Larry",
                      "Country": "Uruguay",
                      "City": "Ciudad de la Costa",
                      "Date": "05/12/2020",
                      "UnitsSold": 456,
                      "processed": true,
                      "Uruguay": 456
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 12.81,
                      "SellerName": "Stanley",
                      "Country": "Bulgaria",
                      "City": "Sofia",
                      "Date": "01/01/2021",
                      "UnitsSold": 282,
                      "processed": true,
                      "Bulgaria": 282
                    },
                    {
                      "ProductCategory": "Clothing",
                      "UnitPrice": 16.05,
                      "SellerName": "Walter",
                      "Country": "Bulgaria",
                      "City": "Plovdiv",
                      "Date": "02/19/2020",
                      "UnitsSold": 492,
                      "processed": true,
                      "Bulgaria": 492
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "Bulgaria": 492
                }
              ],
              "AllSeller": "All Sellers",
              "processed": true,
              "USA": 296,
              "Uruguay": 456,
              "Bulgaria": 774
            },
            {
              "ProductCategory": "Components",
              "records": [
                {
                  "ProductCategory": "Components",
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "processed": true,
                  "USA": 240
                }
              ],
              "ProductCategory_records": [
                {
                  "ProductCategory": "Components",
                  "UnitPrice": 18.13,
                  "SellerName": "John",
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "processed": true,
                  "USA": 240
                }
              ],
              "UnitPrice": 18.13,
              "SellerName": "John",
              "Country": "USA",
              "City": "New York",
              "Date": "12/08/2021",
              "UnitsSold": 240,
              "AllSeller_records": [
                {
                  "SellerName": "John",
                  "records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "SellerName_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "ProductCategory": "Components",
                  "UnitPrice": 18.13,
                  "Country": "USA",
                  "City": "New York",
                  "Date": "12/08/2021",
                  "UnitsSold": 240,
                  "ProductCategory_records": [
                    {
                      "ProductCategory": "Components",
                      "UnitPrice": 18.13,
                      "SellerName": "John",
                      "Country": "USA",
                      "City": "New York",
                      "Date": "12/08/2021",
                      "UnitsSold": 240,
                      "processed": true,
                      "USA": 240
                    }
                  ],
                  "AllSeller_records": [],
                  "processed": true,
                  "USA": 240
                }
              ],
              "AllSeller": "All Sellers",
              "processed": true,
              "USA": 240
            }
          ],
          "processed": true,
          "USA": 829,
          "Uruguay": 524,
          "Bulgaria": 774
        }
      ];


    public mockRemoteDataDifferentSeparator = [
        {
            AllProducts: 'All Products', All: 2127, 'All_Country-Bulgaria': 774, 'All_Country-USA': 829, 'All_Country-Uruguay': 524, 'AllProducts-records': [
                { ProductCategory: 'Clothing', All: 1523, 'All_Country-Bulgaria': 774, 'All_Country-USA': 296, 'All_Country-Uruguay': 456,  },
                { ProductCategory: 'Bikes', All: 68, 'All_Country-Uruguay': 68 },
                { ProductCategory: 'Accessories', All: 293, 'All_Country-USA': 293 },
                { ProductCategory: 'Components', All: 240, 'All_Country-USA': 240 }
            ]
        }
    ];

}
