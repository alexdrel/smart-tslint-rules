smart-tslint-rules
===
Human-friendly tslint rules

### What is it?

`smart-tslint-rules` is set of TSLint rules to:

* control string literal quotes to use ' ` or " with ability to fine-tune or disable for special cases;
* disable or limit usage of "+" for string literar concatenation - prefer template string ;


## Install

Install the package using NPM:

    npm install smart-tslint-rules --save-dev

### Usage

smart-tslint-rules has peer dependencies on TSLint and TypeScript.

To use these lint rules with the default preset, use configuration inheritance via the `extends` keyword.
Here's a sample configuration where `tslint.json` lives adjacent to your `node_modules` folder:

```js
{
  "extends": ["tslint:latest", "smart-tslint-rules"],
  "rules": {
    "quotemark-smart": true,
    "restrict-literal-concat": true
  }
}
```

To lint your `.ts` **and** `.tsx` files you can simply run `tslint -c tslint.json 'src/**/*.{ts,tsx}'`.

## Rules
### quotemark-smart (with Fix)

Requires single or double quotes for string literals based on literal content.

Configuration object may be optionally provided (defaults listed):
```js
{
  default: "'",
  // allow both single or double but not \`tagged\`
  jsx: "'\"",
  empty: "'\"",
  singleChar: "'",
  startsWithDot: "\"",
  startsWithDigit: "\"",
  multiWord: "\"",
  longLiteral: "\"",
  longLimit: 30,
  shortLiteral: "'",
  shortLimit: 10,
  avoidEscape: true,
  avoidTemplate: true,
}
```
For example, \`[true, "singleChar": "\"'" ]\` would not report a failure on the string literals
"a" or 'a'.`,

Individual rules can be enabled and configured to express preference and smooth the transitions. E.g. start with allowing both kinds of quotes for all but long words and then gradually restrict the ruleset.

### restrict-literal-concat
Prefer template literals to string concatenation.

Short literal can be allowed with setting  ```[true, { "allow-length": 5 }]```

Setting ``allow-length`` to relatively high limit enables baby steps for removing '+' concatenation in a codebase.


## Help needed
* Documentation
* Ideas for improvements
* New 'smart' rules - especially ones that can be realistically applied in existing codebases
* Tests
