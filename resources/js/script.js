(function ($) {


    $.fn.serializeFormJSON = function () { //pattern to serialize form as json object 
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
var editor = ace.edit("editor");
ace.config.set("packaged", true);
var path = "ace/mode";
ace.config.set("modePath", path);
editor.session.setMode("asp");
editor.setTheme("ace/theme/tomorrow");
editor.setValue("");
editor.resize();
$('[data-toggle="tooltip"]').tooltip(); //active tooltip bootstrap

$(document).ready(function () {

    $('#upload-file').fileinput({
        allowedFileExtensions: ["json"],
        elErrorContainer: "#errorBlock"
    });

    var a = $('body > form > .container > .layout').layout({ //fix minWidth layout
        center__minWidth: 600,
        east__minSize: 250
    });


    function destroyClickedElement(event) {
        document.body.removeChild(event.target); // remove the link from the DOM
    }
    $('.dropdown-menu-choise').find('a').click(function (e) {
        var concept = $(this).text();
        $('#choise').text(concept); //append to the DOM the choise for download
    });

    var clkBtn = "";
    $('button[type="submit"]').click(function (evt) {
        clkBtn = evt.target.id;
    });

    $('#input').submit(function (e) {
        e.preventDefault();
        var text = editor.getValue();
        $('#output').removeAttr('name');
        var form;
        if (clkBtn === "run") {
            configureOptions();
            $('#program').val(text); //insert the content of text editor in a hidden input text to serailize
            form = $('#input').serializeFormJSON();
            destroyOptions();
            $.ajax({
                type: "POST",
                url: "/run",
                data: form,
                dataType: "JSON",
                success: function (response) {
                    if (response.error === "") {
                        $('#output').val(response.model); //append the response in the textarea 
                        $('#output').css('color', 'black');
                    } else {
                        $('#output').val(response.error);
                        $('#output').css('color', 'red');
                    }
                }
            });
        } else if (clkBtn === 'btn-download') {
            $('#output').attr('name', 'output');
            form = $('#input').serializeFormJSON();
            var stringify = JSON.stringify(form);
            var chose = $('#choise').text(); //returns the value of what to download and place the value of the text editor into a 'text' variable 
            var textFileAsBlob = new Blob([stringify], { // create a new Blob (html5 magic) that conatins the data from your form feild

                type: 'application/json'
            });
            var fileNameToSaveAs = "myFile.json"; // Specify the name of the file to be saved
            var downloadLink = document.createElement("a"); // create a link for our script to 'click'
            downloadLink.download = fileNameToSaveAs; //  supply the name of the file
            window.URL = window.URL || window.webkitURL; // allow code to work in webkit & Gecko based browsers without the need for a if / else block.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob); // Create the link Object.
            downloadLink.onclick = destroyClickedElement; // when link is clicked call a function to remove it from the DOM in case user wants to save a second file.
            downloadLink.style.display = "none"; // make sure the link is hidden.
            document.body.appendChild(downloadLink); // add the link to the DOM
            downloadLink.click(); // click the new link
        } else {
            var fileToLoad = document.getElementById("upload-file").files[0]; //takes the uploaded file
            var reader = new FileReader(); // constructed FileReader
            reader.onload = function (event) {
                var text = JSON.parse(event.target.result); //takes content of the file

                if (!setJSONInput(text)) {
                    var gatta = JSON.stringify(text);
                    var editor = ace.edit("editor");
                    editor.setValue(gatta); //set value of the file in text editor
                }

            };
            reader.readAsText(fileToLoad, "UTF-8"); //access to the file as text


            //}
        }

    });

    $("#slide").click(function (e) {
        $('.left-panel').toggleClass('left-panel-show'); //add class 'left-panel-show' to increase the width of the left panel 
        $('.option-solver > div').toggleClass("hidden show"); //add class to show option components
    });

});


$(document).on('click', '.btn-add-option', function () {
    var row = $(this).closest('.row-option');
    var clone = row.clone(); //clone div .row-option to add another option
    var lenghtClass = $('.opname').length; //count number of classes to correct json format 
    $(clone).insertAfter(row);
    var cloneOpname = $(clone).find('.opname');
    if (lenghtClass > 0) {
        $(cloneOpname).find('.btn-del-option').remove();
        $(cloneOpname).prepend('<span class="input-group-btn btn-del-option"><button type="button" class="btn btn-danger">-</button></span>'); //append button delete after first options block
    }
    $(clone).find('.form-control-option').attr('name', 'option[' + lenghtClass + '][name]');
    var inputValueClone = $(clone).find('.input-group-value');
    $(inputValueClone).remove(); //remove all input value forms
    clone.find($('.center-btn-value')).remove(); //remove eventually button to add input value
    inputValueClone = '<div class="text-center center-btn-value"><button type="button" class="btn btn-info btn-info-value ">Add value</button></div>';
    $(clone).find('.option-value').append(inputValueClone); //append only one input value in the new options block

});

$(document).on('click', '.btn-del-option', function () {
    var row = $(this).closest('.row-option');
    row.empty(); //delete option container
    $('.form-control-option').each(function (index) { //iterate over '.form-control-option' classes to change the number of the object options for correct json format   
        $(this).attr('name', 'option[' + index + '][name]');

        $(this).closest('.row-option').find('.form-control-value').each(function (index2) { //iterate over '.form-control-value' classes to change the number of the objects value for correct json format   
            $(this).attr('name', 'option[' + index + '][value][]');

        });
    });

});

$(document).on('click', '.btn-del-value', function () { //delete input value
    var inputValue = $(this).closest('.input-group-value');
    var closestRow = inputValue.closest('.row-option');
    var lenghtInputValue = closestRow.find('.input-group-value').length; //count number of class '.input-group-value'
    if (lenghtInputValue === 1) //if the lenght of the class is equal to one, append the button to add input value 
    {
        closestRow.find('.option-value').append('<div class="text-center center-btn-value"><button type="button" class="btn btn-info btn-info-value ">Add value</button></div>');
    }
    inputValue.remove(); //remove input value

});

$(document).on('click', '.btn-add', function () {
    addInpuValue($(this));

});

$(document).on('click', '.btn-info-value', function () {
    addInpuValue($(this));


});

function addInpuValue(inputClass) {
    var optionValue = $(inputClass).closest('.option-value');
    var currentName = $(inputClass).closest('.row-option').find('.form-control-option').attr('name');
    var replaceName = currentName.replace('name', 'value'); //replace 'name' in 'value' for correct json format   
    replaceName += '[]';
    var clone = '<div class="form-group input-group input-group-value"><span class="input-group-btn"><button type="button" class="btn btn-danger btn-del-value">-</button></span> <input type="text"class="form-control form-control-value" name=' + replaceName + '> <span class="input-group-btn"><button type="button" class="btn btn-default btn-add">+</button></span></div>';
    $(optionValue).append(clone); //append form input value to the DOM
    $(inputClass).find('.center-btn-value').remove();
    $(inputClass).closest('.center-btn-value').remove();
}

function OptionDLV() {
    this.map = new BiMap();
    this.init = function () {
        this.map.push("filter", "-filter=");
        this.map.push("nofacts", "-nofacts");
        this.map.push("silent", "-silent");
    };

}

function configureOptions() {
    var optionDLV = new OptionDLV();
    optionDLV.init();
    var engine = $('#inputengine').val();
    switch (engine) {
        case 'dlv':
            $('.form-control-option').each(function (indexInArray) {
                var currentVal = $(this).val();
                if (currentVal !== "option") {
                    var val = optionDLV.map.key(currentVal);
                    $(this).append('<option value="' + val + '"></option>');
                    $(this).val(val);
                }
            });
            break;

        default:
            break;
    }
}

function destroyOptions() {
    var optionDLV = new OptionDLV();
    optionDLV.init();
    $('.form-control-option').each(function (indexInArray) {
        var currentVal = $(this).val();
        if (currentVal !== "option") {
            var val = optionDLV.map.val(currentVal);
            $(this).val(val).change();
            $(this).find('option[value="' + currentVal + '"]').remove();
        }
    });
}

function setJSONInput(text) {
    if (text.hasOwnProperty('language') && text.hasOwnProperty('engine') && text.hasOwnProperty('option') && text.hasOwnProperty('program') && text.hasOwnProperty('output')) {
        var editor = ace.edit("editor");
        var t = text.program;
        editor.setValue(t);
        $('#inputLanguage').val(text.language).change();
        $('#inputengine').val(text.engine).change();
        $('#output').val(text.output);
        var obj = text;
        var currentClass;
        $('.row-option').each(function (index) {
            $(this).remove();
        });
        $(obj.option).each(function (indexInArray, item) {
            addOption(indexInArray, item.name);
            if (item['value']) {
                currentClass = $('.option-value').eq(indexInArray);
                $(item.value).each(function (indexInArray, itemValue) {
                    addInpuValue(currentClass);
                    $('.input-group-value').last().find('.form-control-value').val(itemValue);
                });
            }

        });
        $('.row-option').each(function (index) {
            if (index > 0) {
                var cloneOpname = $(this).find('.opname');
                $(cloneOpname).prepend('<span class="input-group-btn btn-del-option"><button type="button" class="btn btn-danger">-</button></span>');
            }
        });

        return true;
    } else {
        return false;
    }
}

function addOption(index, valueOption) {
    var clone = '<div class="row row-option"><div class="col-sm-12"><div class="form-group"><label for="option" class="col-sm-12 text-center">Options</label><div class="input-group opname"><select id="op' + index + '" name="option[' + index + '][name]" class="form-control form-control-option"><option value="option">Option</option><option value="filter">Filter</option><option value="nofacts">Nofacts</option><option value="silent">Silent</option></select><span class="input-group-btn btn-add-option"><button type="button" class="btn btn-default">+</button></span></div></div><div class="option-value"><div class="text-center center-btn-value"><button type="button" class="btn btn-info btn-info-value ">Add value</button></div></div></div></div>';
    $('.show').append(clone);
    $('.hidden').append(clone);
    if (index >= 1) {

    }
    var id = "#op" + index;
    $(id).val(valueOption).change();

}