(function (window, $, Modernizr) {
    Array.prototype.clean = function (deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

    var $window = $(window),
        $topButton = $('#top-button'),
        $sidebar = $('.nav-sidebar'),
        $body = $('body'),
        $content;

    var _private = {
        currentPageInfo: {}
    };

    var common = {

        contentContainerId: '#document-content-container',

        contentElementId: '#document-content',

        $errorPublishedMessage: $('#error-published-message'),

        contentFolderName: 'help',

        homePages: ["index", "home-page"],

        topicAPI: "",

        isOnline: false,

        baseURI: window.baseURI || "",

        footer: $('#footer-container'),

        currentPageInfo: function (info) {
            if (info) {

                if (_private.currentPageInfo.pageName != info.pageName) {

                    // Google Analytics
                    //ga('send', 'pageview', location. name);

                    //tabs:
                    //$('<div>', { id: 'Syntax-VBAll' }).append($('#Syntax-VB')).append('&nbsp;').append($('#Syntax-VBUsage')).appendTo('.TabContainer');
                    //$(".TabContainer").tabs({
                    //    active: 1,
                    //    activate: function (event, ui) {
                    //        if (ui.newTab.children('a').attr('href') == "#Syntax-CS") {
                    //            $("div.FilteredContentCS").show();
                    //            $("div.FilteredContentVB").hide()
                    //        }
                    //        else {
                    //            $("div.FilteredContentCS").hide();
                    //            $("div.FilteredContentVB").show()
                    //        }
                    //    }
                    //});
                }
                _private.currentPageInfo = info;

                //if (info.title && common.shouldUsePushState()) {
                //    window.document.title = igViewer.locale.pageTitleFormat.replace("{0}", info.title);

                //    var emailLink = $("#fine-print a").not(".github-link");
                //    var href = emailLink.attr("href");
                //    href = href.split('=')[0] + '=' + info.title + " (" + info.pageName + ")";
                //    emailLink.attr("href", href);
                //}
                return;
            }

            return _private.currentPageInfo;
        },

        versionQuery: function (q) {
            var query = q || window.location.search;
            var version = query.match(/[\?&]v=(\d\d\.\d)/);
            if (version && version[1]) {
                return '?v=' + version[1];
            }
            return "";
        },

        isContentPage: function () {
            if (common.path && common.path.length) {
                return true;
            }

            if (common.isOnIndexPage()) {
                return true;
            }

            return false;
        },

        getPageInfo: function (fileName, title) {
            var pageName = fileName.replace(/\.html(?=\?|$)/i, '').toLowerCase();
            // TODO: better home pages handling
            if (common.isOnIndexPage(pageName) && !common.isOnline && common.baseURI) {
                common.baseURI = "../";
            }

            var ext = common.baseURI + fileName,
                noExt = common.baseURI + pageName,
                api = common.topicAPI + pageName;

            var info = {
                title: title,
                fileName: fileName,
                pageName: pageName,
                path: {
                    navigation: common.isOnline ? noExt : ext,
                    service: common.isOnline ? api : ext,
                    noExt: noExt,
                    api: api,
                    ext: ext
                },
                isContentPage: common.isContentPage()
            };

            return info;
        },

        getPageNameFromLocation: function () {
            var pathParts = window.location.pathname.split('/');
            pathParts = pathParts.clean('');
            var name = common.isOnline ? "" : common.homePages[2];

            if (pathParts.length > 1) {
                name = common.isOnline ? pathParts.pop().toLowerCase() : pathParts.pop();
            }

            //append version to the path:
            name += common.versionQuery();

            return decodeURIComponent(name);
        },

        isOnIndexPage: function (page) {
            if (!page) {
                var pathname = location.protocol + "//" + location.host + location.pathname;
                if (pathname === common.baseURI) {
                    return true;
                }
                page = pathname.replace(common.baseURI, "");
            };
            return jQuery.inArray(page, common.homePages) !== -1;
        },

        isCurrentPage: function (path, query) {
            path = path || window.location.protocol + "//" + window.location.host + window.location.pathname;
            path += common.versionQuery(query);
            return common.currentPageInfo().path.navigation == path;
        },

        isUsingWebServer: function () {
            var protocol = window.location.protocol;
            return (protocol === 'http:' || protocol === 'https:');
        },

        isSmallDeviceWidth: function () {
            return $window.width() < 768;
        },

        shouldUsePushState: function () {
            if (Modernizr.history) {
                return common.isUsingWebServer();
            }
            return false;
        },

        hasLocationHash: function () {
            return window.location.hash && window.location.hash.length > 0;
        },

        refreshHash: function () {
            //D.P. this actually works better than changing the hash back and forth, no extra history entries.
            if (common.hasLocationHash()) {
                window.location.assign(window.location.href);
            }
        },

        scrollToTop: function () {
            $('html, body').animate({ scrollTop: 0 }, 'fast');
        },

        adjustTopLinkPos: function () {
        	var scrollPos = $window.height() + $window.scrollTop();
        	var footerTop = common.footer.offset().top;
            if (scrollPos > footerTop) {
                $topButton.css({ position: "absolute" });
            }
            else {
                $topButton.css({ position: "fixed" });
            }
        },

        publishErrorToServer: function (error) {
            var errorText;

            if (error.message) {
                errorText = ' Message: ' + error.message;
            }

            if (error.stack) {
                errorText += ' Stack: ' + error.stack;
            }

            var msg = {
                errorText: errorText,
                url: window.document.location.href
            };

            $.post('api/error', msg);

            common.$errorPublishedMessage.fadeIn();
        },

        syncSidebarHeight: function () {
            var contentMinHeight = undefined,
                sidebarHeight = $sidebar.height();
            $content = $content || $(common.contentContainerId).parent();
            contentMinHeight = $content.data("defaultMinHeight");
            if (contentMinHeight === undefined) {
                contentMinHeight = parseInt($content.css("minHeight"), 10);
                $content.data("defaultMinHeight", contentMinHeight);
            }

            if (sidebarHeight > contentMinHeight) {
                $content.css("minHeight", sidebarHeight);
            } else {
                $content.css("minHeight", contentMinHeight);
            }
        },

        toAbsoluteURL: function (relative) {
            var a = window.document.createElement('a');
            a.href = relative;
            return a.href;
        },

        getProductList: function () {
            var value = $body.attr('data-product-list');
            var list = [];

            if (value !== undefined) {
                list = value.split('|');
            }

            return list;
        }
    };

    $topButton.children('button').click(function (e) {
        common.scrollToTop();
        this.blur();
    });

    common.$errorPublishedMessage.on("click", ".close", function (e) {
        common.$errorPublishedMessage.fadeOut();
    });

    common.isOnline = $('body').attr('data-mode') === "online";
    common.baseURI = common.toAbsoluteURL(common.baseURI);

    common.currentPageInfo(common.getPageInfo(common.getPageNameFromLocation()));

    common.adjustTopLinkPos();
    common.refreshHash();
    $window.scroll(common.adjustTopLinkPos);
    $window.one("load", function () {
        common.syncSidebarHeight();
    });
    //window.setTimeout(function () {
    //    $("#wrong-version").slideUp(500);
    //}, 5000);
    
    window.igViewer = window.igViewer || {};
    window.igViewer.common = common;

}(window, jQuery, Modernizr));