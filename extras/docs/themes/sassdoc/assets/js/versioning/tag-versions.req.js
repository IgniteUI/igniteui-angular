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
    }).done((data) =>  {
        let folders = data.folders;
        const select = $('#versions');
        folders = folders.reverse();

        folders.forEach(f => {
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

    $('#versions').on('change', (...rest) => {
        const val = $('#versions').val();
        sessionStorage.sassOption = val;
        window.location.assign(val);
    });
})();
