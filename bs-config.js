"use strict";

module.exports = {
    server: {
        middleware: {
            2: {
                route: "/index.html",
                handle: function (req, res, next) {
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
    },
    notify: {
        styles: {
            top: 'auto',
            bottom: '0',
            margin: '0px',
            padding: '5px',
            position: 'fixed',
            fontSize: '10px',
            zIndex: '9999',
            borderRadius: '5px 0px 0px',
            color: 'white',
            textAlign: 'center',
            display: 'block',
            backgroundColor: 'rgba(60, 197, 31, 0.498039)'
        }
    }
};