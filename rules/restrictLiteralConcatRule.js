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
Object.defineProperty(exports, "__esModule", { value: true });
var tsutils_1 = require("tsutils");
var ts = require("typescript");
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithFunction(sourceFile, walk, this.getRuleOptions());
    };
    Rule.prototype.getRuleOptions = function () {
        var argument = this.ruleArguments[0];
        var allowedLength = 0;
        if (typeof argument === "number") {
            allowedLength = argument;
        }
        else if (argument && typeof argument.allowedLength === "number") {
            allowedLength = argument.allowedLength;
        }
        return { allowedLength: allowedLength };
    };
    Rule.metadata = {
        ruleName: "restrict-literal-concat",
        description: "Prefer template literals to string concatenation.",
        optionsDescription: 'Short literal can be allowed with setting [true, { "allow-length": 5 }]',
        options: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    "allow-length": { type: "number" },
                },
                additionalProperties: false,
            },
            minLength: 1,
            maxLength: 1,
        },
        optionExamples: [true, { "allow-length": 5 }],
        type: "style",
        typescriptOnly: false,
    };
    Rule.INVALID_TYPES_ERROR = "'+' operation must not be used for literals, use template literals";
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
function walk(ctx) {
    var allowedLength = ctx.options.allowedLength;
    return ts.forEachChild(ctx.sourceFile, function cb(node) {
        if (tsutils_1.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
            var leftLiteral = tsutils_1.isStringLiteral(node.left) && (node.left.text.length > allowedLength);
            var rightLiteral = tsutils_1.isStringLiteral(node.right) && (node.right.text.length > allowedLength);
            if (leftLiteral || rightLiteral) {
                return ctx.addFailureAtNode(node, Rule.INVALID_TYPES_ERROR);
            }
        }
        return ts.forEachChild(node, cb);
    });
}
