(function() {
    $.ajax({
        url: "http://10.14.0.51/test.json",
        type: "get",
        xhrFields: {
            withCredentials: false
        }
    }).done(function(data) {
        const folders = data.folders;
        const select = $('#versions')
        folders.forEach(f => {
            select.append($('<option>', {
                value: f,
                text: f
            }));
        });
    });
})();
