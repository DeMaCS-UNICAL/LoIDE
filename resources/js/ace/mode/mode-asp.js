define('ace/mode/asp', [], function (require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var Tokenizer = require("ace/tokenizer").Tokenizer;
    var aspHighlightRules = require("ace/mode/asp_highlight_rules").aspHighlightRules;

    var Mode = function () {
        this.HighlightRules = aspHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function () {
        this.lineCommentStart = "%";
    }).call(Mode.prototype);

    exports.Mode = Mode;
});

define('ace/mode/asp_highlight_rules', [], function (require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var aspHighlightRules = function () {
        var support = ("not");
        var aggr = ("#count|#sum|#max|#min|#int|#maxint");
        var keywordMapper = this.createKeywordMapper({
            "constant.language": support,
        }, "identifier", true);
        var keywordAggr = this.createKeywordMapper({
            "keyword": aggr,
        }, "identifier", true);

        this.$rules = {
            "start": [{
                    token: "keyword",
                    regex: "[\\(]+",
                    next: "blocktag"

                }, {
                    token: keywordMapper,
                    regex: "[a-z]+",

                }, {
                    token: "keyword.operator",
                    regex: "\\-|\\+|\\*|\\/|\\<|\\<=|\\>|\\>=|\\=|\\!="
                }, {
                    token: "constant.numeric",
                    regex: "[0-9]+"
                },

                {
                    token: keywordAggr,
                    regex: "\\#[a-z]+",
                    next: "blocktag"

                }, {
                    token: "keyword",
                    regex: ":-|:~"

                },
                {
                    token: "text",
                    regex: "\s+"
                }, {
                    token: "comment",
                    regex: "\%.+"
                }
            ],
            "blocktag": [{
                token: "string",
                regex: "[A-Za-z0-9_\"][a-zA-Z0-9_\"]*",
                next: "blocknext"
            }, {
                token: "keyword",
                regex: "\\("
            }],

            "blocktagproperties": [{
                    token: "string",
                    regex: "[A-Za-z0-9_][a-zA-Z0-9_]*",
                    next: "blocknext"
                }, {
                    token: "keyword",
                    regex: "[\\)]*",
                    next: "start"
                }

            ],
            "blocknext": [{
                token: "text",
                regex: "\\s*[,|.]*\\s*",
                next: "blocktagproperties"
            }]
        };
        this.normalizeRules();
    };

    oop.inherits(aspHighlightRules, TextHighlightRules);

    exports.aspHighlightRules = aspHighlightRules;
});
