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
};

$(window).resize(function () {
    var currentVal;
    var fontSizeO = localStorage.getItem("fontSizeO");
    if (window.innerWidth > 450) {
        layout.removePane("south");
        currentVal = $('#output').text();
        $(".ui-layout-south").empty();
        layout.addPane("east");
        createTextArea($('.ui-layout-east'));
        $("#font-output").val(fontSizeO);
        $('#output').css('font-size', fontSizeO + "px");
        $('#output').text(currentVal);
    } else {
        layout.removePane("east");
        currentVal = $('#output').text();
        $(".ui-layout-east").empty();
        layout.addPane("south");
        createTextArea($('.ui-layout-south'));
        $("#font-output").val(fontSizeO);
        $('#output').css('font-size', fontSizeO + "px");
        $('#output').text(currentVal);
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

    // Restores the saved settings from the local storage (if supported)
    // TODO: the restoring process is incomplete
    restoreOptionsFromLocalStorage();

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

    // TODO: its possible to substitute the ajax with the socket
    $('[data-target="#modal-about"]').on('click', function () {
        $.ajax({
            type: "POST",
            url: "/version",
            dataType: "JSON",
            success: function (response) {
                $("#version").empty();
                $("#version").append(response.version);
            }
        });
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
        var currentVal = $('#output').text();
        $(".ui-layout-east").empty();
        layout.addPane("south");
        createTextArea($('.ui-layout-south'));
        $('#output').text(currentVal);
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
            $('#output-form').attr('name', 'output');
            var text = $("#output").text();
            $('#output-form').val(text);
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            chose = $('#choice').text();
            createFileToDownload(stringify);
            $('#program').attr('name', 'program[0]');
            $('#output-form').removeAttr('name', 'output');
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
        var i = 0;
        if (clkBtn === "run") {
            $("#output").empty();
            $("#output").text("Sending..");
            callSocketServer();

        } else if (clkBtn === 'btn-download') {
            addProgramsToDownload();
            $('#output-form').attr('name', 'output');
            var text = $("#output").text();
            $('#output-form').val(text);
            i = 0;
            $("#tab-execute input").each(function (index, element) {
                if ($(this).prop('checked')) {
                    $(this).attr("name", "tab[" + i + "]");
                    i++;
                }
            });
            $("#run-dot").attr("name", "runAuto");
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            var chose = $('#choice').text(); // returns the value of what to download and place the value of the text editor into a 'text' variable
            createFileToDownload(stringify);
            $('#output-form').removeAttr('name');
            destroyPrograms();
            $("#tab-execute input").each(function (index, element) {
                $(this).removeAttr("name");
            });
            $("#run-dot").removeAttr("name");

        } else if (clkBtn === 'save-options') {
            i = 0;
            $("#tab-execute input").each(function (index, element) {
                if ($(this).prop('checked')) {
                    $(this).attr("name", "tab[" + index + "]");
                    i++;
                }
            });
            $("#run-dot").attr("name", "runAuto");
            form = $('#input').serializeFormJSON();
            stringify = JSON.stringify(form);
            if (!saveOption("solverOptions", stringify)) {
                alert("Sorry, this options will not save in your browser");
            }
            $("#tab-execute input").each(function (index, element) {
                $(this).removeAttr("name");
            });
            $("#run-dot").removeAttr("name");
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
    if (!addMorePrograms()) {
        var text = editors[idEditor].getValue();
        $('#program').val(text); // insert the content of text editor in a hidden input text to serailize
    }
    var form = $('#input').serializeFormJSON();
    destroyPrograms();

    var socket = io.connect();
    socket.emit('run', JSON.stringify(form));
    socket.on('problem', function (response) {
        operation_alert(response);
        console.log(response); // debug string
    });
    socket.on('output', function (response) {
        if (response.error === "") {
            console.log(response.model); // debug string
            $('#output').text(response.model); // append the response in the container
            $('#output').css('color', 'black');
        } else {
            $('#output').text(response.error);
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
    if($(this).parent().parent().parent().parent().is('.row-option:last')) {
        $(this).parent().parent().parent().parent().prev().find(".btn-add-option").append('<button type="button" class="btn btn-default">+</button>');
    }
    delOptionDOM($(this));
});

$(document).on('click', '.btn-del-value', function () {
    if ($(this).parent().parent().is(":last-child")) {
        $(this).parent().parent().prev().find(".input-group-btn").last().append('<button type="button" class="btn btn-default btn-add">+</button>');
    }
    deleteInputValue($(this));
});

$(document).on('click', '.btn-add', function () {
    addInputValue($(this));
    $(this).parent().empty();
});

$(document).on('mouseup', '#output', function () {
    $("#output").unmark();
    var start, end;
    var text = $("#output").text();
    var mainDiv = document.getElementById("output");
    var sel = getSelectionCharOffsetsWithin(mainDiv);
    start = sel.start;
    end = sel.end;

    var preChart = text.slice(start - 1, start);
    var postChart = text.slice(end, end + 1);
    var selected = text.slice(start, end);
    var isPreChartCompliance = preChart.match(/[\{\s\,]/g);
    var isPostChartCompliance = postChart.match(/[\(\s\,]/g);
    var isSelectedWordCompliance = !selected.match(/[\s\(\)\,]/g);
    if (isPreChartCompliance && isPostChartCompliance && isSelectedWordCompliance) {
        var regex = new RegExp('([\\s\\{\\,])(' + selected + ')([\\(\\,\\s])', 'g');
        text = text.replace(regex, '$1<mark>$2</mark>$3');
        $("#output").empty();
        $("#output").html(text);
        var randomColor = Math.floor(Math.random() * 16777215).toString(16);
        $("mark").css("color", "#" + randomColor); 
    }
});

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    currentTab = e.target;
    idTab = $(currentTab).attr('data-target');
    idEditor = $(idTab).find('.ace').attr("id");
});

$(document).on('click', '#split', function () {
    layout.removePane("east");
    var currentVal = $('#output').text();
    $(this).parent().empty();
    layout.addPane("south");
    createTextArea($('.ui-layout-south'));
    var fontSizeO = localStorage.getItem("fontSizeO");
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");
    $('#output').text(currentVal);
    $('#split').children().attr('class', 'glyphicon glyphicon-menu-up');
    $('#split').attr('id', 'split-up');
});

$(document).on('click', '#split-up', function () {
    layout.removePane("south");
    var currentVal = $('#output').text();
    $(this).parent().empty();
    layout.addPane("east");
    createTextArea($('.ui-layout-east'));
    var fontSizeO = localStorage.getItem("fontSizeO");
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");
    $('#output').text(currentVal);
});

// TODO BUG: on change check if the languages loaded are still supported by the executor
// Sets the solvers and options on language change
$(document).on('change', '#inputLanguage', function (event, languageChanged) {
    var val = $(this).val();
    if(val !== '') {
        var socket = io.connect();
        socket.emit('changeLanguage', val);
        socket.on('changeLanguageRes', function (data) {
            $('#inputSolver').empty();
            $('.form-control-option').empty();
            for (var index = 0; index < data.length; index++) {
                var element = data[index];
                $('<option>').val(element.value).text(element.name).appendTo('#inputSolver');
            }
            $('#inputSolver').change();
            // Used during option loading from file or local storage
            if(languageChanged)
                languageChanged(true);
        });
        socket.on('changeLanguageError', function () {
            $('#inputSolver').empty();
            $('.form-control-option').empty();
            // Used during option loading from file or local storage
            if(languageChanged)
                languageChanged(false);
            alert('The selected language doesn\'t exist!');
        });
    }
});

// Sets the options on solver change
$(document).on('change', '#inputSolver', function (event, solverChange) {
    var val = $(this).val();
    if(val !== '') {
        var obj = {};
        obj["language"] = $('#inputLanguage').val();
        obj["solver"] = $('#inputSolver').val();
        var socket = io.connect();
        socket.emit('changeSolver', obj);
        socket.on('changeSolverRes', function (data) {
            $('.form-control-option').empty();
            for (var index = 0; index < data.length; index++) {
                var element = data[index];
                $('<option>').val(element.value).text(element.name)
                    .attr("word_argument", element["word_argument"])
                    .attr("title", element.descption).appendTo('.form-control-option');
            }
            $('.form-control-option').change();
            // Used during option loading from file or local storage
            if(solverChange)
                solverChange(true);
        });
        socket.on('changeSolverError', function () {
            $('.form-control-option').empty();
            // Used during option loading from file or local storage
            if(solverChange)
                solverChange(true);
            alert('The selected solver doesn\'t exist!');
        });
    }
});

// Add or remove the 'input type value' based on the option
$(document).on('change', '.form-control-option', function () {
    var val = $(this).val();
    if ($(this).find("[value='" + val + "']").attr('word_argument') === 'true') {
        if (($(this).closest('.row-option').find('.option-value').find('.input-group-value').length) <= 0)
            addInputValue($(this).closest('.row-option'));
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
 *
 * @param {string} searchStr - string to search
 * @param {string} str - text where search the string
 * @param {boolean} caseSensitive
 * @returns {array}
 * @description Returns each position of the searched string
 */
function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen === 0) {
        return [];
    }
    var startIndex = 0,
        index, indices = [];

    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

/**
 *
 * @param {*} element - container  where to search
 * @description Returns the start and the end position of the selected string in the output container
 */
function getSelectionCharOffsetsWithin(element) {
    var start = 0,
        end = 0;
    var sel, range, priorRange;
    if (typeof window.getSelection != "undefined") {
        range = window.getSelection().getRangeAt(0);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        end = start + range.toString().length;
    } else if (typeof document.selection != "undefined" &&
        (sel = document.selection).type != "Control") {
        range = sel.createRange();
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        end = start + range.text.length;
    }
    return {
        start: start,
        end: end
    };
}

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
    if ($(clone).find('.form-control-option option:selected').attr('word_argument') === 'true') {
        addInputValue($(clone).find('.form-control-option').closest('.row-option'));
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
function addInputValue(inputClass) {
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
 * @param {Object} text - configuration in json format
 * @returns {boolean}
 * @description check if the configration file has the correct property to set. If not, return false and display the content of the file in the text editor
 */
function setJSONInput(config) {
    if (config.hasOwnProperty('language') || config.hasOwnProperty('solver') || config.hasOwnProperty('option') || config.hasOwnProperty('program') || config.hasOwnProperty('output')) {
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
        if (config.hasOwnProperty('tab')) {
            $(config.tab).each(function (index, element) {
                $(':checkbox[value="' + element + '"]').prop('checked', true);
            });
        }
        if (config.hasOwnProperty('runAuto')) {
            $("#run-dot").prop('checked', true);
        }
        // TODO DEBUG: changed like loading from local storage. Not debugged yet.
        restoreOptions(config);
        $('#output').text(config.output);
        return true;
    } else {
        return false;
    }
}

/**
 * @param {Object} optionTemplate - JQuery object
 * @param {number} index - Item number Created
 * @param {string} valueOption - option's value
 * @description Append the option's form, passed in input like a template, to the DOM with the corresponding value
 */
function addOption(optionTemplate, index, valueOption) {
    var clone = $(optionTemplate).clone();
    $(clone).find('select').attr('id', 'op' + index);
    $(clone).find('select').attr('name', 'option[' + index + '][name]');
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
        $('.ui-layout-pane-center').css('height', height - (navbarHeight + containerUpload + 10));
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
    $("#setting-output").remove();
    $("#output").remove();
    $(layout).append('<div id="setting-output"> Output <a role="button" class="pull-right" data-toggle="modal" href="#setting-editor"><i class="fa fa-cog"></i></a> <a role="button" id="split" class="pull-right"><i class="glyphicon glyphicon-menu-down"></i></a></div><div id="output" class="output"></div>');
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
            $('.layout').prepend("<input type='hidden' name='program[" + index + "]' id='program" + $(this).val() + "' value='" + p + "' class='programs'>");
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
        $('.layout').prepend("<input type='hidden' name='program[" + index + "]' id='program" + index + "' value='" + value + "' class='programs'>");
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
function restoreOptionsFromLocalStorage() {
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
        restoreOptions(obj);
        if (obj.hasOwnProperty('runAuto')) {
            $("#run-dot").prop('checked', true);
        }
    }
}

/**
 * @param {JSON} obj - Object containing the options settings
 */
function restoreOptions(obj) {
    $('#inputLanguage option').each(function (index, language) {
        if($(language).val() === obj.language) {
            var deferLanguage = $.Deferred();
            // Promise serves to wait all new solvers are loaded from the server
            var promiseLanguage = deferLanguage.promise();
            var languageChanged = (success) => { success ? deferLanguage.resolve() : deferLanguage.reject(); };
            $('#inputLanguage option[value="' + obj.language + '"]').prop('selected', true).trigger('change', languageChanged);
            $.when(promiseLanguage).done(function () {
                $('#inputSolver option').each(function (index, solver) {
                    if($(solver).val() === obj.solver) {
                        var deferSolver = $.Deferred();
                        // Promise serves to wait all new options are loaded from the server
                        var promiseSolver = deferSolver.promise();
                        var solverChanged = (success) => { success ? deferSolver.resolve() : deferSolver.reject(); };
                        $('#inputSolver option[value="' + obj.solver + '"]').prop('selected', true).trigger('change', solverChanged);
                        $.when(promiseSolver).done(function () {
                            setOptions(obj);
                        });
                    }
                });
            });
        }
    });
}

/**
 * @param {JSON} obj - Object containing the options settings
 * @description deletes all the options and add them to the DOM
 */
function setOptions(obj) {
    // TODO BUG: if "$('.row-option').eq(0)" did not exist there might be a problem
    // Clone the first 'option' to use it as the template
    var optionTemplate = $('.row-option').eq(0).clone();
    $(obj.option).each(function (index, elem) {
        // Check that 'obj' contains at least one valid and well formed option to load
        if ($(optionTemplate).contents().find('option[value="' + elem.name + '"]').length > 0) {
            setOptionsFromTemplate();
            return false;
        }
    });
    function setOptionsFromTemplate() {
        $(optionTemplate).contents().find('.option-value').empty();
        $('.row-option').each(function (index) {
            $(this).remove();
        });
        $(obj.option).each(function (indexInArray, item) { // create option's form
            addOption(optionTemplate, indexInArray, item.name);
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
                        addInputValue(currentClass);
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