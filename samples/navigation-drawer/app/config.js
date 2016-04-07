System.config({
    packages: {        
        app: {
        format: 'cjs',
        defaultExtension: 'js'
        },
        "../../src": {
        format: 'cjs',
        defaultExtension: 'js'
        }
}
});
//https://github.com/systemjs/systemjs/blob/master/docs/system-api.md
System.import('app/boot')
    .then(function(module) {
        // swap main component per sample
        module.Start(sample || "");
    }, console.error.bind(console));