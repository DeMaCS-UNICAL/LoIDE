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
     * @global
     * @description place object layout
     */
    var layout;


})(jQuery);

/**
 * @param {json} result - description of the problem 
 * @description Open a container to display the result 
 */
function operation_alert(result) {
    $("#result-auto-close-alert").focus();
    $("#result-alert-text").html("<strong>" + result.reason + "</strong>");
    $("#result-auto-close-alert").removeClass("hidden").addClass("alert-danger fade in");
    $("#result-auto-close-alert").fadeTo(1500, 750).slideUp(800, function () {
        $(this).removeClass("alert-danger fade in");
    });
}

/**
 * @global
 * @description place the id of the current shown editor 
 */
var idEditor = 'editor1';
/**
 * set up ace editors into object
 */
editors = {};
setUpAce(idEditor, "");


$('.modal').modal({
    backdrop: false,
    show: false
});

/**
 * set autofocus in modal
 */
$('.modal').on('shown.bs.modal', function () {
    $('#myInput').focus();
});

/**
 * active tooltip bootstrap
 */
$('[data-toggle="tooltip"]').tooltip();

window.onbeforeunload = function () {
    $('#save-options').trigger('click');
    if ($('#run-dot').prop('checked')) {
        if (!saveOption("run-auto", "true")) {
            alert("Sorry, this options will not save in your browser");
        }
    } else {
        if (!saveOption("run-auto", "false")) {
            alert("Sorry, this options will not save in your browser");
        }
    }
};

$(window).resize(function () {
    var currentVal;
    if (window.innerWidth > 450) {
        layout.removePane("south");
        currentVal = $('#output').val();
        $(".ui-layout-south").empty();
        layout.addPane("east");
        createTextArea($('.ui-layout-east'));
        $('#output').val(currentVal);
    } else {
        layout.removePane("east");
        currentVal = $('#output').val();
        $(".ui-layout-east").empty();
        layout.addPane("south");
        createTextArea($('.ui-layout-south'));
        $('#output').val(currentVal);
        $('#split').children().attr('class', 'glyphicon glyphicon-menu-up');
        $('#split').attr('id', 'split-up');
    }
    setHeightComponents();
    var length = $(".nav-tabs").children().length;
    for (var index = 1; index <= length - 1; index++) {
        var idE = "editor" + index;
        editors[idE].resize();
    }
});

$(document).ready(function () {

    inizializeShortcuts();

    restoreOptions();

    $('#font-output').change(function (e) {
        var size = $(this).val();
        $('#output').css('font-size', size + "px");
        if (!saveOption("fontSizeO", size)) {
            alert("Sorry, this options will not save in your browser");
        }
    });

    $('#font-editor').change(function (e) {
        var size = $(this).val();
        setFontSizeEditors(size);
        if (!saveOption("fontSizeE", size)) {
            alert("Sorry, this options will not save in your browser");
        }
    });

    $('#theme').change(function (e) {
        var theme = $(this).val();
        setTheme(theme);
        if (!saveOption("theme", theme)) {
            alert("Sorry, this options will not save in your browser");
        }
    });

    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    $(':checkbox[value="editor1"]').prop('checked', true);

    $("[rel='tooltip']").tooltip();

    /**
     * Hidden tooltip when button is clicked
     */
    $('[data-toggle="tooltip"]').on('click', function () {
        $(this).tooltip('hide');
    });
    $('[rel="tooltip"]').on('click', function () {
        $(this).tooltip('hide');
    });

    $('#btn-upload').on('click', function () {
        var expandend = $('#upload-container').attr('aria-expanded');
        if (expandend == 'false') {
            setHeightComponents(expandend);
        } else {
            setHeightComponents();
        }


    });

    layout = $('body > .container > form > .layout').layout({
        onresize_end: function () {
            var length = $(".nav-tabs").children().length;
            for (var index = 1; index <= length - 1; index++) {
                var idE = "editor" + index;
                editors[idE].resize();
            }
        },
        south__minSize: 125

    });
    if (window.innerWidth > 450) {
        layout.removePane("south");
    } else {
        layout.removePane("east");
        var currentVal = $('#output').val();
        $(".ui-layout-east").empty();
        layout.addPane("south");
        createTextArea($('.ui-layout-south'));
        $('#output').val(currentVal);
        $('#split').children().attr('class', 'glyphicon glyphicon-menu-up');
        $('#split').attr('id', 'split-up');
    }

    $('.dropdown-menu-choice').find('a').click(function (e) {
        var concept = $(this).text();
        $('#choice').text(concept); // append to the DOM the choice for download
        var stringify, form, chose;
        if (concept === 'Input') {
            addProgramsToDownload();
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            chose = $('#choice').text(); // returns the value of what to download and place the value of the text editor into a 'text' variable 
            createFileToDownload(stringify);
            destroyPrograms();
        } else {
            $('#program').removeAttr('name', 'program[0]');
            $('#output').attr('name', 'output');
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            chose = $('#choice').text();
            createFileToDownload(stringify);
            $('#program').attr('name', 'program[0]');
            $('#output').removeAttr('name', 'output');
        }
        $('#choice').text("");
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
        var form;
        var stringify;
        if (clkBtn === "run") {
            callSocketServer();

        } else if (clkBtn === 'btn-download') {
            addProgramsToDownload();
            $('#output').attr('name', 'output');
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            var chose = $('#choice').text(); // returns the value of what to download and place the value of the text editor into a 'text' variable 
            createFileToDownload(stringify);
            $('#output').removeAttr('name');
            destroyPrograms();

        } else if (clkBtn === 'save-options') {
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            if (!saveOption("solverOptions", stringify)) {
                alert("Sorry, this options will not save in your browser");
            }

        }

    });

    $("#btn-option").click(function () {

        $('.left-panel').toggleClass('left-panel-show'); // add class 'left-panel-show' to increase the width of the left panel

        $('.option-solver > div').toggleClass("hidden show"); // add class to show option components

    });

});

/**
 * @description Serialize form and send it to socket server and waits for the response
 */
function callSocketServer() {
    configureOptions();
    if (!addMorePrograms()) {
        var text = editors[idEditor].getValue();
        $('#program').val(text); // insert the content of text editor in a hidden input text to serailize
    }
    var form = $('#input').serializeFormJSON();
    destroyPrograms();
    destroyOptions();
    var socket = io.connect();
    socket.emit('run', JSON.stringify(form));
    socket.on('problem', function (response) {
        operation_alert(response);
        console.log(response); // debug string 
    });
    socket.on('output', function (response) {
        if (response.error === "") {
            $('#output').val(response.model); // append the response in the textarea 
            $('#output').css('color', 'black');
        } else {
            $('#output').val(response.error);
            $('#output').css('color', 'red');
        }
    });
}

/**
 * @description Trigger a 'run' button to execute the program
 */
function intervalRun() {
    $('#run').trigger('click');
}

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

$(document).on('click', '.btn-add-option', function () {
    addOptionDOM($(this));
    $(this).empty();
});

$(document).on('click', '.btn-del-option', function () {
    $(this).parent().parent().parent().parent().prev().find(".btn-add-option").append('<button type="button" class="btn btn-default">+</button>');
    delOptionDOM($(this));
});

$(document).on('click', '.btn-del-value', function () {
    if ($(this).parent().parent().is(":last-child")) {
        $(this).parent().parent().prev().find(".input-group-btn").last().append('<button type="button" class="btn btn-default btn-add">+</button>');
    }
    deleteInputValue($(this));
});

$(document).on('click', '.btn-add', function () {
    addInpuValue($(this));
    $(this).parent().empty();
});

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    currentTab = e.target;
    idTab = $(currentTab).attr('data-target');
    idEditor = $(idTab).find('.ace').attr("id");
});

$(document).on('click', '#split', function () {
    layout.removePane("east");
    var currentVal = $('#output').val();
    $(this).parent().empty();
    layout.addPane("south");
    createTextArea($('.ui-layout-south'));
    $('#output').val(currentVal);
    $('#split').children().attr('class', 'glyphicon glyphicon-menu-up');
    $('#split').attr('id', 'split-up');
});

$(document).on('click', '#split-up', function () {
    layout.removePane("south");
    var currentVal = $('#output').val();
    $(this).parent().empty();
    layout.addPane("east");
    createTextArea($('.ui-layout-east'));
    $('#output').val(currentVal);
});

$(document).on('change', '#inputengine', function () {
    var val = $(this).val();
    if (val === "clingo") {
        $('.form-control-option').each(function (index, element) {
            $(this).find("option").each(function (index, element) {
                if ($(this).val() !== "free choice" && $(this).val() !== "")
                    $(this).remove();
            });
            if ($(this).val() !== 'free choice')
                $(this).val("").change();
        });

    } else {
        $('.form-control-option').append('</option><option value="filter">Filter</option><option value="nofacts">Nofacts</option><option value="silent">Silent</option><option value="query">Query</option>');
    }
});

$(document).on('change', '.form-control-option', function () { //add or remove the 'input type value' based on the option
    var val = $(this).val();
    if (val === 'free choice' || val === 'filter') {
        if (($(this).closest('.row-option').find('.option-value').find('.input-group-value').length) <= 0)
            addInpuValue($(this).closest('.row-option'));
    } else {
        $(this).closest('.row-option').find('.option-value').remove();
        $(this).closest('.col-sm-12').append("<div class='option-value'></div>");
    }

});
$(document).on('click', '.add-tab', function () { // add new tab 
    var tabID = addTab($(this), "");
    $("[data-target='#" + tabID + "']").trigger('click'); //active last tab inserted
});

$(document).on('click', '.delete-tab', function () { // delete tab
    var r = confirm("Are you sure you want to delete this file? This cannot be undone.");
    var ids = $(".nav-tabs").children().length - 1;
    var t = $(this).parent().attr('data-target');
    var currentids = $(t).find(".ace").attr("id").substr(6);
    var parse = parseInt(currentids);
    if (r) {
        var prevEditor = $(this).parent().parent().prev();
        if (prevEditor.size() === 0) {
            prevEditor = $(this).parent().parent().next();
        }
        var currentID = $(this).closest('a').attr('data-target');
        $(this).parent().parent().remove();
        var ideditor = $(currentID).find('.ace').attr("id");
        $(currentID).remove();
        delete editors[ideditor];
        $("[data-target='" + prevEditor.find("a").attr("data-target") + "']").trigger('click');
        $($(':checkbox[value="' + ideditor + '"]')).parent().remove();
        if ($(".nav-tabs").children().length === 1) { // add a new tab if we delete the last
            var parent = $('.add-tab').parent();
            idEditor = 'editor1';
            ideditor = 'editor1';
            $('<li role="presentation"><a data-target="#tab1" role="tab" data-toggle="tab">Tab1 <span class="delete-tab"> <i class="fa fa-times"></i> </span> </a> </li>').insertBefore(parent);
            $('.tab-content').append('<div role="tabpanel" class="tab-pane fade" id="tab1"><div id="editor1" class="ace"></div></div>');
            editors[ideditor] = new ace.edit(ideditor);
            setUpAce(ideditor, "");
            $('#tab-execute').append(' <label><input type="checkbox" value="' + ideditor + '"> Tab1</label>');
            $(':checkbox[value="editor1"]').prop('checked', true);
            $("[data-target='#tab1']").trigger('click');
        } else if (ids !== parse) { // renumber tabs if you delete the previous tab instead of the current one
            $('.nav-tabs').find('li:not(:last)').each(function (index) {
                $(this).find('a').text('Tab' + (index + 1));
                $(this).find('a').append('<span class="delete-tab"> <i class="fa fa-times"></i> </span>');
            });
            $('.tab-content').find("[role='tabpanel']").each(function (index) {
                ideditor = 'editor' + (index + 1);
                var currentEditor = $(this).find('.ace').attr('id');
                if (ideditor !== currentEditor) {
                    $(this).find('.ace').attr("id", ideditor);
                    editors[ideditor] = editors[currentEditor];
                    delete editors[currentEditor];
                    var parent = $(':checkbox[value="' + currentEditor + '"]').parent().empty();
                    $(parent).append('<input type="checkbox" value="' + ideditor + '">Tab' + (index + 1));
                }
            });
        }
        if ($(".nav-tabs").children().length === 2) {
            $(':checkbox[value="editor1"]').prop('checked', true);
            idEditor = "editor1";
        }
    }
});

/**
 * @param optionClassBtn - class of the clicked button to find the closest row 
 * @description Delete from the DOM an option block and iterates all of the form options to change their 'name' for a correct json format (if present, included input value)
 */
function delOptionDOM(optionClassBtn) {
    var row = $(optionClassBtn).closest('.row-option');
    row.empty(); //delete option container
    row.remove();
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
    lenghtClass -= 1;
    $(clone).find('.form-control-option').attr('name', 'option[' + lenghtClass + '][name]');
    var inputValueClone = $(clone).find('.input-group-value');

    $(inputValueClone).remove(); // remove all input value forms

    clone.find($('.center-btn-value')).remove(); // remove button to add input value, if present 
    if ($(clone).find('.form-control-option').val() === 'free choice') {
        addInpuValue($(clone).find('.form-control-option').closest('.row-option'));
    }
    clone.find('label').empty();

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
    var optionValue = $(inputClass).find('.option-value');
    if (optionValue.size() === 0)
        optionValue = $(inputClass).closest('.option-value');
    var currentName = $(inputClass).closest('.row-option').find('.form-control-option').attr('name');

    /**
     * replace 'name' in 'value' for correct json format
     * @example currentName=option[0][name] , replaceName=option[0][value][] 
     */
    var replaceName = currentName.replace('name', 'value');
    replaceName += '[]';
    var clone;
    if (optionValue.find('.input-group-value').length > 0) {
        clone = '<div class="form-group input-group input-group-value"><span class="input-group-btn"><button type="button" class="btn btn-danger btn-del-value">-</button></span> <input type="text"class="form-control form-control-value" name=' + replaceName + '> <span class="input-group-btn"><button type="button" class="btn btn-default btn-add">+</button></span></div>';
    } else {
        clone = '<div class="form-group input-group input-group-value"><input type="text"class="form-control form-control-value" name=' + replaceName + '> <span class="input-group-btn"><button type="button" class="btn btn-default btn-add">+</button></span></div>';
    }
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
        this.map.push("query", "-FC");
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
                if (currentVal !== "free choice" && currentVal.length !== 0) {
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
        if (currentVal !== "free choice" && currentVal.length !== 0) {
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
        $('.nav-tabs li:not(:last)').each(function (index, element) {
            var id = $(this).find("a").attr("data-target");
            $(this).remove();
            $(id).remove();
            $(':checkbox[value="editor' + (index + 1) + '"]').parent().remove();
        });
        var tabID;
        $(config.program).each(function (index, element) {
            tabID = addTab($(".add-tab"), config.program[index]);
        });
        $("[data-target='#" + tabID + "']").trigger('click'); //active last tab inserted
        $(':checkbox[value="editor1"]').prop('checked', true);
        $('#inputLanguage').val(config.language).change();
        $('#inputengine').val(config.engine).change();
        $('#output').val(config.output);
        setOptions(config);
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
    var clone = '<div class="row row-option"><div class="col-sm-12"><div class="form-group"><label for="option" class="col-sm-12 text-center">Options</label><div class="input-group opname"><select id="op' + index + '" name="option[' + index + '][name]" class="form-control form-control-option"><option value=""></option><option value="free choice">Free choice</option><option value="filter">Filter</option><option value="nofacts">Nofacts</option><option value="silent">Silent</option><option value="query">Query</option></select><span class="input-group-btn btn-add-option"><button type="button" class="btn btn-default">+</button></span></div></div><div class="option-value"></div></div></div>';
    $(clone).insertBefore('.checkbox');
    var id = "#op" + index;
    $(id).val(valueOption).change();

}

/**
 * @param {string} expanded - check if the upload container is expanded to resize the components
 * @description set the height of the components with the height of your browser
 */
function setHeightComponents(expanded) {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // cross-browser solution
    var navbarHeight = $('.navbar').outerHeight(true);
    var tabpanel = $(".nav-tabs").outerHeight(true);

    $('.ace').css('height', height - navbarHeight - tabpanel);

    if (expanded !== undefined) {
        var containerUpload = $('#upload-container').outerHeight(true);
        containerUpload += 22;
        $('.left-panel').css('height', height - (navbarHeight + containerUpload));
        $('.layout').css('height', height - (navbarHeight + containerUpload));
        $('.ui-layout-pane-east').css('height', height - (navbarHeight + containerUpload));
        $('.ui-layout-pane-center').css('height', height - (navbarHeight + containerUpload));
        $('.ace').css('height', height - (navbarHeight + tabpanel + containerUpload));
    } else {
        $('.left-panel').css('height', height - navbarHeight);
        $('.layout').css('height', height - navbarHeight);
        $('.ui-layout-pane-east').css('height', height - navbarHeight);
        $('.ui-layout-pane-center').css('height', height - navbarHeight);
    }
    editors[idEditor].resize();
}

/**
 * @param {string} str - string to check
 * @returns {boolean} 
 * @description check if a string is JSON
 */
function isJosn(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
/**
 * @param {string} layout - specific layout
 * @description append textarea to a specific layout
 */
function createTextArea(layout) {
    $(layout).append('Output <a role="button" class="pull-right" data-toggle="modal" href="#setting-editor"><i class="fa fa-cog"></i></a> <a role="button" id="split" class="pull-right"><i class="glyphicon glyphicon-menu-down"></i></a><textarea readonly name="" id="output" class="form-control output"></textarea>');
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    files = document.getElementById("files").files[0];
    if (files === undefined) {
        files = evt.dataTransfer.files[0];
    }
    var reader = new FileReader();
    reader.onload = function (event) {
        var text = event.target.result;
        if (isJosn(text)) {
            var jsontext = JSON.parse(text); // takes content of the file in the response
            if (!setJSONInput(jsontext)) {
                editors[idEditor].setValue(JSON.stringify(text)); // set value of the file in text editor
            }

        } else {
            editors[idEditor].setValue(text);
        }
        /**
         * remove and close container after success upload
         */
        $('.collapse').collapse('hide');
        setHeightComponents();
    };
    reader.readAsText(files);
    $('#files').val("");
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

/**
 * @param {string} ideditor - current id editor
 * @param {string} text - value of the text editor
 * @description set up current editor 
 */
function setUpAce(ideditor, text) {
    editors[ideditor] = new ace.edit(ideditor);
    ace.config.set("packaged", true);
    ace.config.set("modePath", "js/ace/mode");
    editors[ideditor].session.setMode("ace/mode/asp");
    editors[ideditor].setTheme("ace/theme/tomorrow");
    editors[ideditor].setValue(text);
    editors[ideditor].resize();
    editors[ideditor].setOptions({
        fontSize: 15
    });

    /**
     * Execute the program when you insert a . and if the readio button is checked
     */
    editors[ideditor].on('change', function (e) {
        if ($('#run-dot').prop('checked')) {
            if (e.lines[0] === '.') {
                intervalRun();
            }
        }
    });
    setHeightComponents();
}

/**
 * @description inizialize shortcuts and set title to the tooltips base on the OS
 */
function inizializeShortcuts() {
    if (window.navigator.userAgent.indexOf("Mac") !== -1) {
        key('command + d', function () {
            $('#btn-download').trigger('click');
            return false;
        });
        key('command + enter', function () {
            $('#run').trigger('click');
            return false;
        });
        key('command + u', function () {
            $('#btn-upload').trigger('click');
            return false;
        });

        $('[for="run"]').attr('data-original-title', '{ ⌘ + Enter }');
        $('#btn-upload').attr('data-original-title', '{ ⌘ + u }');
        $('[for="btn-download"]').attr('data-original-title', '{ ⌘ + d }');

    } else {
        key('control + d', function () {
            $('#btn-download').trigger('click');
            return false;
        });
        key('control + enter', function () {
            $('#run').trigger('click');
            return false;
        });
        key('control + u', function () {
            $('#btn-upload').trigger('click');
            return false;
        });

        $('[for="run"]').attr('data-original-title', '{ ctrl + Enter }');
        $('#btn-upload').attr('data-original-title', '{ ctrl + u }');
        $('[for="btn-download"]').attr('data-original-title', '{ ctrl + d }');
    }

}

/**
 * @returns {boolean}
 * @description add the programs into the input type hidden to serialize 
 */
function addMorePrograms() {
    var check = false;
    var index = 0;
    $('#tab-execute').find('[type="checkbox"]').each(function (indexInArray) {
        if ($(this).prop('checked')) {
            check = true;
            var p = editors[$(this).val()].getValue();
            $('.layout').prepend('<input type="hidden" name="program[' + index + ']" id="program' + $(this).val() + '" value="' + p + '" class="programs">');
            index += 1;
        }
    });
    if (check) {
        $('#program').remove();
    }
    return check;

}

/**
 * @description adds the programs into the input type hidden to download
 */
function addProgramsToDownload() {
    $('#program').remove();
    $('.tab-pane').each(function (index, element) {
        var id = $(this).find('.ace').attr("id");
        var value = editors[id].getValue();
        $('.layout').prepend('<input type="hidden" name="program[' + index + ']" id="program' + index + '" value="' + value + '" class="programs">');
    });
}
/**
 * @description destroy all the input type created and insert the default input type
 */
function destroyPrograms() {
    $('.programs').each(function (index) {
        $(this).remove();
    });
    $('.layout').prepend('<input type="hidden" name="program[0]" id="program" class="programs" value="">');

}

/**
 * @returns {string}
 *@description generate unique id for the tabs 
 */
function generateIDTab() {
    var id = $(".nav-tabs").children().length;
    var tabid = "tab" + id;

    while ($("#" + tabid).size() !== 0) {
        id += 1;
        tabid = "tab" + id;
    }
    return tabid;
}

/**
 * @param {string} theme - value of the theme choosed
 * @description Sets the theme to all the editors
 */
function setTheme(theme) {
    var length = $(".nav-tabs").children().length;
    for (var index = 1; index <= length - 1; index++) {
        var idE = "editor" + index;
        editors[idE].setTheme(theme);
    }
}

/**
 * @param {number} size - font's size
 * @description Sets the font's size to all the editors
 */
function setFontSizeEditors(size) {
    var length = $(".nav-tabs").children().length;
    for (var index = 1; index <= length - 1; index++) {
        var idE = "editor" + index;
        editors[idE].setFontSize(size + "px");
    }
}

/**
 * @returns {boolean}
 * @description Checks if the browser supports the localStorage
 */
function supportLocalStorage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

/**
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 * @description Saves options in localStorage
 */
function saveOption(key, value) {
    if (!supportLocalStorage) {
        return false;
    }
    localStorage[key] = value;
    return true;
}

/**
 * @description Sets the saved options in the localStorage
 */
function restoreOptions() {
    if (!supportLocalStorage) {
        return false;
    }
    var theme = localStorage.getItem("theme");
    $('#theme').val(theme);
    setTheme(theme);

    var fontSizeE = localStorage.getItem("fontSizeE");
    $('#font-editor').val(fontSizeE);
    setFontSizeEditors(fontSizeE);

    var fontSizeO = localStorage.getItem("fontSizeO");
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");

    var opt = localStorage.getItem("solverOptions");
    if (opt !== null) {
        var obj = JSON.parse(opt);
        $('#inputLanguage').val(obj.language).change();
        $('#inputengine').val(obj.engine).change();
        setOptions(obj);
    }
    var check = localStorage.getItem("run-auto");
    if (check !== null) {
        if (check === "true") {
            $('#run-dot').prop('checked', true);
        } else {
            $('#run-dot').prop('checked', false);
        }
    } else {
        $('#run-dot').prop('checked', true);
    }
}

/**
 * @param {JSON} - obj 
 * @description deletes all the options and add them to the DOM 
 */
function setOptions(obj) {
    $('.row-option').each(function (index) {
        $(this).remove();
    });
    $(obj.option).each(function (indexInArray, item) { // create option's form
        addOption(indexInArray, item.name);
        var currentOption;
        if (indexInArray !== 0) {
            currentOption = $('.row-option').get(indexInArray);
            $(currentOption).find('label').empty();
        }
        if (indexInArray < obj.option.length - 1) { //deletes all 'btn-add' except in the last option
            currentOption = $('.row-option').get(indexInArray);
            $(currentOption).find('.btn-add-option').empty();
        }
        if (item['value']) {
            currentClass = $('.option-value').eq(indexInArray);
            $(item.value).each(function (indexInArray, itemValue) {
                if (indexInArray !== 0)
                    addInpuValue(currentClass);
                $('.input-group-value').last().find('.form-control-value').val(itemValue);
                if (indexInArray < item.value.length - 1) { //deletes all 'btn-add' except the last in the input type value
                    $('.input-group-value').last().find('.btn-add').parent().empty();
                }
            });
        }

    });
    $('.row-option').each(function (index) { // add delete button after first option
        if (index > 0) {
            var cloneOpname = $(this).find('.opname');
            $(cloneOpname).prepend('<span class="input-group-btn btn-del-option"><button type="button" class="btn btn-danger">-</button></span>');
        }
    });

    if (obj.engine === "clingo") {
        $('.form-control-option').find('option').each(function (index, element) {
            if ($(this).val() !== 'free choice' && $(this).val().length !== 0)
                $(this).remove();
        });

    }
}

/**
 * @returns {string}
 * @param {string} obj - where insert the tab
 * @param {string} text - set value of the editor
 * @description Adds tab to the DOM
 */
function addTab(obj, text) {
    var id = $(".nav-tabs").children().length;
    var tabId = generateIDTab();
    var editorId = "editor" + id;
    $('<li role="presentation"><a data-target="#' + tabId + '" role="tab" data-toggle="tab">Tab' + id + ' <span class="delete-tab"> <i class="fa fa-times"></i> </span> </a> </li>').insertBefore(obj.parent());
    $('.tab-content').append('<div role="tabpanel" class="tab-pane fade" id="' + tabId + '"><div id="' + editorId + '" class="ace"></div></div>');
    setUpAce(editorId, text);
    $('#tab-execute').append(' <label><input type="checkbox" value="' + editorId + '"> Tab' + id + ' </label>');
    return tabId;
}