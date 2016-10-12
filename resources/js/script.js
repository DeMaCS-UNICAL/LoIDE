require.config({
    baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/"),
    paths: {
        ace: "ace/lib/ace"
    }
});
require(["ace/ace"], function (ace) {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow");
    editor.getSession().setMode("ace/mode/Asp");

});
$(document).ready(function () {
    $('.fileinput-upload-button').click(function (e) {
        var fileToLoad = document.getElementById("vvv").files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            var text = event.target.result;
            require(["ace/ace"], function (ace) {
                var editor = ace.edit("editor");
                editor.setValue(text);

            });

        };
        reader.readAsText(fileToLoad, "UTF-8");

    });
});