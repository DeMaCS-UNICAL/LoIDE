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

})(jQuery);

/**
 * @param {string} str - text to copy
 * @description Copy a string to clipboard
 */
function copyStringToClipboard(str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = { position: 'absolute', left: '-9999px' };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
}

/**
 * @param {json} result - description of the problem 
 * @description Open a container to display the result 
 */
function operation_alert(result) {
    $("#notidication-body").html("<strong>" + result.reason + "</strong>");
    $('#notification').toast('show');
}

/**
 ** @global
 * @description place object layout
 */
var layout;

/**
 * @global
 * @description place the id of the current shown editor
 */
var idEditor = "editor1";

/**
 * @global
 * @description default font size editor
 */
const defaultFontSize = 15;

/**
 * @global
 * @description default ace theme
 */
const defaultTheme = "ace/theme/tomorrow";
const defaultDarkTheme = "ace/theme/idle_fingers";

/**
 * set up ace editors into object
 */
var editors = {};
setUpAce(idEditor, "");

/**
 * @global
 * @description default screens sizes and activated status
 */
var display = {
    small: { size: 576, isActive: false},
    medium: { size: 768, isActive: false},
    large: { size: 992, isActive: true}
};

/**
 * @description - Returns the DOM element for the solver's option
 */
function getSolverOptionDOMElement() {
    return "" +
        "<div class=\"row row-option\">" +
        "<div class=\"col-sm-12 form-group\">" +
        "<div class=\"badge-option mb-1\">" +
        "<span class=\" text-center badge badge-info option-number\"></span>" +
        "<span class=\" text-center badge badge-danger btn-del-option ml-1\"> <i class=\"fa fa-trash-o\"></i></span>" +
        "</div>" +
        "<div class=\"input-group opname\">" +
        "<select name=\"option[0][name]\" class=\"form-control form-control-option custom-select not-alone\">" +
        getHTMLFromJQueryElement(getSolverOptions($('#inputLanguage').val(), $('#inputengine').val())) +
        "</select>" +
        "</div>" +
        "<div class=\"option-values\">" +
        "</div>" +
        "</div>" +
        "</div>";
}

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
    saveProjectToLocalStorage();
};

$(window).resize(function () {
    checkScreenType();
    var fontSizeO = localStorage.getItem("fontSizeO");
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;

    var outputPos = localStorage.getItem("outputPos");
    outputPos = outputPos !== null ? outputPos : "east";

    if (window.innerWidth > display.medium.size) {
        if (outputPos == "south") {
            layout.removePane("south");
            let currentValModel = $('#output-model').text();
            let currentValError = $('#output-error').text();
            $(".ui-layout-south").empty();
            layout.addPane("east");
            createTextArea($('.ui-layout-east'));
            $("#font-output").val(fontSizeO);
            $('#output').css('font-size', fontSizeO + "px");
            $('#output-model').text(currentValModel);
            $('#output-error').text(currentValError);
            saveOption("outputPos", "east");
            setSizePanes();
        }
    } else {
        if (outputPos == "east") {
            layout.removePane("east");
            let currentValModel = $('#output-model').text();
            let currentValError = $('#output-error').text();
            $(".ui-layout-east").empty();
            layout.addPane("south");
            createTextArea($('.ui-layout-south'));
            $("#font-output").val(fontSizeO);
            $('#output').css('font-size', fontSizeO + "px");
            $('#output-model').text(currentValModel);
            $('#output-error').text(currentValError);
            $('#split').children().attr('class', 'fa fa-chevron-up');
            $('#split').attr('id', 'split-up');
            saveOption("outputPos", "south");
            setSizePanes();
        }
    }
    setHeightComponents();
    var length = $(".nav-tabs").children().length;
    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        editors[idE].resize();
    }
});

function setSizePanes(){
    var outputPos = localStorage.getItem("outputPos");
    outputPos = outputPos !== null ? outputPos : "east";

    if(display.small.isActive){
        if(outputPos == "east"){
            layout.sizePane("east", 100);
        }
        else {
            layout.sizePane("south", 200);
        }
    }
    else if(display.medium.isActive){
        if(outputPos == "east"){
            layout.sizePane("east", 200);
        }
        else {
            layout.sizePane("south", 200);
        }
    } 
    else {
        if(outputPos == "east"){
            layout.sizePane("east", 250);
        }
        else {
            layout.sizePane("south", 200);
        }
    }
}

function saveOptions() {
    $("#run-dot").attr("name", "runAuto");
    var form = $('#input').serializeFormJSON();
    form.tab = [];

    $('.check-run-tab.checked').each(function (index, element) {
        form.tab.push($(this).val());
    });

    if (form.tab.length == 0) {
        delete form.tab;
    }

    var stringify = JSON.stringify(form);
    if (!saveOption("solverOptions", stringify)) {
        alert("Sorry, this options will not save in your browser");
    }
    $("#run-dot").removeAttr("name");
}

$(document).ready(function () {
    checkScreenType();

    setNotifications();

    setClipboard();

    inizializePopovers();

    inizializeTabContextmenu();

    inizializeToolbar();

    inizializeButtonLoideMode();

    setWindowResizeTrigger();

    initializeCheckTabToRun();

    $('.navbar-logo').on('click', function (e) {
        location.reload();
    });

    layout = $('body > .container > form > .layout').layout({
        onresize_end: function () {
            var length = $(".nav-tabs").children().length;
            for (let index = 1; index <= length - 1; index++) {
                let idE = "editor" + index;
                editors[idE].resize();
            }
        },
        south__minSize: 125,
        east__minSize: 100,
        resizeWhileDragging: true,
        resizable: true,
        slidable: true,
    });

    $("[data-target='#tab1']").trigger('click'); // active the first tab

    inizializeShortcuts();

    restoreOptions();

    inizializeDropzone();

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
        var expandend = $('#btn-upload').attr('aria-expanded');
        setHeightComponents(expandend, true);
    });

    /**
     * @global
     * @description id of the clicked button 'submit'
     */
    var clkBtn = "";

    $('button[type="submit"]').click(function (evt) {
        clkBtn = evt.target.id;
    });

    $("#btn-run-nav").click(function (e) {
        e.preventDefault();
        $("#output-model").empty();
        $("#output-error").empty();
        $("#output-model").text("Sending..");
        callSocketServer();
    });

    $('#input').submit(function (e) {
        e.preventDefault();
        if (clkBtn === "run") {
            $("#output-model").empty();
            $("#output-error").empty();
            $("#output-model").text("Sending..");
            callSocketServer(false);
        }
        else if (clkBtn === 'save-options') {
            saveOptions();
        }
    });

    $("#btn-option").click(function () {
        openRunOptions();
    });

    $("#reset-editor").click(function () {
        resetEditorOptions();
    });

    $("#reset-options").click(function () {
        resetSolverOptions();
    });

    addCommand(idEditor);

    inizializeSnippets();

    $('#inputLanguage').on('change', function () {
        inizializeAutoComplete();
        setAceMode();
    });

    setLoideStyleMode();

    checkProjectOnLocalStorage();

    setAceMode();

    closeRunOptionOnMobile();

    // Set the default options
    resetSolverOptions();

    loadFromURL(); // load program from url

    if (display.small.isActive) {
        $('.left-panel').css('overflow-y', 'auto');
    }

    inizializeAppareaceSettings();

    setSizePanes();

    setTimeout( ()=>{
        $('.splashscreen').addClass('display-none');

    },500 )
});

function checkScreenType(){
    if($(window).width() < display.medium.size){
        display.small.isActive = true;
        display.medium.isActive = false;
        display.large.isActive = false;
    }
    else if($(window).width() < display.large.size){
        display.small.isActive = false;
        display.medium.isActive = true;
        display.large.isActive = false;
    }
    else {
        display.small.isActive = false;
        display.medium.isActive = false;
        display.large.isActive = true;
    }
}

function inizializeAppareaceSettings(){

    $('#font-output').change(function (e) {
        var size = $(this).val();
        if (size.length == 0) {
            $(this).val(defaultFontSize);
        }
        $('#output').css('font-size', size + "px");
        if (!saveOption("fontSizeO", size)) {
            alert("Sorry, this options will not save in your browser");
        }
    });

    $('#font-editor').change(function (e) {
        var size = $(this).val();
        if (size.length == 0) {
            $(this).val(defaultFontSize);
        }
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

    var size = $('#font-editor').val();
    if (size.length == 0) {
        $('#font-editor').val(defaultFontSize);
    }
    setFontSizeEditors(size);
    size = $('#font-output').val();
    if (size.length == 0) {
        $('#font-output').val(defaultFontSize);
    }

    var actualTheme = localStorage.getItem("theme") == null ? "" : localStorage.getItem("theme");
    if( actualTheme.length == 0){
        if (localStorage.getItem('mode') === 'dark')
            setThemeEditors(defaultDarkTheme);
        else {
            setThemeEditors(defaultTheme);
        }
    }
    else {
        setThemeEditors(actualTheme);
    }
}

function initializeCheckTabToRun() {
    $('.check-run-tab:not(.check-auto-run-tab)').off();
    $('.check-auto-run-tab').off();

    checkEmptyTabSelected();

    $('.check-run-tab:not(.check-auto-run-tab)').on('click', function (e) {
        $(this).find('.check-icon').toggleClass('invisible');
        $(this).toggleClass('checked');
        checkEmptyTabSelected();
    });

    $('.check-auto-run-tab').on('click', function (e) {
        $('.check-run-tab.checked:not(.check-auto-run-tab)').each(function () {
            $(this).removeClass('checked');
            $(this).find('.check-icon').toggleClass('invisible');
        })
        $(this).find('.check-icon').removeClass('invisible');
        $(this).addClass('checked');
        checkEmptyTabSelected();
    });
}

function checkEmptyTabSelected() {
    var tot = $('.check-run-tab.checked:not(.check-auto-run-tab)').length;
    if (tot === 0) {
        $('.check-auto-run-tab').find('.check-icon').removeClass('invisible');
        $('.check-auto-run-tab').addClass('checked');
    }
    else {
        $('.check-auto-run-tab').find('.check-icon').addClass('invisible');
        $('.check-auto-run-tab').removeClass('checked');
    }
}

/**
 * @description Serialize form and send it to socket server and waits for the response
 */
function callSocketServer(onlyActiveTab) {
    $('.tab-pane').each(function (index, element) {
        let id = $(this).find('.ace').attr("id");
        editors[id].replaceAll("", { "needle": "'" });
    });
    if (onlyActiveTab || !addMorePrograms()) {
        let text = editors[idEditor].getValue();
        $('#program').val(text); // insert the content of text editor in a hidden input text to serailize
    }
    var form = $('#input').serializeFormJSON();
    if (form.option == null) {
        form.option = [{ name: "" }];
    }
    destroyPrograms();
    var socket = io.connect();
    socket.emit('run', JSON.stringify(form));
    socket.on('problem', function (response) {
        operation_alert(response);
        console.log(response); // debug string
    });
    socket.on('output', function (response) {
        if (response.error == "") {
            console.log(response.model); // debug string
            $('#output-model').text(response.model); // append the response in the container

            let outputPos = localStorage.getItem("outputPos");
            outputPos = outputPos !== null ? outputPos : "east";
            
            if(outputPos == "east"){
                layout.open("east");
            }
            else{
                layout.open("south");
            }

        } else {
            $('#output-model').text(response.model);
            $('#output-error').text(response.error);
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

function createFileToDownload(text, where, name, type) {
    var textFileAsBlob = new Blob([text], {

        type: 'application/' + type
    });
    /**
     * specify the name of the file to be saved
     */
    var fileNameToSaveAs = name + "." + type;
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
    if (where == "local") {
        downloadLink.click();
    }
    else if (where == "dropbox") {
        // console.log(downloadLink.href);
        // var options = { error: function (errorMessage) { alert(errorMessage);}};
        // Dropbox.save(downloadLink.href, fileNameToSaveAs, options);
    }
}
/**
 * @param {Object} event - reference to the object that dispatched the event
 * @description Remove the link from the DOM
 */
function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function inizializeDropzone() {
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

function inizializeTabContextmenu() {

    $.contextMenu({
        selector: '.btn-context-tab',
        items: {
            RunThisTab: {
                name: "Run",
                icon: function (opt, $itemElement, itemKey, item) {
                    // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                    $itemElement.html('<i class="fa fa-play context-menu-item-icon" aria-hidden="true"></i>' + item.name);

                    // Add the context-menu-icon-updated class to the item
                    return 'context-menu-icon-updated';
                },
                callback: function (itemKey, opt, e) {
                    runCurrentTab();
                }
            },
            Rename: {
                name: "Rename",
                icon: function (opt, $itemElement, itemKey, item) {
                    // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                    $itemElement.html('<i class="fa fa-pencil context-menu-item-icon" aria-hidden="true"></i>' + item.name);

                    // Add the context-menu-icon-updated class to the item
                    return 'context-menu-icon-updated';
                },
                callback: function (itemKey, opt, e) {
                    closeAllPopovers();
                    opt.$trigger.parent().popover('show');
                }
            },
            Duplicate: {
                name: "Duplicate",
                icon: function (opt, $itemElement, itemKey, item) {
                    // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                    $itemElement.html('<i class="fa fa-clone context-menu-item-icon" aria-hidden="true"></i>' + item.name);

                    // Add the context-menu-icon-updated class to the item
                    return 'context-menu-icon-updated';
                },
                callback: function (itemKey, opt, e) {
                    var textToDuplicate = editors[idEditor].getValue();
                    var tabID = addTab(null, textToDuplicate);
                    $("[data-target='#" + tabID + "']").trigger('click'); //active last tab inserted
                }
            },
            Clear: {
                name: "Clear content",
                icon: function (opt, $itemElement, itemKey, item) {
                    // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                    $itemElement.html('<i class="fa fa-eraser context-menu-item-icon" aria-hidden="true"></i>' + item.name);

                    // Add the context-menu-icon-updated class to the item
                    return 'context-menu-icon-updated';
                },
                callback: function (itemKey, opt, e) {
                    editors[idEditor].setValue("");
                }
            },
            SaveTabContent: {
                name: "Save content",
                icon: function (opt, $itemElement, itemKey, item) {
                    // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                    $itemElement.html('<i class="fa fa-download context-menu-item-icon" aria-hidden="true"></i>' + item.name);

                    // Add the context-menu-icon-updated class to the item
                    return 'context-menu-icon-updated';
                },
                callback: function (itemKey, opt, e) {
                    downloadCurrentTabContent();
                }
            },
            Delete: {
                name: "Delete",
                icon: function (opt, $itemElement, itemKey, item) {
                    // Set the content to the menu trigger selector and add an bootstrap icon to the item.
                    $itemElement.html('<i class="fa fa-times context-menu-item-icon" aria-hidden="true"></i>' + item.name);

                    // Add the context-menu-icon-updated class to the item
                    return 'context-menu-icon-updated';
                },
                callback: function (itemKey, opt, e) {
                    opt.$trigger.parent().find('.delete-tab').trigger('click');
                }
            }
        },
        events: {
            show: function (e) {
                $(this).parent().trigger('click');
            }
        }
    });

    $(".btn-context-tab").on('click', function (e) {
        $(this).trigger('contextmenu');
    });

    $(".btn-tab").popover({
        title: 'Rename',
        container: 'body',
        trigger: 'manual',
        html: true,
        placement: 'bottom'
    });

    $("html").on("mouseup", function (e) {
        var l = $(e.target);
        if (l[0].className.indexOf("popover") == -1) {
            $(".popover").each(function () {
                $(this).popover("hide");
            });
        }
    });

    $("html").on("contextmenu", function (e) {
        var l = $(e.target);
        if (l[0].className.indexOf("popover") == -1) {
            $(".popover").each(function () {
                $(this).popover("hide");
            });
        }
    });

    $('.btn-tab').on('inserted.bs.popover', function () {
        $('.popover-body').last().html('<div class="input-group">\n' +
            '      <input type="text" class="form-control" id="change-name-tab-textbox" placeholder="Type a name">\n' +
            '      <span class="input-group-btn">\n' +
            '        <button class="btn btn-light" type="button" id="change-name-tab"><i class="fa fa-chevron-right"></i></button>\n' +
            '      </span>\n' +
            '    </div>');
        if (localStorage.getItem('mode') === 'dark') {
            $('#change-name-tab').removeClass('btn-light');
            $('#change-name-tab').addClass('btn-dark');
        }
        else {
            $('#change-name-tab').removeClass('btn-dark');
            $('#change-name-tab').addClass('btn-light');
        }
        $('#change-name-tab-textbox').focus();
        var thisTab = $(this);
        var idTabEditor = $(this).attr('data-target');
        var idEditorToChangeTabName = $(idTabEditor).children().attr('id');
        $('#change-name-tab').prop('disabled', true);

        $('#change-name-tab-textbox').on('input', function () {
            var nameValue = $('#change-name-tab-textbox').val().trim();
            if (nameValue.length === 0) {
                $('#change-name-tab').prop('disabled', true);
            }
            else {
                $('#change-name-tab').prop('disabled', false);
            }
        });

        $('#change-name-tab').on('click', function () {
            var nameValue = $('#change-name-tab-textbox').val().trim();
            if (nameValue.length !== 0) {
                $('.check-run-tab[value="' + idEditorToChangeTabName + '"]').find('.check-tab-name').text(nameValue);
                thisTab.children('.name-tab').text(nameValue);
                thisTab.popover('hide');
            }
        });

        $('#change-name-tab-textbox').on('keyup', function (e) {
            if (e.key == "Enter") {
                $('#change-name-tab').trigger('click');
            }
        });
    });

    $('.name-tab').on('contextmenu', function (e) {
        $(e.target).siblings(".btn-context-tab").trigger('click');
        return false; // don't show the contest menu of the browser
    });
}

$(document).on('click', '#btn-add-option', function () {
    addOptionDOM();
    renameSelectOptionsAndBadge();
    setElementsColorMode();
});

$(document).on('click', '.btn-del-option', function () {
    delOptionDOM($(this));
    setElementsColorMode();
});

$(document).on('click', '.btn-del-value', function () {
    deleteInputValue($(this));
    setElementsColorMode();
});

$(document).on('click', '.btn-add', function () {
    addInputValue($(this).parent());
    setElementsColorMode();
});

$(document).on('mouseup', '#output-model', function () {
    $("#output-model").unmark();
    var start, end;
    var text = $("#output-model").text();
    var mainDiv = document.getElementById("output-model");
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
        let regex = new RegExp('([\\s\\{\\,])(' + selected + ')([\\(\\,\\s])', 'g');
        text = text.replace(regex, '$1<mark>$2</mark>$3');
        $("#output-model").empty();
        $("#output-model").html(text);
        let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        $("mark").css("color", "#" + randomColor);
    }
});

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
    var currentTab = e.target;
    if ($(this).hasClass('add-tab')) {
        return;
    }
    var idTab = $(currentTab).attr('data-target');
    idEditor = $(idTab).find('.ace').attr("id");
    editors[idEditor].focus();
});

$(document).on('click', '#dwn-output', function () {
    downloadOutput();
});

$(document).on('click', '#clear-output', function () {
    $('#output-model').empty();
    $('#output-error').empty();
});

$(document).on('click', '#split', function () {
    addSouthLayout(layout);
    setSizePanes();
});

$(document).on('click', '#split-up', function () {
    addEastLayout(layout);
    setSizePanes();
});

// Sets the solvers and options on language change
$(document).on('change', '#inputLanguage', function (event) {
    inizializeAutoComplete();

    loadLanguageSolvers();
});

// Sets the options on solver change
$(document).on('change', '#inputengine', function (event) {
    loadSolverOptions();
    loadSolverExecutors();

    // Snippets
    inizializeSnippets();
});

/**
 * @description - Load the languages
 */
function loadLanguages() {
    var inputLanguage = $('#inputLanguage');

    inputLanguage.empty();
    inputLanguage.append(getLanguages());
    inputLanguage.change();
}

/**
 * @description - Get avalable the languages
 */
function getLanguages() {
    return $('#servicesContainer > option').clone();
}

/**
 * @description - Load the solvers for a specific language
 */
function loadLanguageSolvers() {
    var language = $('#inputLanguage').val();
    var inputSolver = $('#inputengine');

    // Check that the value is not empty
    if (language !== '') {
        // Clear the values
        inputSolver.empty();
        $('.form-control-option').empty();

        // Load the solvers
        inputSolver.append(getLanguageSolvers(language));

        // Call the listener and select the first value
        inputSolver.change();
    }
}

/**
 * @description - Get the solvers for a specific language
 * @param {Object} language
 */
function getLanguageSolvers(language) {
    return $('#servicesContainer [name="solvers"][value="' + language + '"] > option').clone();
}

/**
 * @description - Load the executors for a specific solver
 */
function loadSolverExecutors() {
    var inputLanguage = $('#inputLanguage');
    var inputSolver = $('#inputengine');
    var inputExecutor = $('#inputExecutor');

    var language = inputLanguage.val();
    var solver = inputSolver.val();

    // Check that the value is not empty
    if (language !== '' && solver !== '') {
        inputExecutor.empty();

        // Append the executors to the DOM
        inputExecutor.append(getSolverExecutors(language, solver));

        // Select the first executor
        inputExecutor.change();
    }
}

/**
 * @description - Get the executors for a specific solver
 * @param {Object} language
 * @param {Object} solver
 */
function getSolverExecutors(language, solver) {
    return $('#servicesContainer [name="solvers"][value="' + language + '"] [name="executors"][value="' + solver + '"] > option').clone();
}

/**
 * @description - Load the options for a specific solver
 */
function loadSolverOptions() {
    var inputLanguage = $('#inputLanguage');
    var inputSolver = $('#inputengine');

    var language = inputLanguage.val();
    var solver = inputSolver.val();

    // Check that the value is not empty
    if (language !== '' && solver !== '') {
        $('.form-control-option').empty();

        // Append the options to the DOM
        $('.row-option .form-control-option').append(getSolverOptions(language, solver));

        // Select the first option and refresh all input fields
        $('.form-control-option').change();
    }
}

/**
 * @description - Get the options for a specific solver
 * @param {Object} language
 * @param {Object} solver
 */
function getSolverOptions(language, solver) {
    return $('#servicesContainer [name="solvers"][value="' + language + '"] [name="options"][value="' + solver + '"] > option').clone();
}

// Add or remove the 'input type value' based on the option
$(document).on('change', '.form-control-option', function () {
    var val = $(this).val();

    if ($(this).find("[value='" + val + "']").attr('word_argument') == 'true') {
        if (($(this).closest('.row-option').find('.option-values').find('.option-value').length) <= 0) {
            addInputValue($(this).parent());
            $(this).addClass('not-alone');
        }
        setElementsColorMode();
    }
    else {
        $(this).removeClass('not-alone');
        $(this).closest('.row-option').find('.option-value').remove();
        $(this).closest('.row-option').find('.btn-add').remove();
    }
});

$(document).on('click', '.add-tab', function () { // add new tab
    var tabID = addTab($(this), "");
    $("[data-target='#" + tabID + "']").trigger('click'); //active last tab inserted

    var actualTheme = localStorage.getItem("theme") == null ? "" : localStorage.getItem("theme");
    if(actualTheme.length == 0){
        if (localStorage.getItem('mode') === 'dark')
            setThemeEditors(defaultDarkTheme);
        else {
            setThemeEditors(defaultTheme);
        }
    }
    else {
        setThemeEditors(actualTheme)
    }
});

$(document).on('click', '.delete-tab', function (e) { // delete tab
    deleteTab($(this), false);
});

/**
 * @description Add east and remove south layout
 */
function addEastLayout(layout) {
    layout.removePane("south");
    saveOption("outputPos", "east");
    var currentValModel = $('#output-model').text();
    var currentValError = $('#output-error').text();
    $("#split-up").parent().empty();
    layout.addPane("east");
    createTextArea($('.ui-layout-east'));
    var fontSizeO = $('#font-output').val();
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");
    $('#output-model').text(currentValModel);
    $('#output-error').text(currentValError);
}

/**
 * @description Add south and remove east layout
 */
function addSouthLayout(layout) {
    layout.removePane("east");
    saveOption("outputPos", "south");
    var currentValModel = $('#output-model').text();
    var currentValError = $('#output-error').text();
    $("#split").parent().empty();
    layout.addPane("south");
    createTextArea($('.ui-layout-south'));
    var fontSizeO = $('#font-output').val();
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");
    $('#output-model').text(currentValModel);
    $('#output-error').text(currentValError);
    $('#split').children().attr('class', 'fa fa-chevron-up');
    $('#split').attr('id', 'split-up');
}

/**
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
    row.fadeOut(300, function () {
        $(this).remove();
        renameSelectOptionsAndBadge();
    });
}

/**
 * @description Create a new DOM element for the solver's options
 */
function addOptionDOM() {
    var solverOptions = $('#solver-options');

    // Append the DOM element containing the solver's options
    solverOptions.append(getSolverOptionDOMElement());

    // Select the first option
    $('.row-option .form-control-option').last().change();
}

/**
 * @param inputClass - class of the clicked button to find the closest row
 * @description Delete input value to the DOM and if the lenght of the class is equal to one, append the button to add input value
 */
function deleteInputValue(inputClass) {
    var inputValue = $(inputClass).closest('.row-option');
    if (inputValue.find('.option-value').length > 1) {
        inputClass.parent().remove();
    }
    else {
        inputClass.siblings('.option-value').val("");
    }
}

/**
 * @param inputClass - class of the clicked button to find the closest row
 * @description Add the input type to a correct class parent
 */
function addInputValue(inputClass) {
    var currentName = $(inputClass).closest('.row-option').find('.form-control-option').attr('name');
    /**
     * replace 'name' in 'value' for correct json format
     * @example currentName=option[0][name] , replaceName=option[0][value][]
     */
    var replaceName = currentName.replace('name', 'value');
    replaceName += '[]';
    inputClass.closest('.row-option').find('.option-values').append('<div class="input-group"><input type="text" class="form-control form-control-value option-value" name=' + replaceName + '><span class="btn-del-value"><i class="fa fa-trash"></i></span></div>');
    $(inputClass).siblings('.option-values').after('<button type="button" class="btn btn-light btn-add btn-block"> <i class="fa fa-plus"></i> Add value</button>');
}

/**
 * @param {Object} text - configuration in json format
 * @returns {boolean}
 * @description check if the configration file has the correct property to set. If not, return false and display the content of the file in the text editor
 */
function setJSONInput(config) {
    if ({}.hasOwnProperty.call(config,'language') || {}.hasOwnProperty.call(config,'engine') || {}.hasOwnProperty.call(config,'executor') || {}.hasOwnProperty.call(config,'option')
        || {}.hasOwnProperty.call(config,'program') || {}.hasOwnProperty.call(config,'output_model') || {}.hasOwnProperty.call(config,'output_error') || {}.hasOwnProperty.call(config,'tabname')) {
        $('.nav-tabs li:not(:last)').each(function (index, element) {
            var id = $(this).find("a").attr("data-target");
            $(this).remove();
            $(id).remove();
            // console.log('remove', (index + 1));
            $('.check-run-tab[value="editor' + (index + 1) + '"]').remove();
        });
        var tabID;
        $(config.program).each(function (index, element) {
            tabID = addTab($(".add-tab"), config.program[index]);
        });
        $("[data-target='#" + tabID + "']").trigger('click'); // active last tab inserted
        if ({}.hasOwnProperty.call(config,'tab')) {
            $(config.tab).each(function (index, element) {
                $('.check-run-tab[value="' + element + '"]').find('.check-icon').toggleClass('invisible');
                $('.check-run-tab[value="' + element + '"]').toggleClass('checked');
            });
        }
        if ({}.hasOwnProperty.call(config,'runAuto')) {
            $("#run-dot").prop('checked', true);
        }
        else {
            $("#run-dot").prop('checked', false);
        }
        $('#inputLanguage').val(config.language).change();
        $('#inputengine').val(config.engine).change();
        $('#inputExecutor').val(config.executor).change();
        $('#output-model').text(config.output_model);
        $('#output-error').text(config.output_error);

        setOptions(config);
        setTabsName(config);
        initializeCheckTabToRun();
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
function addOption(option) {
    $('#btn-add-option').trigger('click');
    var lastOption = $('.row-option').last();
    lastOption.find('.form-control-option').val(option.name).change();
    if (option.value != null) {
        option.value.forEach(function (item, index) {
            if (index == 0) {
                lastOption.find('.option-value').last().val(item);
            }
            else if (index >= 1) {
                lastOption.find('.btn-add').trigger('click');
                lastOption.find('.option-value').last().val(item);
            }
        });
    }
}

/**
 * @param {string} expanded - check if the upload container is expanded to resize the components
 * @description set the height of the components with the height of your browser
 */
function setHeightComponents(expanded, open) {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // cross-browser solution
    var navbarHeight = $('.navbar').outerHeight(true);
    var tabpanel = $(".nav-tabs").outerHeight(true);

    $('.ace').css('height', height - navbarHeight - tabpanel);

    if (expanded !== undefined || open == true) {
        var containerUpload = $('#upload-container').outerHeight(true);
        containerUpload += 22;
        $('.left-panel').css('height', height - (navbarHeight + containerUpload));
        $('.layout').css('height', height - (navbarHeight + containerUpload));
        $('.ui-layout-pane-east').css('height', height - (navbarHeight + containerUpload));
        $('.ui-layout-pane-center').css('height', height - (navbarHeight + containerUpload + 10));
        $('.ace').css('height', height - (navbarHeight + tabpanel + containerUpload));
        if (expanded === "true") {
            $(window).trigger('resize');
        }
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
    $(".output-container").remove();
    $(layout).append('<div class="output-container"><div id="setting-output"> Output <div role="group" class="float-right"> <button type="button" id="dwn-output" class="btn btn-light btn-sm" data-toggle="tooltip" data-placement="bottom" title="Save output" data-delay=\'{"show":"700", "hide":"0"}\'><i class="fa fa-download" aria-hidden="true"></i></button> <button type="button" id="clear-output" class="btn btn-light btn-sm" data-toggle="tooltip" data-placement="bottom" title="Clear output" data-delay=\'{"show":"700", "hide":"0"}\'><i class="fa fa-eraser" aria-hidden="true"></i></button> <button type="button" id="split" class="btn btn-light btn-sm" title="Split"> <i class="fa fa-chevron-down" aria-hidden="true"></i> </button></div></div> <div id="output" class="output"> <div id="output-model" class="pb-2"></div><div id="output-error"></div></div> </div>');
    setLoideStyleMode();
    $('#dwn-output').tooltip();
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = document.getElementById("files").files;

    if (files.length === 0) {
        files = evt.dataTransfer.files;
    }

    if (files.length == 1) {
        let reader = new FileReader();
        reader.onload = function (event) {
            var text = event.target.result;
            if (isJosn(text)) {
                var jsontext = JSON.parse(text); // takes content of the file in the response
                if (!setJSONInput(jsontext)) {
                    editors[idEditor].setValue(JSON.stringify(text)); // set value of the file in text editor
                }
                inizializeTabContextmenu();
            } else {
                editors[idEditor].setValue(text);
            }
        };
        reader.readAsText(files[0]);
    } else {
        getValidFileList(files, onDone)
    }

    /**
     * remove and close container after success upload
     */
    $('.collapse').collapse('hide');
    setHeightComponents();
    $('#files').val("");
}

function getValidFileList(files, callback) {
    var count = files.length;              // total number of files
    var data = {
        names: [],
        texts: []
    };                     // accepted files

    // Get the selected files
    for (let i = 0; i < count; i++) {       // invoke readers
        checkFile(files[i]);
    }

    function checkFile(file) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var text = this.result;
            // Here I parse and check the data and if valid append it to texts
            data.texts.push(text);        // or the original `file` blob..
            data.names.push(file.name);

            if (!--count) callback(data);  // when done, invoke callback
        };
        reader.readAsText(file);
    }
}

function onDone(data) {
    var tabOpened = $('.btn-tab').length;
    var tabID;
    var openOnFirst = false;
    for (let index = 0; index < data.texts.length; index++) {
        if (tabOpened == 1) {
            if (index == 0) {
                if (editors[idEditor].getValue().trim() === '') {
                    editors[idEditor].setValue(data.texts[index]);
                    openOnFirst = true;
                }
                else {
                    tabID = addTab($(".add-tab"), data.texts[index]);
                }
            }
            else {
                tabID = addTab($(".add-tab"), data.texts[index]);
            }
        }
        else {
            tabID = addTab($(".add-tab"), data.texts[index]);
        }
    }
    if (tabOpened == 1) {
        $("a[data-target='#tab1']").trigger('click');
    }
    else {
        $("[data-target='#" + tabID + "']").trigger('click'); // active last tab inserted
    }

    $('.name-tab').each(function (index) {
        if (openOnFirst) {
            $(this).text(data.names[index]);
            let id = index + 1;
            let editor = "editor" + id;
            $('.check-run-tab[value="' + editor + '"]').find('.check-tab-name').text(data.names[index]);
        }
        else {
            if (index > tabOpened - 1) {
                $(this).text(data.names[index - tabOpened]);
                let id = index + 1;
                let editor = "editor" + id;
                $('.check-run-tab[value="' + editor + '"]').find('.check-tab-name').text(data.names[index - tabOpened]);
            }
        }
    });
    inizializeTabContextmenu();
    setAceMode();
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
    editors[ideditor].jumpToMatching();

    var actualTheme = localStorage.getItem("theme") == null ? "" : localStorage.getItem("theme");
    if(actualTheme.length == 0){
        if (localStorage.getItem('mode') === 'dark')
            editors[ideditor].setTheme(defaultDarkTheme);
        else {
            editors[ideditor].setTheme(defaultTheme);
        }
    }
    else {
        editors[ideditor].setTheme(actualTheme);
    }

    editors[ideditor].setValue(text);
    editors[ideditor].resize();
    editors[ideditor].setBehavioursEnabled(true);
    editors[ideditor].setOptions({
        fontSize: 15,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        cursorStyle: "smooth",
        copyWithEmptySelection: true,
        scrollPastEnd: 0.5
    });

    editors[ideditor].commands.addCommand(
        {
            name: 'save',
            bindKey: {win: "ctrl-s", "mac": "cmd-s"},
            exec: function(editor) {
                downloadLoDIEProject();
            }
        }
    );

    editors[ideditor].commands.addCommand(
        {
            name: 'share',
            bindKey: {win: "ctrl-shift-s", "mac": "cmd-shift-s"},
            exec: function(editor) {
                $('#btn-share').trigger('click');
            }
        }
    );

    editors[ideditor].commands.addCommand(
        {
            name: 'open',
            bindKey: {win: "ctrl-o", "mac": "cmd-o"},
            exec: function(editor) {
                $('#btn-upload').trigger('click');
            }
        }
    );

    editors[ideditor].commands.addCommand(
        {
            name: 'run-options',
            bindKey: {win: "ctrl-shift-o", "mac": "cmd-shift-o"},
            exec: function(editor) {
                $('#btn-option').trigger('click');
            }
        }
    );

    inizializeSnippets();

    /**
     * Execute the program when you insert a . and if the readio button is checked
     */
    editors[ideditor].on('change', function (e) {
        if ($('#run-dot').prop('checked')) {
            if (e.lines[0] === '.') {
                intervalRun();
            }
        }
        if (e.lines[0] === "'") {
            operation_alert({ reason: "Single quotes not yet supported" });
            editors[ideditor].replaceAll("", { "needle": "'" });
        }
        inizializeAutoComplete();
    });
    setHeightComponents();
}

/**
 * @description inizialize shortcuts and set title to the tooltips base on the OS
 */
function inizializeShortcuts() {

    Mousetrap.bind('mod+enter', function () {
        $('#run').trigger('click');
        return false;
    });
    
    Mousetrap.bind('mod+s', function () {
        downloadLoDIEProject();
        return false;
    });
    
    Mousetrap.bind('mod+o', function () {
        $('#btn-upload').trigger('click');
        return false;
    });

    Mousetrap.bind('mod+shift+s', function () {
        $('#btn-share').trigger('click');
        return false;
    });

    Mousetrap.bind('mod+shift+o', function () {
        $('#btn-option').trigger('click');
        return false;
    });

    Mousetrap.bind('?', function() {
        console.log('questioooon');
        $('#modal-about').modal('hide');
        $('#setting-editor').modal('hide');
        $('#shortcut').modal('show');
    });

    if (window.navigator.userAgent.indexOf("Mac") !== -1) {

        $('[for="run"]').attr('data-original-title', '{ ⌘ + Enter }');
        $('#btn-upload').attr('data-original-title', '{ ⌘ + O }');
        $('[for="btn-download"]').attr('data-original-title', '{ ⌘ + S}');
        $('#btn-share').attr('data-original-title', '{ ⌘ + ⇧ + S}');

    } else {

        $('[for="run"]').attr('data-original-title', '{ CTRL + Enter }');
        $('#btn-upload').attr('data-original-title', '{ CTRL + O }');
        $('[for="btn-download"]').attr('data-original-title', '{ CTRL + S }');
        $('#btn-share').attr('data-original-title', '{ CTRL + ⇧ + S}');
    }
}

/**
 * @returns {boolean}
 * @description add the programs into the input type hidden to serialize
 */
function addMorePrograms() {
    var check = false;

    $('.check-run-tab.checked:not(.check-auto-run-tab)').each(function (index, element) {
        check = true;
        var p = editors[$(this).val()].getValue();
        $('.layout').prepend("<input type='hidden' name='program[" + index + "]' id='program" + $(this).val() + "' value='" + p + "' class='programs'>");
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

    while ($("#" + tabid).length !== 0) {
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
    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        editors[idE].setTheme(theme);
    }
}

/**
 * @param {number} size - font's size
 * @description Sets the font's size to all the editors
 */
function setFontSizeEditors(size) {
    var length = $(".nav-tabs").children().length;
    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        editors[idE].setFontSize(size + "px");
    }
}

/**
 * @param {number} theme - theme
 * @description Sets the theme to all the editors
 */
function setThemeEditors(theme) {
    var length = $(".nav-tabs").children().length;
    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        editors[idE].setTheme(theme);
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
    theme = theme !== null ? theme : defaultTheme;
    $('#theme').val(theme);
    setTheme(theme);

    var fontSizeE = localStorage.getItem("fontSizeE");
    fontSizeE = fontSizeE !== "" ? fontSizeE : defaultFontSize;
    $('#font-editor').val(fontSizeE);
    setFontSizeEditors(fontSizeE);

    var fontSizeO = localStorage.getItem("fontSizeO");
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");

    var outputSize = localStorage.getItem("outputSize");
    if (outputSize !== null) {
        $('#output').parent().css("width", outputSize);
    }

    var layoutPos = localStorage.getItem("outputPos");
    layoutPos = layoutPos !== null ? layoutPos : "east";
    if (layoutPos === "east") {
        addEastLayout(layout);
    } else {
        addSouthLayout(layout);
    }
}

/**
 * @param {JSON} - obj
 * @description deletes all the options and add them to the DOM
 */
function setOptions(obj) {
    $('#solver-options').empty();
    $(obj.option).each(function (index, item) { // create option's form
        if (item !== null) {
            addOption(item);
        }
    });
}

/**
 * @returns {string}
 * @param {string} obj - where insert the tab
 * @param {string} text - set value of the editor
 * @description Adds tab to the DOM
 */
function addTab(obj, text, name) {
    var id = $(".nav-tabs").children().length;
    var tabId = generateIDTab();
    var editorId = "editor" + id;
    var tabName = name == null ? 'L P ' + id : name;
    $('<li class="nav-item"><a data-target="#' + tabId + '" role="tab" data-toggle="tab" class="btn-tab nav-link"> <button type="button" class="btn btn-light btn-sm btn-context-tab"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></button> <span class="name-tab unselectable">' + tabName + '</span> <span class="delete-tab"> <i class="fa fa-times"></i> </span> </a> </li>').insertBefore($('.add-tab').parent());
    $('.tab-content').append('<div role="tabpanel" class="tab-pane fade" id="' + tabId + '"><div id="' + editorId + '" class="ace"></div></div>');
    setUpAce(editorId, text);
    $('#tab-execute-new').append('<button type="button" class="list-group-item list-group-item-action check-run-tab" value="' + editorId + '"> <div class="check-box"><i class="fa fa-check check-icon invisible" aria-hidden="true"></i></div>  <span class="check-tab-name"> ' + tabName + '</span> </button>');
    addCommand(editorId);

    inizializeTabContextmenu();
    initializeCheckTabToRun();
    setAceMode();
    setElementsColorMode();
    
    var currentFontSize = $('#font-editor').val();
    if (currentFontSize.length == 0) {
        editors[editorId].setFontSize(currentFontSize + "px");
    }
    else {
        editors[editorId].setFontSize(currentFontSize + "px");
    }

    return tabId;
}

/**
 *
 * @param {int} ideditor - editor id
 * @description Add New Commands and Keybindings
 */
function addCommand(ideditor) {
    editors[ideditor].commands.addCommand({
        name: 'myCommand',
        bindKey: { win: 'Ctrl-enter', mac: 'Command-enter' },
        exec: function (editor) {
            intervalRun();
        },
        readOnly: true
    });
}

/**
 * @description Reset editor options with default values
 */
function resetEditorOptions() {
    $('#theme').val(defaultTheme);
    saveOption("theme", defaultTheme);
    setTheme(defaultTheme);

    $('#font-editor').val(defaultFontSize);
    saveOption("fontSizeE", defaultFontSize);
    setFontSizeEditors(defaultFontSize);

    $("#font-output").val(defaultFontSize);
    saveOption("fontSizeO", defaultFontSize);
    $('#output').css('font-size', defaultFontSize + "px");

    setLoideStyleMode('light');
}

/**
 * @description Reset solver options with default values
 */
function resetSolverOptions() {
    loadLanguages();
    $("#run-dot").prop('checked', true);
    $('#solver-options').empty();
}

function closeAllPopovers(iam) {
    // close contestmenu popovers
    $('.btn-tab').popover('hide');
    if (iam != popoverType.SAVE) $('.popover-download').popover('hide');
    if (iam != popoverType.SHARE) $('.popover-share').popover('hide');
}

const popoverType = {
    SAVE: 'save',
    SHARE: 'share'
}

function inizializePopovers() {

    $(".popover-download").popover({
        trigger: 'manual',
        html: true,
        placement: 'bottom',
        // content: ' ',
    }).click(function (e) {
        closeAllPopovers(popoverType.SAVE);
        $(this).popover('toggle');
        $('.popover-download').not(this).popover('hide');

        e.stopPropagation();
    });

    $('body').on('click', function (e) {
        $('.popover-download').each(function () {
            if (e.target.id !== 'btn-download' && !$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('.popover-download').on('inserted.bs.popover', function () {

        // set what happens when user clicks on the button
        $('.popover-header').last().html('');
        $('.popover-body').last().html(
            '<div class="save-content">\n' +
            '<h6 class="mb-2"> Save the project to:\n </h6>' +
            '<div class="save-btn text-center">\n' +
            '<button id="local-download" class="btn btn-outline-dark btn-saver btn-block">Local</button>\n' +
            // '<button id="cloud-download" class="btn btn-outline-dark btn-saver btn-block" disabled>Cloud</button>\n' +
            '</div>\n' +
            '</div>');

        if (localStorage.getItem('mode') === 'dark') {
            $('#local-download').removeClass('btn-outline-dark');
            $('#local-download').addClass('btn-outline-light');
            // $('#cloud-download').removeClass('btn-outline-dark');
            // $('#cloud-download').addClass('btn-outline-light');
        }
        else {
            $('#local-download').removeClass('btn-outline-light');
            $('#local-download').addClass('btn-outline-dark');
            // $('#cloud-download').removeClass('btn-outline-light');
            // $('#cloud-download').addClass('btn-outline-dark');
        }

        $("#local-download").on('click', function () {
            downloadLoDIEProject();

            // TO MOVE ON OUTPUT DOWNLOAD
            
            /* if($('#only-output').is(":checked")){
                $('#program').removeAttr('name', 'program[0]');
                $('#output-form').attr('name', 'output');
                var text = $("#output").text();
                $('#output-form').val(text);
                form = $('#input').serializeFormJSON();
                stringify = JSON.stringify(form);
                createFileToDownload(stringify, "local","LoIDE_Output", "json");
                $('#program').attr('name', 'program[0]');
                $('#output-form').removeAttr('name', 'output');
             } */
        });
        
         /* $("#cloud-download").on('click', function () {
           console.log('Save on cloud');
         }); */
         
    });

    $('.popover-download').on('hidden.bs.popover', function () {
        // clear listeners
        $("#local-download").off('click');
        $("#cloud-download").off('click');
        $('.navbar-toggler').off('click');
    });

    $(".popover-share").popover({
        container: 'body',
        trigger: 'manual',
        html: true,
        placement: 'bottom',

    }).click(function (e) {
        closeAllPopovers(popoverType.SHARE);
        $(this).popover('toggle');
        $('.popover-share').not(this).popover('hide');
        e.stopPropagation();
    });

    $('body').on('click', function (e) {
        $('.popover-share').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('.popover-share').on('inserted.bs.popover', function () {

        $('.popover-header').last().html('');
        $('.popover-body').last().html('' +
            '<div class="popover-share-content">\n' +
            '<h6 class="mb-2"> Share the project:\n </h6>' +
            '<div class="input-group">' +
            '<input id="link-to-share" type="text" class="form-control" readonly>' +
            '<div class="input-group-append">' +
            '<button class="btn btn-outline-dark" type="button" id="btn-copy-link" data-clipboard-target="#link-to-share"><i class="fa fa-clipboard"></i></button>' +
            '</div>' +
            '</div>' +
            // '<div class="text-center mt-2 mb-2"> or </div>' +
            // '<button id="share-btn-download" type="button" class="btn btn-outline-dark btn-block">Download</button>\n' +
            // '<button id="share-btn-save-on-cloud" type="button" class="btn btn-outline-dark btn-block" disabled>Save on cloud</button>\n' +
            '</div>');

        if (localStorage.getItem('mode') === 'dark') {
            $('#btn-copy-link').removeClass('btn-outline-dark');
            $('#btn-copy-link').addClass('btn-outline-light');
        }
        else {
            $('#btn-copy-link').removeClass('btn-outline-light');
            $('#btn-copy-link').addClass('btn-outline-dark');
        }

        $('#link-to-share').val("Loading...");
        createURL();

    });

    $('.popover-share').on('hidden.bs.popover', function () {
        $('#btn-copy-link').off('click');
    });
}

function inizializeToolbar() {

    $('#btn-undo').on('click', function () {
        var undoManager = editors[idEditor].session.getUndoManager();
        if (undoManager.hasUndo()) {
            undoManager.undo();
        }
    });

    $('#btn-redo').on('click', function () {
        var undoManager = editors[idEditor].session.getUndoManager();
        if (undoManager.hasRedo()) {
            undoManager.redo();
        }

    });

    $('#btn-search').on('click', function () {

        var searchPanel = $('#' + idEditor).find('.ace_search');

        if (searchPanel.length == 0) {
            editors[idEditor].execCommand("find");
        }
        else {
            if (searchPanel.css('display') == 'none') {
                searchPanel.css('display', 'block');
            }
            else {
                searchPanel.css('display', 'none');
            }
        }

    });

    $('#btn-copy').on('click', function () {
        copyStringToClipboard(editors[idEditor].getCopyText());
        editors[idEditor].focus();
    });

    $('#btn-cut').on('click', function () {
        copyStringToClipboard(editors[idEditor].getCopyText());
        editors[idEditor].execCommand("cut");
        editors[idEditor].focus();
    });

    var clipboardSupport = typeof(navigator.clipboard)=='undefined' ? false : true;

    if (clipboardSupport) {
        $('#btn-paste').on('click', function () {
            navigator.clipboard.readText()
                .then(text => {
                    editors[idEditor].insert(text);
                })
                .catch(err => {
                    // maybe user didn't grant access to read from clipboard
                    operation_alert({ reason: 'Clipboard read error, maybe you didn\'t grant the access to read from the clipboard.' });
                    console.error((err));
                });
        });
    }
    else {
        console.error('Clipboard API is not supported in this browser');
        $('#btn-paste').remove();
    }

    $('#btn-dwn-this-lp').on('click', function () {
        downloadCurrentTabContent();
    });

    $('#delete-all-tabs').on('click', function () {
        deleteAllTabs();
    });
}

function deleteAllTabs() {
    var r = confirm("Are you sure you want to delete all tabs? This cannot be undone.");
    if(r) {
        $('.delete-tab').each(function(){
            deleteTab($(this), true);
        });
    }
}

function deleteTab(tab, all) {
    if (!all) { var r = confirm("Are you sure you want to delete this file? This cannot be undone."); }
    var ids = $(".nav-tabs").children().length - 1;
    var t = tab.parent().attr('data-target');
    var currentids = $(t).find(".ace").attr("id").substr(6);
    var parse = parseInt(currentids);
    if (r || all) {
        var prevEditor = tab.parent().parent().prev();
        if (prevEditor.length === 0) {
            prevEditor = tab.parent().parent().next();
        }
        var currentID = tab.closest('a').attr('data-target');
        tab.parent().parent().remove();
        var ideditor = $(currentID).find('.ace').attr("id");
        $(currentID).remove();
        delete editors[ideditor];
        $("[data-target='" + prevEditor.find("a").attr("data-target") + "']").trigger('click');
        $('.check-run-tab[value="' + ideditor + '"]').remove();

        if ($(".nav-tabs").children().length === 1) { // add a new tab if we delete the last
            let parent = $('.add-tab').parent();
            idEditor = 'editor1';
            ideditor = 'editor1';
            $('<li class="nav-item"> <a data-target="#tab1" role="tab" data-toggle="tab" class="btn-tab nav-link"> <button type="button" class="btn btn-light btn-sm btn-context-tab"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></button> <span class="name-tab unselectable">L P 1</span> <span class="delete-tab"> <i class="fa fa-times"></i> </span> </a> </li>').insertBefore(parent);
            $('.tab-content').append('<div role="tabpanel" class="tab-pane fade" id="tab1"><div id="editor1" class="ace"></div></div>');
            editors[ideditor] = new ace.edit(ideditor);
            setUpAce(ideditor, "");
            $('#tab-execute-new').append('<button type="button" class="list-group-item list-group-item-action check-run-tab" value="' + ideditor + '">  <div class="check-box"><i class="fa fa-check check-icon invisible" aria-hidden="true"></i></div>  <span class="check-tab-name"> L P 1 </span> </button>');
            $("[data-target='#tab1']").trigger('click');

            inizializeTabContextmenu();
            initializeCheckTabToRun();
            setAceMode();
            setElementsColorMode();
        }
        else if (ids !== parse) { // renumber tabs if you delete the previous tab instead of the current one
            // $('.nav-tabs').find('li:not(:last)').each(function (index) {
            //     tab.find('a').text('L P ' + (index + 1));
            //     tab.find('a').append('<span class="delete-tab"> <i class="fa fa-times"></i> </span>');
            // });
            $('.tab-content').find("[role='tabpanel']").each(function (index) {
                ideditor = 'editor' + (index + 1);
                let currentEditor = tab.find('.ace').attr('id');
                if (ideditor !== currentEditor) {
                    tab.find('.ace').attr("id", ideditor);
                    editors[ideditor] = editors[currentEditor];
                    delete editors[currentEditor];
                    var currentCheck = $('.check-run-tab[value="' + currentEditor + '"]');
                    var wasInvisible = false;
                    if (currentCheck.find('check-icon').hasClass('invisible')) {
                        wasInvisible = true;
                    }
                    currentCheck.empty();
                    currentCheck.attr('value', ideditor);
                    currentCheck.append('<div class="check-box"><i class="fa fa-check check-icon invisible" aria-hidden="true"></i></div>  <span class="check-tab-name">L P ' + (index + 1) + '</span>');
                    if (!wasInvisible) {
                        currentCheck.find('check-icon').removeClass('invisible');
                    }
                }
                $('.btn-tab').each(function (index) {
                    var thisTab = tab;
                    var idTabEditor = tab.attr('data-target');
                    var idEditorToChangeTabName = $(idTabEditor).children().attr('id');
                    var nameValue = thisTab.children('.name-tab').text();
                    $('.check-run-tab[value="' + idEditorToChangeTabName + '"]').find('.check-tab-name').text(nameValue);
                });
            });
        }
        if ($(".nav-tabs").children().length === 2) {
            idEditor = "editor1";
        }
    }
}

function downloadCurrentTabContent() {
    var text = editors[idEditor].getValue();
    var TabToDownload = $('#' + idEditor).parent().attr('id');
    var nameTab = $(".btn-tab[data-target='#" + TabToDownload + "']");
    var string = nameTab.text().replace(/\s/g, '');
    createFileToDownload(text, "local", "LogicProgram_" + string, "txt");
}

function runCurrentTab() {
    $("#output-model").empty();
    $("#output-error").empty();
    $("#output-model").text("Sending..");
    callSocketServer(true);
}

function inizializeSnippets() {
    var languageChosen = $('#inputLanguage').val();
    var solverChosen = $('#inputengine').val();

    var langTools = ace.require('ace/ext/language_tools');

    langTools.setCompleters([]); // reset completers.

    // completer that include snippets and some keywords
    var completer;

    switch (languageChosen) {
        case "asp":
            switch (solverChosen) {
                case "dlv":
                    completer = {
                        identifierRegexps: [/[a-zA-Z_0-9\#\$\-\u00A2-\uFFFF]/],
                        getCompletions: function (editor, session, pos, prefix, callback) {
                            var completions = [
                                {
                                    caption: "#const",
                                    snippet: "#const ${1:namedConstant} = ${2:costant}",
                                    meta: "keyword"
                                },
                                {
                                    caption: "#maxint",
                                    snippet: "#maxint = ${1:Number}",
                                    meta: "keyword"
                                },
                                {
                                    caption: "#append",
                                    snippet: "#append(${1:X}, ${2:Y}, ${3:Z})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#delnth",
                                    snippet: "#delnth(${1:X}, ${2:Y}, ${3:Z})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#flatten",
                                    snippet: "#flatten(${1:X}, ${2:Y}, ${3:Z})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#head",
                                    snippet: "#head(${1:X}, ${2:Y}, ${3:Z})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#insLast",
                                    snippet: "#insLast(${1:X}, ${2:Y}, ${3:Z})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#insnth",
                                    snippet: "#insnth(${1:X}, ${2:Y}, ${3:Z}, ${4:W})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#last",
                                    snippet: "#last(${1:X}, ${2:Y})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#length",
                                    snippet: "#length(${1:X}, ${2:Y})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#member",
                                    snippet: "#member(${1:X}, ${2:Y})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#reverse",
                                    snippet: "#reverse(${1:X}, ${2:Y})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#subList",
                                    snippet: "#subList(${1:X}, ${2:Y})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#tail",
                                    snippet: "#tail(${1:X}, ${2:Y})",
                                    meta: "list predicate"
                                },
                                {
                                    caption: "#getnth",
                                    snippet: "#getnth(${1:X}, ${2:Y}, ${3:Z})",
                                    meta: "list predicate"
                                },

                                // -------
                                {
                                    caption: "+",
                                    snippet: "+(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "-",
                                    snippet: "-(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "*",
                                    snippet: "*(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "/",
                                    snippet: "/(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                // {
                                //     caption: "#int(X)",
                                //     snippet: "#int(${1:Var})",
                                //     meta: "arithmetic predicates"
                                // },
                                {
                                    caption: "#int",
                                    snippet: "#int(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "#suc",
                                    snippet: "#suc(${1:Var1}, ${2:Var2})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "#pred",
                                    snippet: "#pred(${1:Var1}, ${2:Var2})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "#mod",
                                    snippet: "#mod(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "#absdiff",
                                    snippet: "#absdiff(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                {
                                    caption: "#rand",
                                    snippet: "#rand(${1:Var1}, ${2:Var2}, ${3:Var3})",
                                    meta: "arithmetic predicates"
                                },
                                // {
                                //     caption: "#rand(X)",
                                //     snippet: "#rand(${1:Var})",
                                //     meta: "arithmetic predicates"
                                // },
                                {
                                    caption: "#times",
                                    snippet: "#times{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#sum",
                                    snippet: "#sum{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#min",
                                    snippet: "#min{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#max",
                                    snippet: "#max{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#count",
                                    snippet: "#count{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function",
                                },
                                {
                                    caption: ':~',
                                    snippet: ":~ ${1:literals}. [${2:conditions}]",
                                    meta: "weak constraint"
                                },
                                {
                                    caption: ':-',
                                    snippet: ":- ${1:literals}.",
                                    meta: "body/constraint"
                                }
                            ];
                            callback(null, completions);
                        }
                    }
                    langTools.addCompleter(completer);
                    break;

                case "dlv2":
                    completer = {
                        identifierRegexps: [/[a-zA-Z_0-9\#\$\-\u00A2-\uFFFF]/],
                        getCompletions: function (editor, session, pos, prefix, callback) {
                            var completions = [
                                {
                                    caption: "#int",
                                    snippet: "#int",
                                    meta: "keyword"
                                },
                                {
                                    caption: "#times",
                                    snippet: "#times{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#sum",
                                    snippet: "#sum{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#min",
                                    snippet: "#min{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#max",
                                    snippet: "#max{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function"
                                },
                                {
                                    caption: "#count",
                                    snippet: "#count{${1:Vars} : ${2:Congj}}",
                                    meta: "aggregate function",
                                },
                                {
                                    caption: ':~',
                                    snippet: ":~ ${1:literals}. [${2:conditions}]",
                                    meta: "weak constraint"
                                },
                                {
                                    caption: ':-',
                                    snippet: ":- ${1:literals}.",
                                    meta: "body/constraint"
                                }
                            ];
                            callback(null, completions);
                        }
                    }
                    langTools.addCompleter(completer);
                    break;
                case "clingo":
                // add snippets
            }
            break;

        default:
            break;
    }
}

function inizializeAutoComplete() {
    var languageChosen = $('#inputLanguage').val();
    var langTools = ace.require('ace/ext/language_tools');
    inizializeSnippets();
    switch (languageChosen) {
        case "asp": {
            let splitRegex = /(([a-zA-Z_]+[0-9]*)*)(\(.+?\))/gi;
            let words = editors[idEditor].getValue().match(splitRegex);
            if (words != null) {
                let map = new Map();
                words.forEach(function (word) {
                    let name = word.match(/[^_](([a-zA-Z_]+[0-9]*)*)/)[0];
                    let arities = word.match(/\(.+?\)/)[0].split(",").length;
                    map.set(name, arities);
                });
                let completions = [];
                map.forEach(function (key, value) {
                    completions.push({
                        caption: value,
                        snippet: value + giveBrackets(key),
                        meta: "atom"
                    });
                });

                let completer = {
                    getCompletions: function (editor, session, pos, prefix, callback) {
                        callback(null, completions);
                    }
                }

                langTools.addCompleter(completer);
            }
            break;
        }
        default:
            break;
    }
}

function giveBrackets(value) {
    var par = "(";
    var LETTER = "A";
    var limit = 0;
    if (value <= 26)
        limit = value;
    else
        limit = 26;
    for (let i = 0; i < limit; i++) {
        let num = i + 1;
        par += "${" + num + ":" + LETTER + "}";
        if (i !== limit - 1) {
            par += ","
        }
        LETTER = String.fromCharCode(LETTER.charCodeAt(0) + 1);
    }
    par += ")";
    return par;
}

function createURL() {
    var URL = window.location.host + "/?programs=";
    var length = $(".nav-tabs").children().length;
    var empty = true;

    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;

        URL += encodeURIComponent(editors[idE].getValue().trim());
        if (index < length - 1) {
            URL += ','
        }

        if (editors[idE].getValue().length > 0)
            empty = false;
    }

    if (empty) {
        $('#link-to-share').val(window.location.href);
    }
    else {
        // put the name of the tabs
        URL += '&tabnames=';
        let idx = 1
        $('.name-tab').each(function () {
            URL += encodeURIComponent($(this).text());
            if (idx < length - 1) {
                URL += ','
            }
            idx++;
        });

        // put the language
        URL += '&lang=' + $('#inputLanguage').val();

        // put the solver
        URL += '&solver=' + $('#inputengine').val();

        saveOptions();

        let opt = localStorage.getItem("solverOptions");
        if (opt !== null) {
            let obj = JSON.parse(opt);
            if (obj.option != null) {
                // put the options
                URL += '&options=' + encodeURIComponent(JSON.stringify(obj.option));
            }
        }

        try {
            $.ajax({
                method: "POST",
                url: "https://is.gd/create.php?format=json&url=" + encodeURIComponent(URL),
                dataType: 'json',
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    if (data.shorturl == undefined) {
                        $('#link-to-share').val("Ops. Something went wrong");
                        if (URL.length >= 5000) {
                            operation_alert({ reason: "The logic program is too long to be shared." })
                        }
                    } else {
                        $('#link-to-share').val(data.shorturl);
                        $('#btn-copy-link').prop('disabled', false);
                    }
                },
                error: function (err) {
                    console.log(err);
                    $('#link-to-share').val("Ops. Something went wrong");
                }
            });
        }
        catch (e) {
            $('#link-to-share').val("Ops. Something went wrong");
        }
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return results[2];
}

function loadFromURL() {
    var thisURL = window.location.href;

    if (getParameterByName('programs', thisURL) != null) {
        // get params from url
        var logicPr = getParameterByName('programs', thisURL).split(',');
        // console.log('LogicPrograms:', logicPr);

        var tabNames = getParameterByName('tabnames', thisURL).split(',');
        // console.log('TabNames:', tabNames);

        var language = getParameterByName('lang', thisURL);
        // console.log('lang:', language);

        var solver = getParameterByName('solver', thisURL);
        // console.log('solver:', solver);

        var options = getParameterByName('options', thisURL);
        // console.log('options:', options);

        // decode params
        for (let i = 0; i < logicPr.length; i++) {
            logicPr[i] = decodeURIComponent(logicPr[i]);
        }
        // console.log('LogicPrograms decoded:', logicPr);

        for (let i = 0; i < tabNames.length; i++) {
            tabNames[i] = decodeURIComponent(tabNames[i]);
        }
        // console.log('TabNames decoded:', tabNames);

        options = JSON.parse(decodeURIComponent(options));
        // console.log('Options decoded:', options);

        // set params
        for (let index = 1; index <= tabNames.length; index++) {
            if (index > 1)
                $('.add-tab').trigger('click');
            let idE = "editor" + index;
            editors[idE].setValue(logicPr[index - 1]);
        }

        $('.name-tab').each(function (index) {
            $(this).text(tabNames[index]);
            let id = index + 1;
            let editor = "editor" + id;
            $('.check-run-tab[value="' + editor + '"]').find('.check-tab-name').text(tabNames[index]);
        });

        $('#inputLanguage').val(language).change();
        $('#inputengine').val(solver).change();

        if (options != null) {
            $(options).each(function (index, item) {
                if (item !== null) {
                    addOption(item);
                }
            });
        }
    }

}

function setTooltip(btn, message) {
    $(btn).tooltip('hide')
        .attr('data-original-title', message)
        .tooltip('show');
}

function hideTooltip(btn) {
    setTimeout(function () {
        $(btn).tooltip('hide');
    }, 1000);
}

function setClipboard() {
    $('#btn-copy-link').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    var clipboard = new ClipboardJS('#btn-copy-link');

    clipboard.on('success', function (e) {
        setTooltip(e.trigger, 'Copied!');
        hideTooltip(e.trigger);
    });

    clipboard.on('error', function (e) {
        setTooltip(e.trigger, 'Failed!');
        hideTooltip(e.trigger);
    });
}

function setNotifications() {
    $('#notification').toast({
        delay: 4000,
    });
    $('#notification-project').toast({
        delay: 10000,
    });
    $('#load-project').on('click', function () {
        loadProjectFromLocalStorage();
        $('#notification-project').toast('hide');
    });
}

function setWindowResizeTrigger() {
    $('#loide-collapse').on('hidden.bs.collapse', function () {
        $(window).trigger('resize');
    });
    $('#loide-collapse').on('shown.bs.collapse', function () {
        $(window).trigger('resize');
    });
}

function inizializeButtonLoideMode() {
    $('#dark-light-mode').click(function () {
        localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ? 'light' : 'dark');
        localStorage.getItem('mode') === 'dark' ? document.querySelector('body').classList.add('dark') : document.querySelector('body').classList.remove('dark');
        setElementsColorMode();
        $('#theme').change();
    });
}

function setLoideStyleMode(mode) {

    switch (mode) {
        case 'light':
            localStorage.setItem('mode', 'light');
            document.querySelector('body').classList.remove('dark');
            break;

        case 'dark':
            localStorage.setItem('mode', 'dark');
            document.querySelector('body').classList.add('dark');
            break;

        default:
            if (localStorage.getItem('mode') == null)
                localStorage.setItem('mode', 'light');
            ((localStorage.getItem('mode') || 'dark') === 'dark') ? document.querySelector('body').classList.add('dark') : document.querySelector('body').classList.remove('dark');
            break;
    }
    setElementsColorMode();
}

function setElementsColorMode() {
    switch (localStorage.getItem('mode')) {
        case 'light':
            setLightStyleToUIElements();
            break;

        case 'dark':
            setDarkStyleToUIElements();
            break;

        default:
            setLightStyleToUIElements();
            break;
    }
}

function setLightStyleToUIElements() {
    var length = $(".nav-tabs").children().length;

    $('#dark-light-mode').text("Dark");
    $('#theme').val(defaultTheme);
    $(".btn-dark").each(function () {
        $(this).removeClass('btn-dark');
        $(this).addClass('btn-light');
    });
    $(".btn-outline-light").each(function () {
        $(this).addClass('btn-outline-dark');
        $(this).removeClass('btn-outline-light');
    });
    $('#dark-light-mode').addClass('btn-outline-dark');
    $('#dark-light-mode').removeClass('btn-outline-light');
    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        editors[idE].setTheme(defaultTheme);
    }
}

function setDarkStyleToUIElements() {
    var length = $(".nav-tabs").children().length;
    $('#dark-light-mode').text("Light");
    $('#theme').val(defaultDarkTheme);
    $(".btn-light").each(function () {
        $(this).removeClass('btn-light');
        $(this).addClass('btn-dark');
    });
    $(".btn-outline-dark").each(function () {
        $(this).removeClass('btn-outline-dark');
        $(this).addClass('btn-outline-light');
    });
    $('#dark-light-mode').removeClass('btn-outline-dark');
    $('#dark-light-mode').addClass('btn-outline-light');

    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        editors[idE].setTheme(defaultDarkTheme);
    }
}

function saveProjectToLocalStorage() {
    var tabsName = [];
    var logicProgEditors = [];

    $('.name-tab').each(function () {
        tabsName.push($(this).text());
    });
    var length = $(".nav-tabs").children().length;
    for (let index = 1; index <= length - 1; index++) {
        let idE = "editor" + index;
        logicProgEditors.push(editors[idE].getValue());
    }

    saveOption("tabsName", JSON.stringify(tabsName));
    saveOption("logicProgEditors", JSON.stringify(logicProgEditors));
}

function checkProjectOnLocalStorage() {
    if (supportLocalStorage()) {
        var tabsName = [];
        var logicProgEditors = [];
        if (localStorage.getItem("tabsName") != undefined && localStorage.getItem("logicProgEditors") != undefined) {
            tabsName = JSON.parse(localStorage.getItem("tabsName"));
            logicProgEditors = JSON.parse(localStorage.getItem("logicProgEditors"));

            if (tabsName.length > 1 || logicProgEditors[0].trim().length > 0) {
                $('#notification-project').toast('show');
            }
        }
    }
}

function loadProjectFromLocalStorage() {
    if (supportLocalStorage()) {
        var tabsName = [];
        var logicProgEditors = [];
        tabsName = JSON.parse(localStorage.getItem("tabsName"));
        logicProgEditors = JSON.parse(localStorage.getItem("logicProgEditors"));

        for (let index = 1; index <= tabsName.length; index++) {
            if (index > 1)
                $('.add-tab').trigger('click');
            let idE = "editor" + index;
            editors[idE].setValue(logicProgEditors[index - 1]);
        }

        $('.name-tab').each(function (index) {
            $(this).text(tabsName[index]);
            let id = index + 1;
            let editor = "editor" + id;
            $('.check-run-tab[value="' + editor + '"]').find('.check-tab-name').text(tabsName[index]);
        });

        $("a[data-target='#tab1']").trigger('click');

        var opt = localStorage.getItem("solverOptions");
        if (opt !== null) {
            var obj = JSON.parse(opt);
            $('#inputLanguage').val(obj.language).change();
            $('#inputengine').val(obj.engine).change();
            $('#inputExecutor').val(obj.executor).change();
            if (obj.option != null) {
                setOptions(obj);
            }
            if ({}.hasOwnProperty.call(obj,'runAuto')) {
                $("#run-dot").prop('checked', true);
            }
            else {
                $("#run-dot").prop('checked', false);
            }
        }
    }
}

function addTabsNameToDownload() {
    $('.name-tab').each(function (index) {
        $('.layout').prepend("<input type='hidden' name='tabname[" + index + "]' id='tabname" + index + "' value='" + $(this).text() + "' class='tabsname'>");
    });
}

function destroyTabsName() {
    $('.tabsname').each(function (index) {
        $(this).remove();
    });
}

function setTabsName(config) {
    var tabsName = config.tabname;
    $('.name-tab').each(function (index) {
        $(this).text(tabsName[index]);
        let id = index + 1;
        let editor = "editor" + id;
        $('.check-run-tab[value="' + editor + '"]').find('.check-tab-name').text(tabsName[index]);
    });
}

function downloadLoDIEProject() {
    addProgramsToDownload();
    addTabsNameToDownload();

    var model = $("#output-model").text();
    var errors = $("#output-error").text();

    $("#run-dot").attr("name", "runAuto");

    var form = $('#input').serializeFormJSON();

    form.output_model = model;
    form.output_error = errors;
    form.tab = [];

    $('.check-run-tab.checked').each(function (index, element) {
        form.tab.push($(this).val());
    });

    if (form.tab.length == 0) {
        delete form.tab;
    }

    var stringify = JSON.stringify(form);
    createFileToDownload(stringify, "local", "LoIDE_Project", "json");
    destroyPrograms();
    destroyTabsName();
    $("#run-dot").removeAttr("name");
}

function renameSelectOptionsAndBadge() {
    $('.form-control-option').each(function (index) {
        $(this).attr('name', 'option[' + index + '][name]');
        $(this).closest('.row-option').find('.form-control-value').each(function (index2) {
            $(this).attr('name', 'option[' + index + '][value][]');
        });
    });

    $('.option-number').each(function (index) {
        var i = index + 1;
        $(this).text("Option " + i);
    });
}

function closeRunOptionOnMobile() {
    if ($(window).width() <= display.small.size) {
        $('.left-panel').removeClass('left-panel-show');
    }
}

function openRunOptions() {
    $('.left-panel').toggleClass('left-panel-show'); // add class 'left-panel-show' to increase the width of the left panel
    $(".left-panel-show, .left-panel").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
        function () {
            layout.resizeAll();
        });
}

function getHTMLFromJQueryElement(jQueryElement) {
    var DOMElement = '';
    for (let i = 0; i < jQueryElement.length; i++)
        DOMElement += jQueryElement.get(i).outerHTML;

    return DOMElement;
}

function setAceMode() {
    switch ($('#inputLanguage').val()) {
        case 'asp': {
            let length = $(".nav-tabs").children().length;
            for (let index = 1; index <= length - 1; index++) {
                let idE = "editor" + index;
                editors[idE].session.setMode("ace/mode/asp");
            }
            break;
        }

        default: {
            let length = $(".nav-tabs").children().length;
            for (let index = 1; index <= length - 1; index++) {
                let idE = "editor" + index;
                editors[idE].session.setMode("ace/mode/text");
            }
        }
    }
}

function downloadOutput() {
    var outputText = $('#output-model').text() + "\n" + $('#output-error').text();
    createFileToDownload(outputText, 'local', 'LoIDE_output', 'txt');
}
