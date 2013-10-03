"use strict";
( function( gc ) {
var isArguments = function( o ) {
	return !!o && ( o.toString === '[object Arguments]' || typeof o === 'object' && o !== null && 'length' in o && 'callee' in o );
};
gc.Class = function( prototype ) {
	var constructor = realConstructor = prototype.constructor !== Object ? prototype.constructor : function EmptyConstructor() {},
		extend = prototype[ 'extends' ] = prototype[ 'extends' ] || prototype.extend,
		extend_prototype = extend && extend.prototype,
		implement = prototype[ 'implements' ] = prototype[ 'implements' ] || prototype.implement,
		realConstructor = constructor,
		parent = {};
	
	delete prototype.extend;
	delete prototype.implement;
	
	if( extend_prototype ) {
		for( var key in extend_prototype ) {
			parent[ key ] = typeof extend_prototype[ key ] === 'function' ? ( function( value ) {
				return function( context, args ) {
					args = isArguments( args ) ? args : Array.prototype.splice.call( arguments, 1 );
					return value.apply( context, args );
				}
			})( extend_prototype[ key ] ) : extend_prototype[ key ];
		}
		
		parent.constructor = ( function( value ) {
			return function( context, args ) {
				args = isArguments( args ) ? args : Array.prototype.splice.call( arguments, 1 );
				return value.apply( context, args );
			}
		})( extend_prototype.constructor );
	}
	
	if( Object.defineProperty && !Object.create ) { // if ie8
		prototype.prototype = null;
		prototype.constructor = null;
		constructor = function() {
			if( this instanceof constructor ) {
				var r = new XDomainRequest;
				for( var p in constructor.prototype ) if( p !== 'constructor' ) {
					r[ p ] = constructor.prototype[ p ];
				}
				r.hasOwnProperty = constructor.prototype.hasOwnProperty;
				realConstructor.apply( r, arguments );

				return r;
			} else {
				realConstructor.apply( this, arguments );
			}			
		};
		
		prototype.constructor = constructor;
		constructor.prototype = prototype;
		constructor.parent = parent;
		extend && Class.IEInherits( constructor, extend );
	} else {
		prototype.constructor = constructor;
		constructor.prototype = prototype;
		constructor.parent = parent;

		extend && Class.inherits( constructor, extend );
	}
	
	implement && implement.validate( constructor.prototype );
	
	if( this instanceof Class ) {
		return new constructor;
	} else {
		return constructor;
	}
};

Class.inherits = function( Child, Parent ) {
	var prototype = Child.prototype,
		F = function() {};
	F.prototype = Parent.prototype;
    Child.prototype = new F;
    Child.prototype.constructor = Child;
	for( var m in prototype ) {
		Child.prototype[ m ] = prototype[ m ];
	};
	
	Child.prototype.instanceOf = function( _Class ) {
		return this instanceof _Class;
	}
};

Class.IEInherits = function( Child, Parent ) {
	var childHasOwn = Child.prototype.hasOwnProperty,
		childConstructor = Child.prototype.constructor,
		parentHasOwn,
		objectHasOwn = Object.prototype.hasOwnProperty;
	while ( Parent ) {
		parentHasOwn = parentHasOwn || Parent.prototype.hasOwnProperty,
		Child.prototype = ( function( pp, cp ) { // extending
			var o = {},
				i;
			for( i in pp )  {
				o[ i ] = pp[ i ]
			}
			for( i in cp ) {
				o[ i ] = cp[ i ]
			}
			return o;
		})( Parent.prototype, Child.prototype );
		Parent = Parent.prototype && Parent.prototype[ 'extends' ] && Parent.prototype[ 'extends' ].prototype;
	}

	if( childHasOwn !== objectHasOwn ) {
		Child.prototype.hasOwnProperty = childHasOwn;
	} else if( parentHasOwn !== objectHasOwn ) {
		Child.prototype.hasOwnProperty = parentHasOwn;
	}
	
	Child.prototype.constructor = childConstructor;
	
	Child.prototype.instanceOf = function( _Class ) {
		var PossibleParent = Child;
		while( PossibleParent ) {
			if( PossibleParent === _Class ) {
				return true;
			}
			PossibleParent = PossibleParent.prototype[ 'extends' ]
		}
		return false;
	}
};
})( this );