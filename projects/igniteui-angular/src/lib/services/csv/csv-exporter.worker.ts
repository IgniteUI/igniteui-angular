/// <reference lib="webworker" />

import { CharSeparatedValueData } from './char-separated-value-data';

addEventListener('message', ({ data }) => {
    console.log('worker start working: ' + new Date());

    const decoder = new TextDecoder('utf-8');
    const view = new DataView(data.data, 0, data.data.byteLength);
    const string = decoder.decode(view);
    const object = JSON.parse(string);
    const csvData = new CharSeparatedValueData(object, data.valueDelimiter);

    postMessage(csvData.prepareData());
    // postMessage(setTimeout(() => {}, 1));

    console.log('worker done working: ' + new Date());
});
