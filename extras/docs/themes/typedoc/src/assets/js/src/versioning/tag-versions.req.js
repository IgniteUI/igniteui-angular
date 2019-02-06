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
        const select = $('#versions')
        folders = folders.reverse();

        folders.forEach(f => {
            select.append($('<option>', {
                value: `${baseUrl}/products/ignite-ui-angular/docs/${f}/typescript`,
                text: f
            }));
        });

        select.val(`${baseUrl}/products/ignite-ui-angular/docs/${folders[0]}/typescript`);

        if (sessionStorage.typedocOption) {
            select.val(sessionStorage.typedocOption);
        }
    });

    $('#versions').on('change', function () {
        const val = $('#versions').val();
        sessionStorage.typedocOption = val;
        window.location.assign(val);
    });
})();
