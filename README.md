
# @straits/utils ![npm (scoped)](https://img.shields.io/npm/v/@straits/utils.svg?style=popout) ![NpmLicense](https://img.shields.io/npm/l/@straits/utils.svg?style=popout) ![David](https://img.shields.io/david/peoro/straits-utils.svg?style=popout)  ![Travis (.com)](https://img.shields.io/travis/com/peoro/straits-utils.svg?style=popout) ![Coveralls github](https://img.shields.io/coveralls/github/peoro/straits-utils.svg?style=popout)

> Utilities to declare and use traits and trait sets.

## Installation

```bash
npm install --save @straits/utils
```

## Quickstart

```javascript
const {TraitSet} = require('@straits/utils');

const traits = TraitSet.fromKeys({
	a: {},
	b: {}
});

const sym = traits.a;

{
	// implementing `sym` for all objects
	use traits * from TraitSet;
	sym.*impl( Object.prototype, 42 );
}

{
	// using `sym`
	use traits * from traits;
	console.log( ({}).*a ); // 42
}
```

## API

### `TraitSet.fromKeys( obj ) => TraitSet`

Create and return a new `TraitSet`, with a new symbol for each property of `obj`.

### `TraitSet.fromStrings( names ) => TraitSet`

Create and return a new `TraitSet`, witha symbol for each string in `names`.

### `new TraitSet( traitSet={} ) => TraitSet`

Create a new `TraitSet`, borrowing symbols from `TraitSet`.

### `traitSet.asFreeFunctions() => { str:fn(), ... }`

Return an object with a free function wrapping each symbol in `traitSet`.

### `symbol.*impl( target, value ) => symbol`

Set `target[symbol]` to `value`.
Such property symbol is not enumerable nor writable.

```javascript
const obj = {};
Symbol.iterator.*impl( obj, ()=>{/*...*/} );
```

### `symbol.*implDefault( value ) => symbol`

Set `value` as the default value for `symbol`.
Free functions wrapping traits will call `value(obj, ...args)` if they're called on an `obj`  that doesn't have a `symbol` property.

### `symbol.*asFreeFunction() => fn()`

Return a free function wrapping `symbol`.

```javascript
const fn = Symbol.iterator.*asFreeFunction();

const arr = [];
// the following two statements will be equivalent
fn( arr, 1, 2, 3 );
arr[ Symbol.iterator ]( 1, 2, 3 );
```

### `obj.*addSymbol( name, sym ) => sym`

Add `sym` to `this` with key `name`: `obj[name] = symbol`.
Throw if `sym` is not a `symbol` or if `obj` already has a property `name`.

### `obj.*defineTrait( name ) => symbol`

Add a new `symbol` called `name` to `obj`: `obj[name] = Symbol()`.
Throw it `obj` already has a property called `name`.

### `obj.*borrowTraits( traitSet, names=undefined ) => obj`

Add to `obj` all the `symbols` from `traitSet` whose property is listed in `names`.
If `names` is not set, all the symbols from `traitSet` are imported into `obj`.

### `obj.*traitsToFreeFunctions() => obj`

Return an object with a free function wrapping each symbol in `traitSet`.

### `obj.*implTraits( target, implementationObj ) => obj`

`implementationObj` should be an object whose keys are names of symbols in `obj`.
For each `key, value` entry of `implementationObj`, set `target[ this[key] ]` to `value`.

### `obj.*defineAndImplTraits( target, implementationObj ) => obj`

Like `obj.*implTraits( target, implementationObj )`, but it defines the symbols (`obj.*defineTrait`) before using them.

### `obj.*defineAndImplMethodsAsTraits( target, source, methodList ) => obj`

`methodList` should be a list of properties in `source` whose value is a method.
Create a new symbol `sym` in `obj` for each key `m` of  `methodList`, and set `target[sym]` to a function wrapping `source.m()`.

### `obj.*defineAndImplMemberFreeFunctionsAsTraits( target, functionObj ) => obj`

`functionObj` should be an object whose values are free functions.
For each `key, fn` entry in `methodList`, create a new symbol `sym` in `obj`, and set `target[sym]` to a function wrapping `fn()`.
