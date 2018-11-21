
(function() {
    // function initTabs() {
    //     var tabs = $('#tabs');
    //     if (tabs.length > 0) {
    //         $('#tabs').on('tabscreate', function(event, ui) {
    //             $('#document-content-container, #fine-print').fadeIn();
    //         });
    //     } else {
    //         $('#document-content-container, #fine-print').fadeIn();
    //     }
    // }

    function initNavigation() {
         var navBaseUrl = $('body').data('base-url');
         var navUrl = navBaseUrl + '/navigation';

         var request = $.ajax({
             url: navUrl,
             type: 'get',
             xhrFields: {
                 withCredentials: false
             }
         }).done(function(data) {
             var nav = $(data);
             var header = nav.find('#header')[0].outerHTML;
             $('#header').replaceWith(header);

             var logOutLink = $('#logOutLink');
             if (logOutLink.length !== 0) {
                 // Removing query string. It might contain bad ReturnUrl.
                 var newLink = logOutLink.attr('href').split('?')[0];
                 logOutLink.attr('href', newLink);
             }

             var footer = nav.find('footer.ui-footer')[0].outerHTML;
             $('footer.ui-footer').replaceWith(footer);

             var copyrightFooter = nav.find('#footer')[0].outerHTML;
             $('#footer').replaceWith(copyrightFooter);

             window.igViewer.common.footer = $('#footer-container');

             igNavigation.init();
         });
        window.igViewer.common.footer = $('#footer-container');

        igNavigation.init();
    }

    //     $.ajax({
    //         url: secondaryHeaderUrl,
    //         type: 'get'
    //     }).done(function(data) {
    //         $('#secondaryHeader').replaceWith(data);
    //     });
    // }

    // initTabs();

    initNavigation();
    // initSecondaryHeader();

    $(document).ready(function() {
        window.igViewer.common.adjustTopLinkPos();
    });
})();