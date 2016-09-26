"use strict";
module.exports = {
    server: {
        middleware: {
            2: {
                // handle any requests at / (default fallback goes to index file)
                route: "/index.html",
                handle: function (req, res, next) {
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
};

//# sourceMappingURL=bs-config.js.map
