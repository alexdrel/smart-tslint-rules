// tslint:disable:quotemark-smart

import { isBinaryExpression, isTypeFlagSet, isUnionType, isStringLiteral } from "tsutils";
import * as ts from "typescript";
import * as Lint from "tslint";

interface RuleOptions {
  allowedLength: number;
}

export class Rule extends Lint.Rules.AbstractRule {
  /* tslint:disable:object-literal-sort-keys */
  public static metadata: Lint.IRuleMetadata = {
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
    optionExamples: [true, { "allow-length": 5 } as any],
    type: "style",
    typescriptOnly: false,
  };
  /* tslint:enable:object-literal-sort-keys */

  public static INVALID_TYPES_ERROR = "'+' operation must not be used for literals, use template literals";

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, this.getRuleOptions());
  }
  private getRuleOptions(): RuleOptions {
    const argument = this.ruleArguments[0];
    let allowedLength = 0;
    if (typeof argument === "number") {
      allowedLength = argument;
    } else if (argument && typeof argument.allowedLength === "number") {
      allowedLength = argument.allowedLength;
    }
    return { allowedLength };
  }
}

function walk(ctx: Lint.WalkContext<RuleOptions>) {
  const allowedLength = ctx.options.allowedLength;
  return ts.forEachChild(ctx.sourceFile, function cb(node: ts.Node): void {
    if (isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const leftLiteral = isStringLiteral(node.left) && (node.left.text.length > allowedLength);
      const rightLiteral = isStringLiteral(node.right) && (node.right.text.length > allowedLength);
      if (leftLiteral || rightLiteral) {
        return ctx.addFailureAtNode(node, Rule.INVALID_TYPES_ERROR);
      }
    }
    return ts.forEachChild(node, cb);
  });
}
