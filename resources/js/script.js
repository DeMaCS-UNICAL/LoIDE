(function ($) {


    $.fn.serializeFormJSON = function () {
        var self = this,
            json = {},
            push_counters = {},
            patterns = {
                "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                "key": /[a-zA-Z0-9_]+|(?=\[\])/g,
                "push": /^$/,
                "fixed": /^\d+$/,
                "named": /^[a-zA-Z0-9_]+$/
            };


        this.build = function (base, key, value) {
            base[key] = value;
            return base;
        };

        this.push_counter = function (key) {
            if (push_counters[key] === undefined) {
                push_counters[key] = 0;
            }
            return push_counters[key]++;
        };

        $.each($(this).serializeArray(), function () {

            // skip invalid keys
            if (!patterns.validate.test(this.name)) {
                return;
            }

            var k,
                keys = this.name.match(patterns.key),
                merge = this.value,
                reverse_key = this.name;

            while ((k = keys.pop()) !== undefined) {

                // adjust reverse_key
                reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                // push
                if (k.match(patterns.push)) {
                    merge = self.build([], self.push_counter(reverse_key), merge);
                }

                // fixed
                else if (k.match(patterns.fixed)) {
                    merge = self.build([], k, merge);
                }

                // named
                else if (k.match(patterns.named)) {
                    merge = self.build({}, k, merge);
                }
            }

            json = $.extend(true, json, merge);
        });

        return json;
    };
})(jQuery);
require.config({
    baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/"),
    paths: {
        ace: "ace/lib/ace"
    }
});
require(["ace/ace"], function (ace) {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow");
    editor.setValue("");
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
        var chose = $('#chose').text();
        console.log(chose);
       if (chose !== ""){ 
        require(["ace/ace"], function (ace, text) {
            var chose = $('#chose').text();
            var editor = ace.edit("editor");
            if (chose === "Input") {
                text = editor.getValue();

            } else if (chose === "Output") {
                text = $('#output').val();
            } else if (chose === "Both") {
                text = editor.getValue();
                text += '\n';
                text += '\n';
                text+='Output\n';
                text+='\n';
                text += text = $('#output').val();
            }

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

       }
    });
    $('.btn-download .dropdown-menu').find('a').click(function (e) {
        var concept = $(this).text();
        $('#chose').text(concept);


    });

    function destroyClickedElement(event) {
        document.body.removeChild(event.target);
    }

    $('#input').submit(function (e) {
        e.preventDefault();

        require(["ace/ace"], function (ace) {
            var editor = ace.edit("editor");
            var text = editor.getValue();
            $('#program').val(text);
            console.log(text);
            var form = $('#input').serializeFormJSON();
            $.ajax({
                type: "POST",
                url: "/run",
                data: form,
                dataType: "JSON",
                crossDomain: true,
                useDefaultXhrHeader: false,
                success: function (response) {
                    console.log(response);
                }
            });

        });




    });

});


$(document).on('click', '.option', function (e) {
    var c = $(this).closest('.div-c');
    var clone = c.clone();
    var n = $('.opname').length;
    $(clone).insertAfter(c);
    console.log(n);
    $(clone).find('.sel').attr('name', 'option[' + n + '][name]');
    $(clone).find('.in').attr('name', 'option[' + n + '][value][]');



});
$(document).on('click', '.btn-add', function (e) {

    var c = $(this).closest('.option-value');
    var clone = c.clone();
    var n = $('.opname').length;
    a = n - 1;
    $(clone).insertAfter(c);
    $(clone).find('.in').attr('name', 'option[' + a + '][value][]');






});