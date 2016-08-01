/**
 * Extra config (merged with defaults) adding middleware for lite server default url redirect to samples
 * https://github.com/johnpapa/lite-server#custom-configuration
 */
export = {
    server: {
        middleware: {
            2: {
                // handle any requests at / (default fallback goes to index file)
                route: "/index.html",
                handle: function (req, res, next: Function) {
                    
                    if (req.url === "/") {
                        res.writeHead(302, {
                            'Location': '/demos/index.html'
                        });
                        res.end();
                    }
                    return next();
                }
            }
        }
    }
}