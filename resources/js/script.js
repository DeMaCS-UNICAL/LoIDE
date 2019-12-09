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
var defaultFontSize = 15;

/**
 * @global
 * @description default ace theme
 */
var defaultTheme = "ace/theme/tomorrow";
var defaultDarkTheme = "ace/theme/idle_fingers";

/**
 * set up ace editors into object
 */
editors = {};
setUpAce(idEditor, "");

/**
 * @global
 * @description default size of the mobile max window width
 */
var mobileMaxWidthScreen = 576;

/**
 * @description - Returns the DOM element for the solver's option
 */
function getSolverOptionDOMElement( ) {
    return "" +
        "<div class=\"row row-option\">" +
            "<div class=\"col-sm-12 form-group\">" +
                "<div class=\"badge-option mb-1\">" +
                    "<span class=\" text-center badge badge-info option-number\"></span>" +
                    "<span class=\" text-center badge badge-danger btn-del-option ml-1\"> <i class=\"fa fa-trash-o\"></i></span>" +
                "</div>" +
                "<div class=\"input-group opname\">" +
                    "<select name=\"option[0][name]\" class=\"form-control form-control-option not-alone\">" +
                        getHTMLFromJQueryElement( getSolverOptions( $('#inputLanguage').val( ), $('#inputengine').val( ) ) ) +
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
    var currentVal;
    var fontSizeO = localStorage.getItem("fontSizeO");
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;
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
        $('#split').children().attr('class', 'fa fa-chevron-up');
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
    setNotifications();

    setClipboard();
    
    inizializePopovers();

    inizializeChangeNameContextmenu();

    inizializeToolbar();

    inizializeButtonLoideMode();

    setWindowResizeTrigger();

    $('img[alt=logo]').on('click',function (e) {
            location.reload();
    });

    layout = $('body > .container > form > .layout').layout({
        onresize_end: function () {
            var length = $(".nav-tabs").children().length;
            for (var index = 1; index <= length - 1; index++) {
                var idE = "editor" + index;
                editors[idE].resize();
            }
        },
        south__minSize: 125,
        resizeWhileDragging: true,
        resizable: true,
        slidable: true,
    });

    $("[data-target='#tab1']").trigger('click'); //active the first tab

    inizializeShortcuts();

    restoreOptions();

    $('#font-output').change(function (e) {
        var size = $(this).val();
        if( size === "") {
            $(this).val(defaultFontSize);
        }
        $('#output').css('font-size', size + "px");
        if (!saveOption("fontSizeO", size)) {
            alert("Sorry, this options will not save in your browser");
        }
    });

    $('#font-editor').change(function (e) {
        var size = $(this).val();
        if( size === "") {
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

    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

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
        setHeightComponents(expandend,true);
    });

    if (window.innerWidth > 450 && localStorage.getItem("outputPos") !== "south") {
        layout.removePane("south");
    } else {
        layout.removePane("east");
        var currentVal = $('#output').text();
        $(".ui-layout-east").empty();
        layout.addPane("south");
        createTextArea($('.ui-layout-south'));
        $('#output').text(currentVal);
        $('#split').children().attr('class', 'fa fa-chevron-up');
        $('#split').attr('id', 'split-up');
    }

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
        $("#output").empty();
        $("#output").text("Sending..");
        callSocketServer();
    });


    $('#input').submit(function (e) {
        e.preventDefault();
        var form;
        var stringify;
        var i = 0;
        if (clkBtn === "run") {
            $("#output").empty();
            $("#output").text("Sending..");
            callSocketServer(false);
        }
        else if (clkBtn === 'save-options') {
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
        $('.option-solver > div').toggleClass(" show"); // add class to show option components
        $(".left-panel-show, .left-panel").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
            function() {
            $(window).trigger('resize');
            });
    });

    $("#reset-editor").click(function () {
        resetEditorOptions();
    });

    $("#reset-options").click(function () {
        resetSolverOptions();
    });

    addCommand(idEditor);

    loadFromURL(); //load program from url

    inizializeSnippets();

    $('#inputLanguage').on('change', function() {
        inizializeAutoComplete();
        setAceMode();
    });

    setLoideStyleMode();

    checkProjectOnLocalStorage();

    setAceMode();

    openRunOptions();

    // Set the default options
    resetSolverOptions();
});

/**
 * @description Serialize form and send it to socket server and waits for the response
 */
function callSocketServer(onlyActiveTab) {
    $('.tab-pane').each(function (index, element) {
        var id = $(this).find('.ace').attr("id");
        editors[id].replaceAll("", {"needle":"'"});
    });
    if (onlyActiveTab || !addMorePrograms()) {
        var text = editors[idEditor].getValue();
        $('#program').val(text); // insert the content of text editor in a hidden input text to serailize
    }
    var form = $('#input').serializeFormJSON();
    if(form.option == null){
        form.option = [{name:""}];
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
            $('#output').text(response.model); // append the response in the container
            if(localStorage.getItem('mode') === 'dark') {
                $('#output').css('color','white');
            }
            else{
                $('#output').css('color','black');
            }
        } else {
            $('#output').text(response.model+response.error);
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

function createFileToDownload(text,where,name,type) {
    var textFileAsBlob = new Blob([text], {

        type: 'application/'+type
    });
    /**
     * specify the name of the file to be saved
     */
    var fileNameToSaveAs = name+ "." + type;
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
    if(where == "local")
    {
        downloadLink.click();
    }
    else if(where == "dropbox"){
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

function inizializeChangeNameContextmenu(){

    $(".btn-tab").popover({
        title: 'Change the tab name',
        container: 'body',
        trigger : 'manual',
        html: true,
        placement: 'right'
    });

    $('body').on('click', function (e) {
        $('.btn-tab').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('body').on('contextmenu', function (e) {
        $('.btn-tab').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('.btn-tab').on('inserted.bs.popover', function() {
        //close other popovers 'click'
        $('.popover-download').popover('hide');
        $('.popover-share').popover('hide');

        $('.popover-body').html('<div class="input-group">\n' +
            '      <input type="text" class="form-control" id="change-name-tab-textbox" placeholder="Type a name">\n' +
            '      <span class="input-group-btn">\n' +
            '        <button class="btn btn-light" type="button" id="change-name-tab"><i class="fa fa-chevron-right"></i></button>\n' +
            '      </span>\n' +
            '    </div>');
        if(localStorage.getItem('mode') === 'dark') {
            $('#change-name-tab').removeClass('btn-light');
            $('#change-name-tab').addClass('btn-dark');
        }
        else{
            $('#change-name-tab').removeClass('btn-dark');
            $('#change-name-tab').addClass('btn-light');
        }
        $('#change-name-tab-textbox').focus();
        var thisTab = $(this);
        var idTabEditor = $(this).attr('data-target');
        idEditorToChangeTabName = $(idTabEditor).children().attr('id');
        $('#change-name-tab').prop('disabled',true);

        $('#change-name-tab-textbox').on('input',function () {
            var nameValue = $('#change-name-tab-textbox').val().trim();
            if(nameValue.length === 0){
                $('#change-name-tab').prop('disabled',true);
            }
            else{
                $('#change-name-tab').prop('disabled',false);
            }
        });

        $('#change-name-tab').on('click',function () {
            var nameValue = $('#change-name-tab-textbox').val().trim();
            if(nameValue.length !== 0) {
                $(':checkbox[value="' + idEditorToChangeTabName + '"]').siblings('span').text(nameValue);
                thisTab.children('.name-tab').text(nameValue);
                thisTab.popover('hide');
            }
        });

        $('#change-name-tab-textbox').on('keyup', function (e) {
            if(e.key == "Enter") {
                $('#change-name-tab').trigger('click');
            }
        });
    });

    $('.btn-tab').on('contextmenu',function (e) { //needed to hide the other context menu opened
        $('.btn-tab').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
        $(this).popover('show');
        return false; //don't show the contest menu of the browser
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
    if($(this).hasClass('add-tab')){
        return;
    }
    idTab = $(currentTab).attr('data-target');
    idEditor = $(idTab).find('.ace').attr("id");
    editors[idEditor].focus();
});

$(document).on('click', '#split', function () {
    addSouthLayout(layout);
});

$(document).on('click', '#split-up', function () {
    addEastLayout(layout);
});

// Sets the solvers and options on language change
$(document).on('change', '#inputLanguage', function(event) {
    inizializeAutoComplete( );

    loadLanguageSolvers( );
});

// Sets the options on solver change
$(document).on('change', '#inputengine', function (event) {
    loadSolverOptions( );
    loadSolverExecutors( );

    // Snippets
    inizializeSnippets( );
});

/**
 * @description - Load the languages
 */
function loadLanguages( ) {
    var inputLanguage   = $('#inputLanguage');

    inputLanguage.empty( );
    inputLanguage.append( getLanguages( ) );
    inputLanguage.change( );
}

/**
 * @description - Get avalable the languages
 */
function getLanguages( ) {
    return $('#servicesContainer > option').clone( );
}

/**
 * @description - Load the solvers for a specific language
 */
function loadLanguageSolvers( ) {
    var language    = $('#inputLanguage').val();
    var inputSolver = $('#inputengine');

    // Check that the value is not empty
    if(language !== '') {
        // Clear the values
        inputSolver.empty();
        $('.form-control-option').empty();
   
        // Load the solvers
        inputSolver.append( getLanguageSolvers( language ) );
        
        // Call the listener and select the first value
        inputSolver.change();
    }
}

/**
 * @description - Get the solvers for a specific language
 * @param {Object} language
 */
function getLanguageSolvers( language ) {
   return $('#servicesContainer [name="solvers"][value="' + language + '"] > option').clone( );
}

/**
 * @description - Load the executors for a specific solver
 */
function loadSolverExecutors( ) {
    var inputLanguage   = $('#inputLanguage');
    var inputSolver     = $('#inputengine');
    var inputExecutor   = $('#inputExecutor');

    var language    = inputLanguage.val();
    var solver      = inputSolver.val();

    // Check that the value is not empty
    if(language !== '' && solver !== '') {
        inputExecutor.empty();

        // Append the executors to the DOM
        inputExecutor.append( getSolverExecutors( language, solver ) );

        // Select the first executor
        inputExecutor.change();
    }
}

/**
 * @description - Get the executors for a specific solver
 * @param {Object} language
 * @param {Object} solver
 */
function getSolverExecutors( language, solver ) {
    return $('#servicesContainer [name="solvers"][value="' + language + '"] [name="executors"][value="' + solver + '"] > option').clone( );
}

/**
 * @description - Load the options for a specific solver
 */
function loadSolverOptions( ) {
    var inputLanguage   = $('#inputLanguage');
    var inputSolver     = $('#inputengine');

    var language    = inputLanguage.val();
    var solver      = inputSolver.val();

    // Check that the value is not empty
    if(language !== '' && solver !== '') {
        $('.form-control-option').empty();

        // Append the options to the DOM
        $('.row-option .form-control-option').append( getSolverOptions( language, solver ) );

        // Select the first option and refresh all input fields
        $('.form-control-option').change();
    }
}

/**
 * @description - Get the options for a specific solver
 * @param {Object} language
 * @param {Object} solver
 */
function getSolverOptions( language, solver ) {
    return $('#servicesContainer [name="solvers"][value="' + language + '"] [name="options"][value="' + solver + '"] > option').clone( );
}

// Add or remove the 'input type value' based on the option
$(document).on('change', '.form-control-option', function () {
    var val = $(this).val();

    if ( $(this).find("[value='" + val + "']").attr('word_argument') == 'true' ) {
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
    inizializeChangeNameContextmenu();
    setAceMode();
});

$(document).on('click', '.delete-tab', function () { // delete tab
    var r = confirm("Are you sure you want to delete this file? This cannot be undone.");
    var ids = $(".nav-tabs").children().length - 1;
    var t = $(this).parent().attr('data-target');
    var currentids = $(t).find(".ace").attr("id").substr(6);
    var parse = parseInt(currentids);
    if (r) {
        var prevEditor = $(this).parent().parent().prev();
        if (prevEditor.length === 0) {
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
            $('<li role="presentation"><a data-target="#tab1" role="tab" data-toggle="tab" class="btn-tab nav-link"><span class="name-tab">L P 1</span><span class="delete-tab"><i class="fa fa-times"></i></span></a> </li>').insertBefore(parent);
            $('.tab-content').append('<div role="tabpanel" class="tab-pane fade" id="tab1"><div id="editor1" class="ace"></div></div>');
            editors[ideditor] = new ace.edit(ideditor);
            setUpAce(ideditor, "");
            $('#tab-execute').append(' <label class="check-run-lp"><input type="checkbox" value="' + ideditor + '"> <span>L P 1</span></label>');
            $("[data-target='#tab1']").trigger('click');
            inizializeChangeNameContextmenu();
        }
        else if (ids !== parse) { // renumber tabs if you delete the previous tab instead of the current one
            // $('.nav-tabs').find('li:not(:last)').each(function (index) {
            //     $(this).find('a').text('L P ' + (index + 1));
            //     $(this).find('a').append('<span class="delete-tab"> <i class="fa fa-times"></i> </span>');
            // });
            $('.tab-content').find("[role='tabpanel']").each(function (index) {
                ideditor = 'editor' + (index + 1);
                var currentEditor = $(this).find('.ace').attr('id');
                if (ideditor !== currentEditor) {
                    $(this).find('.ace').attr("id", ideditor);
                    editors[ideditor] = editors[currentEditor];
                    delete editors[currentEditor];
                    var parent = $(':checkbox[value="' + currentEditor + '"]').parent().empty();
                    $(parent).append('<input type="checkbox" value="' + ideditor + '"> <span class="name-tab">L P ' + (index + 1) + '</span>');
                }
                $('.btn-tab').each(function (index) {
                    var thisTab = $(this);
                    var idTabEditor = $(this).attr('data-target');
                    idEditorToChangeTabName = $(idTabEditor).children().attr('id');
                    var nameValue =thisTab.children('.name-tab').text();
                    $(':checkbox[value="' + idEditorToChangeTabName + '"]').siblings('span').text(nameValue);
                });
            });
            }
        if ($(".nav-tabs").children().length === 2) {
            idEditor = "editor1";
        }
    }
});

/**
 * @description Add east and remove south layout
 */
function addEastLayout(layout) {
    layout.removePane("south");
    saveOption("outputPos", "east");
    var currentVal = $('#output').text();
    $("#split-up").parent().empty();
    layout.addPane("east");
    createTextArea($('.ui-layout-east'));
    var fontSizeO = localStorage.getItem("fontSizeO");
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");
    $('#output').text(currentVal);
}

/**
 * @description Add south and remove east layout
 */
function addSouthLayout(layout) {
    layout.removePane("east");
    saveOption("outputPos", "south");
    var currentVal = $('#output').text();
    $("#split").parent().empty();
    layout.addPane("south");
    createTextArea($('.ui-layout-south'));
    var fontSizeO = localStorage.getItem("fontSizeO");
    fontSizeO = fontSizeO !== "" ? fontSizeO : defaultFontSize;
    $("#font-output").val(fontSizeO);
    $('#output').css('font-size', fontSizeO + "px");
    $('#output').text(currentVal);
    $('#split').children().attr('class', 'fa fa-chevron-up');
    $('#split').attr('id', 'split-up');
}

/**
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
function addOptionDOM( ) {
    var solverOptions = $('#solver-options');

    // Append the DOM element containing the solver's options
    solverOptions.append( getSolverOptionDOMElement( ) );

    // Select the first option
    $('.row-option .form-control-option').last().change();
}

/**
 * @param inputClass - class of the clicked button to find the closest row
 * @description Delete input value to the DOM and if the lenght of the class is equal to one, append the button to add input value
 */
function deleteInputValue(inputClass) {
    var inputValue = $(inputClass).closest('.row-option');
    if(inputValue.find('.option-value').length > 1){
        inputClass.parent().remove();
    }
    else{
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
    if (config.hasOwnProperty('language') || config.hasOwnProperty('engine') || config.hasOwnProperty('executor') || config.hasOwnProperty('option') 
        || config.hasOwnProperty('program') || config.hasOwnProperty('output') || config.hasOwnProperty('tabname')) {
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
        $('#inputLanguage').val(config.language).change();
        $('#inputengine').val(config.engine).change();
        $('#inputExecutor').val(config.executor).change();
        $('#output').text(config.output);
        setOptions(config);
        setTabsName(config);
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
    if(option.value != null){
        option.value.forEach(function (item,index) {
           if(index == 0){
               lastOption.find('.option-value').last().val(item);
           }
           else if(index >= 1){
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
function setHeightComponents(expanded,open) {
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
        if(expanded === "true"){
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
    $("#output").remove();
    $(layout).append('<div id="setting-output"> Output <a role="button" class="pull-right" data-toggle="modal" href="#setting-editor"><i class="fa fa-cog"></i></a> <a role="button" id="split" class="pull-right" href="#"><i class="fa fa-chevron-down"></i></a></div><div id="output" class="output"></div>');
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
            inizializeChangeNameContextmenu();
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
    editors[ideditor].jumpToMatching();
    if(localStorage.getItem('mode') === 'dark')
        editors[ideditor].setTheme(defaultDarkTheme);
    else{
        editors[ideditor].setTheme(defaultTheme);
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
            operation_alert({reason: "Single quotes not yet supported"});
            editors[ideditor].replaceAll("", {"needle":"'"});
        }
        inizializeAutoComplete();
    });
    setHeightComponents();
}

/**
 * @description inizialize shortcuts and set title to the tooltips base on the OS
 */
function inizializeShortcuts() {
    if (window.navigator.userAgent.indexOf("Mac") !== -1) {
        key('command + d', function () {
            downloadLoDIEProject();
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
 * TODO: Restore executor
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
function addTab(obj, text) {
    var id = $(".nav-tabs").children().length;
    var tabId = generateIDTab();
    editorId = "editor" + id;
    $('<li class="nav-item"><a data-target="#' + tabId + '" role="tab" data-toggle="tab" class="btn-tab nav-link"> <span class="name-tab">L P ' + id + '</span> <span class="delete-tab"> <i class="fa fa-times"></i> </span> </a> </li>').insertBefore(obj.parent());
    $('.tab-content').append('<div role="tabpanel" class="tab-pane fade" id="' + tabId + '"><div id="' + editorId + '" class="ace"></div></div>');
    setUpAce(editorId, text);
    $('#tab-execute').append(' <label class="check-run-lp"><input type="checkbox" value="' + editorId + '"> <span>L P ' + id + '</span></label>');
    addCommand(editorId);
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
        bindKey: {win: 'Ctrl-enter',  mac: 'Command-enter'},
        exec: function(editor) {
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
    loadLanguages( );
    $("#run-dot").prop('checked', false);
    $('#solver-options').empty();
}

function inizializePopovers(){
    $(".popover-download").popover({
        trigger : 'manual',
        html: true,
        placement: 'bottom',
        // content: ' ',
    }).click(function(e) {
        $(this).popover('toggle');
        $('.popover-download').not(this).popover('hide');
        e.stopPropagation();
    });

    // $('body').on('click', function (e) {
    //     $('.popover-download').popover('hide');
    // });

    $('.popover-download').on('inserted.bs.popover', function() {

        //close contestmenu popovers
        $('.btn-tab').popover('hide');
        $('#loide-navbar-toogler').on('click',function () {
            $('.popover-download').popover('hide');
        })

        // set what happens when user clicks on the button
        $('.popover-header').html('');
        $('.popover-body').html('<div class="popover-download-content">\n' +
            '<div class="d-flex">\n' +
            '<div>Only output: </div>\n' +
            '<div class="ml-2">\n' +
            '<input id="only-output" type="checkbox">\n' +
            '</div>\n' +
            '</div>\n' +
            '<div class="save-content">\n' +
            '<div class="mt-2 mb-2"> Save to:\n </div>' +
            '<div class="save-btn text-center">\n' +
            '<button id="local-download" class="btn btn-outline-dark btn-saver btn-block">Local</button>\n' +
            // '<button id="cloud-download" class="btn btn-outline-dark btn-saver" disabled>Cloud</button>\n' +
            '</div>\n' +
            '</div>\n' +
            '</div>');

        if(localStorage.getItem('mode') === 'dark') {
            $('#local-download').removeClass('btn-outline-dark');
            $('#local-download').addClass('btn-outline-light');
            $('#cloud-download').removeClass('btn-outline-dark');
            $('#cloud-download').addClass('btn-outline-light');
        }
        else{
            $('#local-download').removeClass('btn-outline-light');
            $('#local-download').addClass('btn-outline-dark');
            $('#cloud-download').removeClass('btn-outline-light');
            $('#cloud-download').addClass('btn-outline-dark');
        }

        $("#local-download").on('click', function(){
            if($('#only-output').is(":checked")){
                $('#program').removeAttr('name', 'program[0]');
                $('#output-form').attr('name', 'output');
                var text = $("#output").text();
                $('#output-form').val(text);
                form = $('#input').serializeFormJSON();
                stringify = JSON.stringify(form);
                createFileToDownload(stringify, "local","LoIDE_Output", "json");
                $('#program').attr('name', 'program[0]');
                $('#output-form').removeAttr('name', 'output');
            }
            else {
                    downloadLoDIEProject();
            }
        });

        $("#cloud-download").on('click', function () {
            if(Dropbox.isBrowserSupported()){
                $('#program').removeAttr('name', 'program[0]');
                $('#output-form').attr('name', 'output');
                var text = $("#output").text();
                $('#output-form').val(text);
                form = $('#input').serializeFormJSON();
                stringify = JSON.stringify(form);
                chose = $('#choice').text();

                // createFileToDownload(stringify, "dropbox", "json")
            }
            else{
                operation_alert({result: "Dropbox not supported on your browser!"});
            }
        });
    });

    $('.popover-download').on('hidden.bs.popover', function(){
        // clear listeners
        $("#local-download").off('click');
        $("#cloud-download").off('click');
        $('.navbar-toggler').off('click');
    });

    $(".popover-share").popover({
        container: 'body',
        trigger : 'manual',
        html: true,
        placement: 'bottom',
    }).click(function(e) {
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

    $('.popover-share').on('inserted.bs.popover', function() {
        //close contestmenu popovers
        $('.btn-tab').popover('hide');
        $('.popover-download').popover('hide');

        $('.popover-body').html('' +
            '<div class="popover-share-content">\n' +
                '<div class="input-group">' +
                    '<input id="link-to-share" type="text" class="form-control" readonly>' +
                    '<div class="input-group-append">'+
                        '<button class="btn btn-outline-dark" type="button" id="btn-copy-link" data-clipboard-target="#link-to-share"><i class="fa fa-clipboard"></i></button>'+
                    '</div>'+
                '</div>' +
                '<div class="text-center mt-2 mb-2"> or </div>' +
                '<button id="share-btn-download" type="button" class="btn btn-outline-dark btn-block">Download</button>\n' +
                // '<button id="share-btn-save-on-cloud" type="button" class="btn btn-outline-dark btn-block" disabled>Save on cloud</button>\n' +
            '</div>');

        if(localStorage.getItem('mode') === 'dark') {
            $('#btn-copy-link').removeClass('btn-outline-dark');
            $('#btn-copy-link').addClass('btn-outline-light');
            $('#share-btn-download').removeClass('btn-outline-dark');
            $('#share-btn-download').addClass('btn-outline-light');
        }
        else{
            $('#btn-copy-link').removeClass('btn-outline-light');
            $('#btn-copy-link').addClass('btn-outline-dark');
            $('#share-btn-download').removeClass('btn-outline-light');
            $('#share-btn-download').addClass('btn-outline-dark');
        }

        $('#link-to-share').val("Loading...");
        createURLtoShare(editors[idEditor].getValue());

        $('#share-btn-download').on('click',function () {
            var text = editors[idEditor].getValue();
            var TabToDownload = $('#' + idEditor).parent().attr('id');
            var nameTab = $(".btn-tab[data-target='#" + TabToDownload +"']");
            var string = nameTab.text().replace(/\s/g,'');
            createFileToDownload(text,"local","LogicProgram_" + string,"txt");
        });
        $('#share-btn-save-on-cloud').on('click',function(){
            console.log("Download this on cloud");
        });
    });

    $('.popover-share').on('hidden.bs.popover', function(){
        $('#btn-copy-link').off('click');
        $('#share-btn-download').off('click');
        $('#share-btn-save-on-cloud').off('click');
    });
}

function inizializeToolbar() {
    $('#btn-undo').on('click',function () {
        var undoManager = editors[idEditor].session.getUndoManager();
        if(undoManager.hasUndo()){
            undoManager.undo();
        }
    });

    $('#btn-redo').on('click',function () {
        var undoManager = editors[idEditor].session.getUndoManager();
        if(undoManager.hasRedo()){
            undoManager.redo();
        }

    });

    $('#btn-run-thistab').on('click',function () {
        $("#output").empty();
        $("#output").text("Sending..");
        callSocketServer(true);
    });
}

function inizializeSnippets() {
    var languageChosen = $('#inputLanguage').val();
    var solverChosen = $('#inputengine').val();

    var langTools = ace.require('ace/ext/language_tools');

    langTools.setCompleters([]); //reset completers.

    // completer that include snippets and some keywords
    var completer;

    switch (languageChosen) {
        case "asp":
            switch (solverChosen) {
                case "dlv":
                    completer = { //
                        getCompletions: function(editor, session, pos, prefix, callback) {
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
                    completer = { //
                        getCompletions: function(editor, session, pos, prefix, callback) {
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
        case "asp":
            var splitRegex = /(([a-zA-Z_]+[0-9]*)*)(\(.+?\))/gi;
            var words = editors[idEditor].getValue().match(splitRegex);
            if(words != null){
                var map = new Map();
                words.forEach(function (word) {
                    var name = word.match(/[^_](([a-zA-Z_]+[0-9]*)*)/)[0];
                    var arities = word.match(/\(.+?\)/)[0].split(",").length;
                    map.set(name,arities);
                });
                var completions = [];
                map.forEach(function (key, value) {
                    completions.push({
                        caption: value,
                        snippet: value+giveBrackets(key),
                        meta: "atom"
                    });
                });

                var completer = {
                    getCompletions: function(editor, session, pos, prefix, callback) {
                        callback(null, completions);
                    }
                }

                langTools.addCompleter(completer);
            }
            break;

        default:
            break;
    }
}

function giveBrackets(value) {
    var par="(";
    var LETTER = "A";
    var limit = 0;
    if(value <= 26)
        limit=value;
    else
        limit = 26;
    for(var i=0; i<limit; i++){
        var num = i+1;
        par += "${" + num +":"+ LETTER + "}" ;
        if(i!==limit-1){
            par+=","
        }
        LETTER = String.fromCharCode(LETTER.charCodeAt(0) + 1);
    }
    par+=")";
    return par;
}

function createURLtoShare(program) {
    if(program.trim().length == 0){
        $('#link-to-share').val(window.location.href);
    }
    else {
        var URL = window.location.host + "/?program=";
        var encodedProg;
        try {
            encodedProg = btoa(program);
            URL += encodeURIComponent(encodedProg);
            $.ajax({
                method: "POST",
                url: "https://is.gd/create.php?format=json&url=" + URL,
                dataType: 'json',
                crossDomain: true,
                success: function (data) {
                    console.log(data);
                    if (data.shorturl == undefined) {
                        $('#link-to-share').val("Ops. Something went wrong");
                        if (URL.length >= 5000) {
                            operation_alert({reason: "The logic program is too long to be shared."})
                        }
                    } else {
                        $('#link-to-share').val(data.shorturl);
                        $('#btn-copy-link').prop('disabled', false);
                    }
                },
                error: function (err) {
                    console.log(err);
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
    var param = getParameterByName('program', thisURL);
    if(param !=null){
        var program = atob(param);
        editors[idEditor].setValue(program);
    }
}

function setTooltip(btn, message) {
    $(btn).tooltip('hide')
        .attr('data-original-title', message)
        .tooltip('show');
}

function hideTooltip(btn) {
    setTimeout(function() {
        $(btn).tooltip('hide');
    }, 1000);
}

function setClipboard() {
    $('#btn-copy-link').tooltip({
        trigger: 'click',
        placement: 'bottom'
    });

    var clipboard = new ClipboardJS('#btn-copy-link');

    clipboard.on('success', function(e) {
        setTooltip(e.trigger, 'Copied!');
        hideTooltip(e.trigger);
    });

    clipboard.on('error', function(e) {
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
    $('.toast').on('show.bs.toast',function () {
        $('.toast').removeClass('hidden');
    });
    $('.toast').on('hidden.bs.toast',function () {
        $('.toast').addClass('hidden');
    });

    $('#load-project').on('click',function () {
       loadProjectFromLocalStorage();
       $('#notification-project').toast('hide');
    });
}

function setWindowResizeTrigger() {
    $('#loide-collapse').on('hidden.bs.collapse',function () {
        $(window).trigger('resize');
    });
    $('#loide-collapse').on('shown.bs.collapse',function () {
        $(window).trigger('resize');
    });
}

function inizializeButtonLoideMode() {
    $('#dark-light-mode').click(function () {
        localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ? 'light' : 'dark');
        localStorage.getItem('mode') === 'dark' ? document.querySelector('body').classList.add('dark') : document.querySelector('body').classList.remove('dark');
        setElementsColorMode();
    });
}

function setLoideStyleMode(mode) {

    switch(mode){
        case 'light':
            localStorage.setItem('mode','light');
            document.querySelector('body').classList.remove('dark');
            break;

        case 'dark':
            localStorage.setItem('mode','dark');
            document.querySelector('body').classList.add('dark');
            break;

        default:
            if(localStorage.getItem('mode') == null)
                localStorage.setItem('mode','light');
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
    for (var index = 1; index <= length - 1; index++) {
        var idE = "editor" + index;
        editors[idE].setTheme(defaultTheme);
    }
    $('#output').css('color','black');
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

    for (var index = 1; index <= length - 1; index++) {
        var idE = "editor" + index;
        editors[idE].setTheme(defaultDarkTheme);
    }
    $('#output').css('color','white');
}

function saveProjectToLocalStorage() {
    var tabsName = [];
    var logicProgEditors = [];

    $('.name-tab').each(function () {
        tabsName.push($(this).text());
    });
    var length = $(".nav-tabs").children().length;
    for (var index = 1; index <= length - 1; index++) {
        var idE = "editor" + index;
        logicProgEditors.push(editors[idE].getValue());
    }

    saveOption("tabsName",JSON.stringify(tabsName));
    saveOption("logicProgEditors",JSON.stringify(logicProgEditors));
}

function checkProjectOnLocalStorage() {
    if(supportLocalStorage()) {
        var tabsName = [];
        var logicProgEditors = [];
        if(localStorage.getItem("tabsName") != undefined && localStorage.getItem("logicProgEditors") != undefined)
        {
            tabsName = JSON.parse(localStorage.getItem("tabsName"));
            logicProgEditors = JSON.parse(localStorage.getItem("logicProgEditors"));

            if(tabsName.length > 1 || logicProgEditors[0].trim().length > 0){
                $('#notification-project').toast('show');
            }
        }
    }
}

function loadProjectFromLocalStorage() {
    if(supportLocalStorage()){
        var tabsName = [];
        var logicProgEditors = [];
        tabsName = JSON.parse(localStorage.getItem("tabsName"));
        logicProgEditors = JSON.parse(localStorage.getItem("logicProgEditors"));

        for (var index = 1; index <= tabsName.length ; index++) {
            if(index > 1)
                $('.add-tab').trigger('click');
            var idE = "editor" + index;
            editors[idE].setValue(logicProgEditors[index-1]);
        }

        $('.name-tab').each(function (index) {
            $(this).text(tabsName[index]);
            var id = index + 1;
            var editor = "editor" + id;
            $(':checkbox[value="' + editor + '"]').siblings('span').text(tabsName[index]);
        });

        $("a[data-target='#tab1']").trigger('click');
        
        var opt = localStorage.getItem("solverOptions");
        if (opt !== null) {
            var obj = JSON.parse(opt);
            $('#inputLanguage').val(obj.language).change();
            $('#inputengine').val(obj.engine).change();
            $('#inputExecutor').val(obj.executor).change();
            if(obj.option != null) {
                setOptions(obj);
            }
            if (obj.hasOwnProperty('runAuto')) {
                $("#run-dot").prop('checked', true);
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
        var id = index + 1;
        var editor = "editor" + id;
        $(':checkbox[value="' + editor + '"]').siblings('span').text(tabsName[index]);
    });
}

function downloadLoDIEProject() {
    addProgramsToDownload();
    addTabsNameToDownload();
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
    createFileToDownload(stringify,"local","LoIDE_Project","json");
    $('#output-form').removeAttr('name');
    destroyPrograms();
    destroyTabsName();
    $("#tab-execute input").each(function (index, element) {
        $(this).removeAttr("name");
    });
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

function openRunOptions() {
    if($(window).width() > mobileMaxWidthScreen){
        $('#btn-option').trigger('click');
    }
}

function getHTMLFromJQueryElement( jQueryElement ) {
    var DOMElement  = '';

    for( var i = 0; i < jQueryElement.length; i ++ )
        DOMElement += jQueryElement.get( i ).outerHTML;

    return DOMElement;
}

function setAceMode() {
    switch ($('#inputLanguage').val()) {
        case 'asp':
            var length = $(".nav-tabs").children().length;
            for (var index = 1; index <= length - 1; index++) {
                var idE = "editor" + index;
                editors[idE].session.setMode("ace/mode/asp");
            }
            break;

        default:
            var length = $(".nav-tabs").children().length;
            for (var index = 1; index <= length - 1; index++) {
                var idE = "editor" + index;
                editors[idE].session.setMode("ace/mode/text");
            }
            break;
    }
}