(function () {
    let baseUrl = $('body').data('base-url');
    const versionsJson = $('body').data('api-versions-json');

    $.ajax({
        url: versionsJson,
        type: "get",
        contentType: 'application/json',
        xhrFields: {
            withCredentials: false
        }
    }).done(function (data) {
        let folders = data.folders;
        const select = $('#versions');

        folders = folders.reverse();

        baseUrl += "/products/ignite-ui-angular/docs/";
        folders.forEach(function (f) {
            select.append($('<option>', {
                value: baseUrl + f + "/sass",
                text: f
            }));
        });

        const version = folders.filter(function(v){ return window.location.href.indexOf(v) >= 0; })[0];
        if (version) {
            select.val(baseUrl + version + "/sass");
        } else {
            select.val(baseUrl + folders[0] + "/sass");
        }
    });

    $('#versions').on('change', function () {
        const val = $('#versions').val();
        window.location.assign(val);
    });
})();
