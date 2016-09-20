"use strict";

module.exports = {
    server: {
        middleware: {
            2: {
                route: "/index.html",
                handle: function(req, res, next) {
                    if (req.url === "/") {
                        res.writeHead(302, {
                            "Location": "/demos/index.html"
                        });
                        res.end();
                    }
                    return next();
                }
            }
        }
    }
};