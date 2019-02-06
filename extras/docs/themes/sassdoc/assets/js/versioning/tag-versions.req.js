(function () {
    const baseUrl = $('body').data('base-url');
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
        const lastVersion = folders.slice(-1)[0];
        folders = folders.reverse();

        folders.forEach(function (f) {
            select.append($('<option>', {
                value: `${baseUrl}/products/ignite-ui-angular/docs/${f}/sass`,
                text: f
            }));
        });

        select.val(`${baseUrl}/products/ignite-ui-angular/docs/${folders[0]}/sass`);

        if (sessionStorage.sassOption) {
            select.val(sessionStorage.sassOption);
        }
    });

    $('#versions').on('change', function () {
        const val = $('#versions').val();
        sessionStorage.sassOption = val;
        window.location.assign(val);
    });
})();
