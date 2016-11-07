(function ($) {

    /** 
     *  @description Serialize form as json object
     */
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

    /**
     * Dropzone's method to configure files during upload  
     * @fires Dropzone#upload
     */
    Dropzone.options.upload = {
        acceptedFiles: ".json",
        init: function () {
            this.options.addRemoveLinks = true;
            this.options.dictRemoveFile = "Delete";

            /**
             * Event for a successfull upload file
             * @event Dropzone#success
             */
            this.on('success', function (file, resp) {

                var text = JSON.parse(resp); // takes content of the file in the response

                if (!setJSONInput(text)) {
                    var config = JSON.stringify(text);
                    var editor = ace.edit("editor");
                    editor.setValue(config); // set value of the file in text editor
                }

            });

        },

    };

})(jQuery);

/**
 * set up ace editor
 */
var editor = ace.edit("editor");
ace.config.set("packaged", true);
var path = "js/ace/mode";
ace.config.set("modePath", path);
editor.session.setMode("asp");
editor.setTheme("ace/theme/tomorrow");
editor.setValue("");
editor.resize();

/**
 * active tooltip bootstrap
 */
$('[data-toggle="tooltip"]').tooltip();

$(document).ready(function () {

    setHeightComponents();

    /**
     * fix minWidth layout
     */
    $('body > .container > form > .layout').layout({
        center__minWidth: 600,
        east__minSize: 250
    });


    $('.dropdown-menu-choise').find('a').click(function (e) {
        var concept = $(this).text();
        $('#choise').text(concept); // append to the DOM the choise for download
    });

    /**
     * @global
     * @description id of the clicked button 'submit'  
     */
    var clkBtn = "";

    $('button[type="submit"]').click(function (evt) {
        clkBtn = evt.target.id;
    });

    $('#input').submit(function (e) {
        e.preventDefault();
        var text = editor.getValue();
        $('#program').val(text); // insert the content of text editor in a hidden input text to serailize
        $('#output').removeAttr('name');
        var form;
        if (clkBtn === "run") {
            configureOptions();
            form = $('#input').serializeFormJSON();
            destroyOptions();
            var socket = io.connect();
            socket.emit('run', JSON.stringify(form));
            socket.on('output', function (response) {
                if (response.error === "") {
                    $('#output').val(response.model); // append the response in the textarea 
                    $('#output').css('color', 'black');
                } else {
                    $('#output').val(response.error);
                    $('#output').css('color', 'red');
                }
            });

        } else if (clkBtn === 'btn-download') {
            $('#output').attr('name', 'output');
            form = $('#input').serializeFormJSON();
            var stringify = JSON.stringify(form);
            var chose = $('#choise').text(); // returns the value of what to download and place the value of the text editor into a 'text' variable 
            createFileToDownload(stringify);
        }

    });

    /**
     * @param {string} text - json configuration to be saved
     * @description Create a new Blob that contains the data from your form feild, then create a link object to attach the file to download
     */

    function createFileToDownload(text) {
        var textFileAsBlob = new Blob([text], {

            type: 'application/json'
        });
        /**
         * specify the name of the file to be saved
         */
        var fileNameToSaveAs = "Config.json";
        var downloadLink = document.createElement("a");

        /**
         * supply the name of the file
         */
        downloadLink.download = fileNameToSaveAs;

        /**
         * allow code to work in webkit & Gecko based browsers without the need for a if / else block.
         */
        window.URL = window.URL || window.webkitURL;
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);

        /**
         * when link is clicked, call the function to remove it from the DOM in case user wants to save a second file
         */
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }
    /**
     * @param {Object} event - reference to the object that dispatched the event
     * @description Remove the link from the DOM 
     */
    function destroyClickedElement(event) {
        document.body.removeChild(event.target);
    }

    $("#btn-option").click(function () {

        $('.left-panel').toggleClass('left-panel-show'); // add class 'left-panel-show' to increase the width of the left panel

        $('.option-solver > div').toggleClass("hidden show"); // add class to show option components
    });

});


$(document).on('click', '.btn-add-option', function () {
    addOptionDOM($(this));

});

$(document).on('click', '.btn-del-option', function () {
    delOptionDOM($(this));

});

$(document).on('click', '.btn-del-value', function () {
    deleteInputValue($(this));

});

$(document).on('click', '.btn-add', function () {
    addInpuValue($(this));

});

$(document).on('click', '.btn-info-value', function () {
    addInpuValue($(this));


});

/**
 * @param optionClassBtn - class of the clicked button to find the closest row 
 * @description Delete from the DOM an option block and iterates all of the form options to change their 'name' for a correct json format (if present, included input value)
 */
function delOptionDOM(optionClassBtn) {
    var row = $(optionClassBtn).closest('.row-option');
    row.empty(); //delete option container
    $('.form-control-option').each(function (index) {
        $(this).attr('name', 'option[' + index + '][name]');

        $(this).closest('.row-option').find('.form-control-value').each(function (index2) {
            $(this).attr('name', 'option[' + index + '][value][]');

        });
    });
}

/**
 * @param optionClassBtn - class of the clicked button to find the closest row 
 * @description Clone the closest row with the option select to add it to the DOM and change 'name' with the correct value for json format
 */
function addOptionDOM(optionClassBtn) {
    var row = $(optionClassBtn).closest('.row-option');
    var clone = row.clone();
    var lenghtClass = $('.opname').length;
    $(clone).insertAfter(row);
    var cloneOpname = $(clone).find('.opname');
    if (lenghtClass > 0) {
        $(cloneOpname).find('.btn-del-option').remove();

        $(cloneOpname).prepend('<span class="input-group-btn btn-del-option"><button type="button" class="btn btn-danger">-</button></span>'); //append button delete after first option block
    }
    $(clone).find('.form-control-option').attr('name', 'option[' + lenghtClass + '][name]');
    var inputValueClone = $(clone).find('.input-group-value');

    $(inputValueClone).remove(); // remove all input value forms

    clone.find($('.center-btn-value')).remove(); // remove button to add input value, if present 
    inputValueClone = '<div class="text-center center-btn-value"><button type="button" class="btn btn-info btn-info-value ">Add value</button></div>';

    $(clone).find('.option-value').append(inputValueClone); // append only one input value in the new option container
}

/**
 * @param inputClass - class of the clicked button to find the closest row
 * @description Delete input value to the DOM and if the lenght of the class is equal to one, append the button to add input value
 */
function deleteInputValue(inputClass) {
    var inputValue = $(inputClass).closest('.input-group-value');
    var closestRow = inputValue.closest('.row-option');
    var lenghtInputValue = closestRow.find('.input-group-value').length;
    if (lenghtInputValue === 1) {
        closestRow.find('.option-value').append('<div class="text-center center-btn-value"><button type="button" class="btn btn-info btn-info-value ">Add value</button></div>');
    }
    inputValue.remove();
}

/**
 * @param inputClass - class of the clicked button to find the closest row
 * @description Add the input type to a correct class parent
 */
function addInpuValue(inputClass) {
    var optionValue = $(inputClass).closest('.option-value');
    var currentName = $(inputClass).closest('.row-option').find('.form-control-option').attr('name');

    /**
     * replace 'name' in 'value' for correct json format
     * @example currentName=option[0][name] , replaceName=option[0][value][] 
     */
    var replaceName = currentName.replace('name', 'value');
    replaceName += '[]';
    var clone = '<div class="form-group input-group input-group-value"><span class="input-group-btn"><button type="button" class="btn btn-danger btn-del-value">-</button></span> <input type="text"class="form-control form-control-value" name=' + replaceName + '> <span class="input-group-btn"><button type="button" class="btn btn-default btn-add">+</button></span></div>';
    $(optionValue).append(clone);
    $(inputClass).closest('.center-btn-value').remove();
}

/**
 * @class
 * @classdesc Creates dlv's options
 */
function OptionDLV() {
    /**
     * bidirectional map
     * @type {Object}
     * @memberof OptionDLV#
     */
    this.map = new BiMap();

    /**
     * Add into the object map the value of dlv's options
     * @memberof OptionDLV#
     */
    this.init = function () {
        this.map.push("filter", "-filter=");
        this.map.push("nofacts", "-nofacts");
        this.map.push("silent", "-silent");
    };

}

/**
 * @description Based on the value 'engine', it creates a hidden option temporary with the corresponding value of the option name to set the value of the select option
 */
function configureOptions() {
    var engine = $('#inputengine').val();
    switch (engine) {
        case 'dlv':
            var optionDLV = new OptionDLV();
            optionDLV.init();
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

/**
 * @description Destroy the temporary options and set the select option to the original value
 */
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

/**
 * @param {Object} text - configuration in json format
 * @returns {boolean} 
 * @description check if the configration file has the correct property to set. If not, return false and display the content of the file in the text editor   
 */
function setJSONInput(config) {
    if (config.hasOwnProperty('language') || config.hasOwnProperty('engine') || config.hasOwnProperty('option') || config.hasOwnProperty('program') || config.hasOwnProperty('output')) {
        var editor = ace.edit("editor");
        var text = config.program;
        editor.setValue(text);
        $('#inputLanguage').val(config.language).change();
        $('#inputengine').val(config.engine).change();
        $('#output').val(config.output);
        var obj = config;
        var currentClass;
        if (config.hasOwnProperty('option')) {
            $('.row-option').each(function (index) {
                $(this).remove();
            });
        }

        $(obj.option).each(function (indexInArray, item) { // create option's form
            addOption(indexInArray, item.name);
            if (item['value']) {
                currentClass = $('.option-value').eq(indexInArray);
                $(item.value).each(function (indexInArray, itemValue) {
                    addInpuValue(currentClass);
                    $('.input-group-value').last().find('.form-control-value').val(itemValue);
                });
            }

        });

        $('.row-option').each(function (index) { // add delete button after first option
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

/**
 * @param {number} index - Item number Created
 * @param {string} valueOption - option's value
 * @description creates a option's form and append it to the DOM with the corresponding value
 */
function addOption(index, valueOption) {
    var clone = '<div class="row row-option"><div class="col-sm-12"><div class="form-group"><label for="option" class="col-sm-12 text-center">Options</label><div class="input-group opname"><select id="op' + index + '" name="option[' + index + '][name]" class="form-control form-control-option"><option value="option">Option</option><option value="filter">Filter</option><option value="nofacts">Nofacts</option><option value="silent">Silent</option></select><span class="input-group-btn btn-add-option"><button type="button" class="btn btn-default">+</button></span></div></div><div class="option-value"><div class="text-center center-btn-value"><button type="button" class="btn btn-info btn-info-value ">Add value</button></div></div></div></div>';
    $('.show').append(clone);
    $('.hidden').append(clone);
    var id = "#op" + index;
    $(id).val(valueOption).change();

}

/**
 * @description set the height of the components with the height of your browser
 */
function setHeightComponents() {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // cross-browser solution
    var navbarHeight = $('.navbar').outerHeight(true);

    $('.left-panel').css('height', height - navbarHeight);
    $('.layout').css('height', height - navbarHeight);

}