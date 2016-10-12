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
    $('#download-button').click(function (e) {
        require(["ace/ace"], function (ace, text) {
            var editor = ace.edit("editor");
            text = editor.getValue();

            var textFileAsBlob = new Blob([text], {
                type: 'text/plain'
            });
            var fileNameToSaveAs = "myFile.txt";
            var downloadLink = document.createElement("a");
            downloadLink.download = fileNameToSaveAs;
            window.URL = window.URL || window.webkitURL;
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
            downloadLink.click();
        });



    });

    function destroyClickedElement(event) {
        // remove the link from the DOM
        document.body.removeChild(event.target);
    }
});