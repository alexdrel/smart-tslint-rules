"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tsutils_1 = require("tsutils");
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.FAILURE_STRING = function (actual, expected, rule) {
        return actual + " should be " + expected + " - '" + rule + "' preference";
    };
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk, this.getRuleOptions());
    };
    Rule.prototype.getRuleOptions = function () {
        var single = "'";
        var double = '"';
        var singeOrDouble = single + double;
        var options = Object.assign({}, {
            default: single,
            jsx: singeOrDouble,
            empty: singeOrDouble,
            singleChar: single,
            startsWithDot: double,
            startsWithDigit: double,
            multiWord: double,
            longLiteral: double,
            longLimit: 30,
            shortLiteral: single,
            shortLimit: 10,
            avoidEscape: true,
            avoidTemplate: true,
        }, this.ruleArguments[0]);
        return options;
    };
    Rule.metadata = {
        ruleName: "quotemark-smart",
        description: "Requires single or double quotes for string literals based on literal content.",
        hasFix: true,
        optionsDescription: Lint.Utils.dedent(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            Configuration object may be optionally provided (defaults listed):\n            {\n              default: '\"'\"',\n              jsx: \"'\"\",  // allow both single or double but not `tagged`\n              empty: \"'\"\",\n              singleChar: \"'\",\n              startsWithDot: '\"',\n              startsWithDigit: '\"',\n              multiWord: '\"',\n              longLiteral: '\"',\n              longLimit: 30,\n              shortLiteral: \"'\",\n              shortLimit: 10,\n              avoidEscape: true,\n              avoidTemplate: true,\n            }\n            For example, `[true, \"singleChar\": \"\"'\" ]` would not report a failure on the string literals\n            \"a\" or 'a'."], ["\n            Configuration object may be optionally provided (defaults listed):\n            {\n              default: '\"'\"',\n              jsx: \"'\\\"\",  // allow both single or double but not \\`tagged\\`\n              empty: \"'\\\"\",\n              singleChar: \"'\",\n              startsWithDot: '\"',\n              startsWithDigit: '\"',\n              multiWord: '\"',\n              longLiteral: '\"',\n              longLimit: 30,\n              shortLiteral: \"'\",\n              shortLimit: 10,\n              avoidEscape: true,\n              avoidTemplate: true,\n            }\n            For example, \\`[true, \"singleChar\": \"\\\"'\" ]\\` would not report a failure on the string literals\n            \"a\" or 'a'."]))),
        options: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    "longLimit": { type: "number" },
                    "shortLimit": { type: "number" },
                },
                additionalProperties: true,
            },
            minLength: 1,
            maxLength: 1,
        },
        optionExamples: [
            [true, { "empty": "'", "longLiteral": "\"", "longLimit": 20 }],
        ],
        type: "style",
        typescriptOnly: false,
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function walk(ctx) {
    var sourceFile = ctx.sourceFile, options = ctx.options;
    ts.forEachChild(sourceFile, function cb(node) {
        if (tsutils_1.isStringLiteral(node)
            || options.avoidTemplate && tsutils_1.isNoSubstitutionTemplateLiteral(node)
                && node.parent.kind !== ts.SyntaxKind.TaggedTemplateExpression
                && tsutils_1.isSameLine(sourceFile, node.getStart(sourceFile), node.end)) {
            var start = node.getStart(sourceFile);
            var text = sourceFile.text.substring(start + 1, node.end - 1);
            var _a = ["", ""], expectedQuoteMark_1 = _a[0], reason_1 = _a[1];
            var rule = function (r) {
                var _a;
                _a = [options[r], r], expectedQuoteMark_1 = _a[0], reason_1 = _a[1];
            };
            if (node.parent.kind === ts.SyntaxKind.JsxAttribute) {
                rule('jsx');
            }
            else if (!text.length) {
                rule('empty');
            }
            else if (text.length == 1 || (text.length == 2 && text[0] == '\\')) {
                rule('singleChar');
            }
            else if (text.match(/\s|[^\w-\.]|\/|'/g)) {
                rule('multiWord');
            }
            else if (text.match(/^\d.*\D/g)) {
                rule('startsWithDigit');
            }
            else if (text.startsWith(".")) {
                rule('startsWithDot');
            }
            else if (text.length < options.shortLimit) {
                rule('shortLiteral');
            }
            else if (text.length > options.longLimit) {
                rule('longLiteral');
            }
            else {
                rule('default');
            }
            var actualQuoteMark = sourceFile.text[node.end - 1];
            if (!expectedQuoteMark_1 || expectedQuoteMark_1.includes(actualQuoteMark)) {
                return;
            }
            var fixQuoteMark = expectedQuoteMark_1[0];
            var needsQuoteEscapes = node.text.includes(fixQuoteMark);
            if (needsQuoteEscapes && options.avoidEscape) {
                if (node.kind === ts.SyntaxKind.StringLiteral) {
                    return;
                }
                fixQuoteMark = fixQuoteMark === '"' ? "'" : '"';
                if (node.text.includes(fixQuoteMark)) {
                    return;
                }
            }
            if (needsQuoteEscapes) {
                text = text.replace(new RegExp(fixQuoteMark, "g"), "\\" + fixQuoteMark);
            }
            text = text.replace(new RegExp("\\\\" + actualQuoteMark, "g"), actualQuoteMark);
            return ctx.addFailure(start, node.end, Rule.FAILURE_STRING(actualQuoteMark, fixQuoteMark, reason_1), new Lint.Replacement(start, node.end - start, fixQuoteMark + text + fixQuoteMark));
        }
        ts.forEachChild(node, cb);
    });
}
var templateObject_1;
