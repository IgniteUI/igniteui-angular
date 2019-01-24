(function () {
    const baseUrl = $('body').data('base-url');

    $.ajax({
        url: "http://bg.test.download.infragistics.local/products/infragistics/IgniteUI/test.json",
        type: "get",
        contentType: 'application/json',
        xhrFields: {
            withCredentials: false
        }
    }).done((data) =>  {
        const folders = data.folders;
        const select = $('#versions')

        folders.forEach(f => {
            select.append($('<option>', {
                value: `${baseUrl}/angular-docs/${f}/sass`,
                text: f
            }));
        });

        if (sessionStorage.apiVersion) {
            select.val(sessionStorage.apiVersion);
        }
    });

    $('#versions').on('change', (...rest) => {
        const val = $('#versions').val();
        sessionStorage.apiVersion = val;
        window.location.replace(val);
    });
})();
