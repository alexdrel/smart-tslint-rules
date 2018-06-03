// tslint:disable:quotemark-smart

import { isNoSubstitutionTemplateLiteral, isSameLine, isStringLiteral } from "tsutils";
import * as ts from "typescript";
import * as Lint from "tslint";

type quote = string; // single character or combination of  "'" | '"' | '`';
interface RuleOptions {
  default: quote;
  jsx: quote;
  empty: quote;
  singleChar: quote;
  startsWithDot: quote;
  startsWithDigit: quote;
  multiWord: quote;
  shortLiteral: quote;
  shortLimit: number;
  longLiteral: quote;
  longLimit: number;
  avoidEscape: boolean;
  avoidTemplate: boolean;
}

export class Rule extends Lint.Rules.AbstractRule {
  /* tslint:disable:object-literal-sort-keys */
  public static metadata: Lint.IRuleMetadata = {
    ruleName: "quotemark-smart",
    description: "Requires single or double quotes for string literals based on literal content.",
    hasFix: true,
    optionsDescription: Lint.Utils.dedent`
            Configuration object may be optionally provided (defaults listed):
            {
              default: '"'"',
              jsx: "'\"",  // allow both single or double but not \`tagged\`
              empty: "'\"",
              singleChar: "'",
              startsWithDot: '"',
              startsWithDigit: '"',
              multiWord: '"',
              longLiteral: '"',
              longLimit: 30,
              shortLiteral: "'",
              shortLimit: 10,
              avoidEscape: true,
              avoidTemplate: true,
            }
            For example, \`[true, "singleChar": "\"'" ]\` would not report a failure on the string literals
            "a" or 'a'.`,
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
  /* tslint:enable:object-literal-sort-keys */

  public static FAILURE_STRING(actual: string, expected: string, rule: string) {
    return `${actual} should be ${expected} - '${rule}' preference`;
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, this.getRuleOptions());
  }
  private getRuleOptions(): RuleOptions {
    const single = "'";
    const double = '"';
    const singeOrDouble = single + double;
    const options = Object.assign({}, {
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
  }
}

function walk(ctx: Lint.WalkContext<RuleOptions>) {
  const { sourceFile, options } = ctx;
  ts.forEachChild(sourceFile, function cb(node) {
    if (isStringLiteral(node)
      || options.avoidTemplate && isNoSubstitutionTemplateLiteral(node)
      && node.parent!.kind !== ts.SyntaxKind.TaggedTemplateExpression
      && isSameLine(sourceFile, node.getStart(sourceFile), node.end)) {
      const start = node.getStart(sourceFile);
      let text = sourceFile.text.substring(start + 1, node.end - 1);

      let [expectedQuoteMark, reason] = ["", ""];
      const rule = (r: keyof RuleOptions) => {
        [expectedQuoteMark, reason] = [options[r] as string, r];
      };
      if (node.parent!.kind === ts.SyntaxKind.JsxAttribute) {
        rule('jsx');
      } else if (!text.length) {
        rule('empty');
      } else if (text.length == 1 || (text.length == 2 && text[0] == '\\')) {
        rule('singleChar');
      } else if (text.match(/\s|[^\w-\.]|\/|'/g)) {
        rule('multiWord');
      } else if (text.match(/^\d.*\D/g)) {
        rule('startsWithDigit');
      } else if (text.startsWith(".")) {
        rule('startsWithDot');
      } else if (text.length < options.shortLimit) {
        rule('shortLiteral');
      } else if (text.length > options.longLimit) {
        rule('longLiteral');
      } else {
        rule('default');
      }

      const actualQuoteMark = sourceFile.text[node.end - 1];
      if (!expectedQuoteMark || expectedQuoteMark.includes(actualQuoteMark)) {
        return;
      }

      let fixQuoteMark = expectedQuoteMark[0];

      const needsQuoteEscapes = node.text.includes(fixQuoteMark);
      if (needsQuoteEscapes && options.avoidEscape) {
        if (node.kind === ts.SyntaxKind.StringLiteral) {
          return;
        }

        // If expecting double quotes, fix a template `a "quote"` to `a 'quote'` anyway,
        // always preferring *some* quote mark over a template.
        fixQuoteMark = fixQuoteMark === '"' ? "'" : '"';
        if (node.text.includes(fixQuoteMark)) {
          return;
        }
      }

      if (needsQuoteEscapes) {
        text = text.replace(new RegExp(fixQuoteMark, "g"), `\\${fixQuoteMark}`);
      }
      text = text.replace(new RegExp(`\\\\${actualQuoteMark}`, "g"), actualQuoteMark);
      return ctx.addFailure(
        start, node.end, Rule.FAILURE_STRING(actualQuoteMark, fixQuoteMark, reason),
        new Lint.Replacement(start, node.end - start, fixQuoteMark + text + fixQuoteMark));
    }
    ts.forEachChild(node, cb);
  });
}
