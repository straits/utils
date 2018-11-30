
const LIBPATH = '../src/index.js';

const assert = require('assert');
const {TraitSet} = require(LIBPATH);

use traits * from TraitSet;

function checkABTraitSet( traitSet ) {
	assert.deepStrictEqual( Object.keys(traitSet), ['a', 'b'] );
	assert.strictEqual( typeof traitSet.a, 'symbol' );
	assert.strictEqual( typeof traitSet.b, 'symbol' );
}

describe(`@straits/utils`, function(){
	it(`data is shared among different versions`, function(){
		const data = Symbol['@straits'];

		const ns = TraitSet.namespace;
		const mod = require.cache[ require.resolve(LIBPATH) ];
		delete require.cache[ require.resolve(LIBPATH) ];
		const newTraitSet = require(LIBPATH).TraitSet;
		require.cache[ require.resolve(LIBPATH) ] = mod;

		assert.notStrictEqual( TraitSet.impl, newTraitSet.impl, `Failed to reload` );
		assert.strictEqual( ns, newTraitSet.namespace );
	});

	describe(`Symbol`, function(){
		it(`symbol.*impl()`, function(){
			const obj = {}, sym = Symbol();
			sym.*impl( obj, 42 );
			assert.strictEqual( obj[sym], 42 );
		});
		it(`symbol.*asFreeFunction()`, function(){
			const obj = {x: 1}, sym = Symbol(`symX`);
			sym.*impl( obj, function(arg){
				return [arg, this, 7];
			});
			const symFn = sym.*asFreeFunction();
			const result = symFn( obj, `hey` );
			assert.deepStrictEqual( result, [`hey`, obj, 7] );

			assert.throws( ()=>symFn(undefined, `hey`), /^Error: \.\*symX called on undefined$/ );
			assert.throws( ()=>symFn(null, `hey`), /^Error: \.\*symX called on null/ );
			assert.throws( ()=>symFn({}, `hey`), /^Error: \.\*symX called on \[object Object\] that doesn't implement it.$/ );
		});
		it(`symbol.*implDefault()`, function(){
			const sym = Symbol();
			sym.*implDefault( (self, arg)=>[arg, self, 7] );
			const fn = sym.*asFreeFunction();
			const result = fn( Array, `hey` );
			assert.deepStrictEqual( result, [`hey`, Array, 7] );
		});
	});

	describe(`TraitSet`, function(){
		it(`TraitSet.fromKeys()`, function(){
			const traitSet = TraitSet.fromKeys({ a:{}, b:`hey` });
			checkABTraitSet( traitSet );
		});
		it(`TraitSet.fromStrings()`, function(){
			const traitSet = TraitSet.fromStrings(['a', 'b']);
			checkABTraitSet( traitSet );
		});
		it(`TraitSet constructor`, function(){
			const traitSet1 = TraitSet.fromStrings(['a', 'b']);
			const traitSet = new TraitSet( traitSet1 );
			checkABTraitSet( traitSet );
		});
		it(`traitSet.asFreeFunctions()`, function(){
			const traitSet = TraitSet.fromStrings(['a', 'b']);
			checkABTraitSet( traitSet );

			const fns = traitSet.asFreeFunctions()

			traitSet.a.*implDefault( ()=>`a()` );
			traitSet.b.*implDefault( ()=>`b()` );

			assert.strictEqual( fns.a(), `a()` );
			assert.strictEqual( fns.b(), `b()` );
		});
	});

	describe(`TraitSet traits`, function(){
		it(`traitSet.*addSymbol()`, function(){
			const traitSet = TraitSet.fromStrings(['a']);
			const sym = Symbol();
			traitSet.*addSymbol( 'b', sym );
			checkABTraitSet( traitSet );
			assert.strictEqual( traitSet.b, sym );
			assert.throws( ()=>traitSet.*addSymbol('b', sym), /Trying to re-define trait \`b\`/ );
			assert.throws( ()=>traitSet.*addSymbol('c', {}), /Trying to add \`c\`, but it's not a symbol/ );
		});
		it(`traitSet.*defineTrait()`, function(){
			const traitSet = TraitSet.fromStrings(['a']);
			const sym = Symbol();
			traitSet.*defineTrait( 'b' );
			checkABTraitSet( traitSet );
		});
		it(`traitSet.*borrowTraits()`, function(){
			const traitSet = TraitSet.fromStrings(['a', 'b']);
			{
				const obj = {};
				obj.*borrowTraits( traitSet );
				checkABTraitSet( obj );
				assert.strictEqual( obj.a, traitSet.a );
				assert.strictEqual( obj.b, traitSet.b );
			}
			{
				const obj = {};
				obj.*borrowTraits( traitSet, ['a'] );
				assert.deepStrictEqual( Object.keys(obj), ['a'] );
				assert.strictEqual( typeof traitSet.a, 'symbol' );
				assert.strictEqual( obj.a, traitSet.a );
			}
			{
				const obj = {};
				obj.*borrowTraits( traitSet, ['a', 'b'] );
				checkABTraitSet( obj );
				assert.strictEqual( obj.a, traitSet.a );
				assert.strictEqual( obj.b, traitSet.b );
			}
		});

		it(`traitSet.*traitsToFreeFunctions()`, function(){
			const traitSet = TraitSet.fromStrings(['a', 'b']);
			checkABTraitSet( traitSet );

			const fns = traitSet.*traitsToFreeFunctions()

			traitSet.a.*implDefault( ()=>`a()` );
			traitSet.b.*implDefault( ()=>`b()` );

			assert.strictEqual( fns.a(), `a()` );
			assert.strictEqual( fns.b(), `b()` );
		});

		it(`traitSet.*implTraits()`, function(){
			const traitSet = TraitSet.fromStrings(['a', 'b']);
			const obj = {};
			traitSet.*implTraits( obj, {
				b: `hey`,
			});
			assert( ! (traitSet.a in obj) );
			assert.strictEqual( obj[traitSet.b], `hey` );
			assert.throws( ()=>traitSet.*implTraits(obj, {c:`hey`}), /No trait `c`/ )
		});
		it(`traitSet.*defineAndImplTraits()`, function(){
			const traitSet = {};
			const obj = {};
			traitSet.*defineAndImplTraits( obj, {
				a: `hey`,
				b: 15
			});
			checkABTraitSet( traitSet );
			assert.strictEqual( obj[traitSet.a], `hey` );
			assert.strictEqual( obj[traitSet.b], 15 );
		});
		it(`traitSet.*defineAndImplMethodsAsTraits()`, function(){
			const traitSet = {};
			const obj1 = { a(self, arg){ return [arg, self, this, 7]; }, b(self){ return 5; } };
			const obj2 = {};
			traitSet.*defineAndImplMethodsAsTraits( obj2, obj1, ['a', 'b'] );
			checkABTraitSet( traitSet );
			assert.deepStrictEqual( obj2[traitSet.a](`hey`), [`hey`, obj2, obj1, 7] );
			assert.strictEqual( obj2[traitSet.b](), 5 );
			assert.throws( ()=>traitSet.*defineAndImplMethodsAsTraits( {}, obj1, ['a'] ), /Trying to re-define trait/ )
		});
		it(`traitSet.*defineAndImplMemberFreeFunctionsAsTraits()`, function(){
			const traitSet = {};
			const obj1 = { a(self, arg){ return [arg, self, this, 7]; }, b(self,){ return 5; }, c:{} };
			const obj2 = {};
			traitSet.*defineAndImplMemberFreeFunctionsAsTraits( obj2, obj1 );
			checkABTraitSet( traitSet );
			assert.deepStrictEqual( obj2[traitSet.a](`hey`), [`hey`, obj2, undefined, 7] );
			assert.strictEqual( obj2[traitSet.b](), 5 );
			assert.throws( ()=>traitSet.*defineAndImplMemberFreeFunctionsAsTraits( {}, obj1 ), /Trying to re-define trait/ )
		});
	});
});
