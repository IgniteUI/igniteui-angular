export const foods: {
    name: string,
    entries: {
        name: string,
        refNo: string
    }[]
}[] = [{
    name: 'Vegetables',
    entries: [{
        name: 'Cucumber',
        refNo: `00000`
    }, {
        name: 'Lettuce',
        refNo: `00001`
    }, {
        name: 'Cabbage',
        refNo: `00002`
    }]
}, {
    name: 'Fruits',
    entries: [{
        name: 'Banana',
        refNo: `10000`
    }, {
        name: 'Tomato',
        refNo: `10001`
    }, {
        name: 'Kiwi',
        refNo: `10002`
    }]
}, {
    name: 'Meats',
    entries: [{
        name: 'Chicken',
        refNo: `20000`
    }, {
        name: 'Beef',
        refNo: `20001`
    }, {
        name: 'Veal',
        refNo: `20002`
    }]
}];
