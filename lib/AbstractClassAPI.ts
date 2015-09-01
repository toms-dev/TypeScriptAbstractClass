/// <reference path="../node_modules/reflect-metadata/reflect-metadata" />

import "reflect-metadata";

import Exceptions = require('./Exceptions');

var KEY_IS_REGULAR = "isRegularClass";
var KEY_IS_ABSTRACT = "isAbstractClass";
var KEY_REGULAR_ENFORCED = "regularEnforced";
var KEY_ABSTRACT_METHODS = "abstractMethods";

var processedPrototypes = [];

export var Config = {
	ignoreMissingAnnotations: false,
	throwErrorOnMissingAnnotations: false,
	reset: function () {
		for (var i in processedPrototypes) {
			if (!processedPrototypes.hasOwnProperty(i)) continue;
			var proto = processedPrototypes[i];
			Reflect.deleteMetadata(KEY_REGULAR_ENFORCED, proto);
		}
	}
};

var ignoreMissingAnnotations = false;

export function Abstract(constructor):any {
	//return constructor;
	var className = constructor.name;
	var argCount = constructor.length;
	var prototype = constructor.prototype;

	Reflect.defineMetadata(KEY_IS_ABSTRACT, true, prototype);

	var onlySuperCall = function (instanceProto) {
		var constructorChain = getProtoChain(instanceProto).map(function (el) {
			return el.constructor
		});
		var callContext = arguments.callee.caller;
		if (constructorChain.indexOf(callContext) == -1) {
			throw new Exceptions.CantInstantiateAbstractClass(instanceProto);
		}
		console.log("ABSTRACT CLASS '" + className + "' BEING INSTANTIATED!");
	};

	// TODO: remove return to make the code lighter? because it seems we are always in the value is always true...
	var notifyMissingAnnotation = function (instanceClassName):boolean {
		if (Config.ignoreMissingAnnotations) return true;
		//var throwError = false;	// what to do ? :)
		var message = "You forgot to annotate class '" + instanceClassName + "' with @Class.Regular or" +
			" @Class.Abstract !\n" +
			"The abstract class system is designed to resolve problems on app startup only.\n" +
			"Your code will be less safe and it will lower the performances during the first instanciation of" +
			" the class.";
		if (Config.throwErrorOnMissingAnnotations) {
			throw new Exceptions.MissingAnnotation(message);
		} else {
			console.warn(message);
			console.warn("The class '" + instanceClassName + "' is now considered as regular.\n");
			return true;
		}
		return false;
	};

	var performChecks = function () {

		// Check child classes
		//var instanceProto = this.constructor.prototype;
		var instanceProto = Object.getPrototypeOf(this);
		var instanceClassName = this.constructor.name;

		console.log("Performing checks on " + className + " through " + instanceProto.constructor.name);

		// Check if the check was already done by an annotation or a previous execution on another instance
		var isAlreadyEnforced = Reflect.hasOwnMetadata(KEY_REGULAR_ENFORCED, instanceProto);
		if (isAlreadyEnforced) {
			console.info("ALREADY ENFORCED " + className + " thanks to annotations:D");
			return;
		}

		// Enforce only child classes
		var isInstanceRegular = Reflect.hasOwnMetadata(KEY_IS_REGULAR, instanceProto);
		var isInstanceAbstract = Reflect.hasOwnMetadata(KEY_IS_ABSTRACT, instanceProto);
		var isInstanceAnnotated = isInstanceRegular || isInstanceAbstract;

		if (isInstanceAbstract) {	// we go here only if there are multiple Abstract inheritance levels
			// Only allow the super() call! ;)
			onlySuperCall(instanceProto);
		}

		// The class should be either annotation-declared Abstract or Class (regular class)
		// If its not the case, let's shout at the developers for killing the performances by not annotating
		// their class correctly.

		// If the class was not annotated, someone has forgotten to do something! ;)
		if (!ignoreMissingAnnotations && !isInstanceAnnotated) {
			isInstanceRegular = notifyMissingAnnotation(instanceClassName);
		}

		// Enforce only regular classes
		console.log("IsInstanceRegular:", isInstanceRegular);
		if (isInstanceRegular /*&& instanceProto != prototype*/) {
			console.log("Enforcing!");
			// Enforce only once
			if (!Reflect.hasOwnMetadata(KEY_REGULAR_ENFORCED, instanceProto)) {
				enforceClass(instanceProto);
			}
		}
	};

	// Wrap the constructor to perform some checks upon instantiation
	// Note: this should be only a safe-guard in case the @Class annotation has been forgotten
	var wrappedConstructor = function () {
		performChecks.apply(this);
		// Call the original constructor
		constructor.apply(this, arguments);
	};

	/*var wrapper = new Function(
	 'customAction',
	 'return function ' + className + '() {' +
	 'wrappedConstructor.apply(this, arguments)' +
	 '}'
	 );
	 var result = wrapper(customAction);*/
	var result = wrappedConstructor;
	result.prototype = prototype;
	return result;
}

export function AbstractMethod(prototype, key, descriptor:TypedPropertyDescriptor<any>) {
	//console.log("== AbstractMethod", arguments);
	Reflect.defineMetadata(KEY_IS_ABSTRACT, true, prototype);

	descriptor.value = function () {
		// TODO: test of this error throwing
		throw new Error("Abstract method called: " + prototype.constructor.name + "." + key);
	};

	// setup abstract methods
	var abstractMethods:string[];
	if (Reflect.hasOwnMetadata("abstractMethods", prototype)) {
		abstractMethods = Reflect.getOwnMetadata("abstractMethods", prototype);
	} else {
		abstractMethods = [];
	}
	// Add the method only if its not already registered
	if (abstractMethods.indexOf(key) == -1) {
		abstractMethods.push(key);
	}
	Reflect.defineMetadata("abstractMethods", abstractMethods, prototype);

	return descriptor;
}

// TODO: this should be replaced by a hook call on the Extended-Class project
export function Class(constructor) {
	console.log("== Class ", constructor.name);
	var proto = constructor.prototype;
	if (Reflect.hasOwnMetadata(KEY_ABSTRACT_METHODS, proto)) {
		var methodNames:string[] = Reflect.getOwnMetadata(KEY_ABSTRACT_METHODS, proto);
		throw new Exceptions.AbstractMethodInRegularClass(methodNames);
	}

	Reflect.defineMetadata(KEY_IS_REGULAR, true, proto);
	enforceClass(proto);
}

function getProtoChain(proto):any[] {
	var parentProto = proto;
	var protoChain = [];
	while (parentProto != Object.prototype) {
		protoChain.push(parentProto);
		parentProto = parentProto.__proto__;
	}
	return protoChain;
}

function getNonImplementedMethods(proto) {
	var protoChain:any[] = getProtoChain(proto).reverse();
	console.log("ProtoChain: ", protoChain.map(function (el) {
		return el.constructor.name;
	}));
	var methodsToImplement = [];

	// Process the chain, starting from the highest parent class
	for (var i in protoChain) {
		if (!protoChain.hasOwnProperty(i)) continue;
		var p = protoChain[i];
		var protoAbstractMethods = Reflect.getOwnMetadata(KEY_ABSTRACT_METHODS, p) || [];
		// Get local non-abstract methods (defined in the class)
		var protoNonAbstractMethods = [];
		for (var methodName in p) {
			if (!p.hasOwnProperty(methodName)) continue;
			var method = p[methodName];

			// Skip non-function attributes
			if (typeof(method) != "function") continue;

			// Skip methods that were declared abstract by this class
			if (protoAbstractMethods.indexOf(methodName) != -1) continue;

			// Check if there is a use of the super call on an abstract method:
			// Note: there is no risk of catching a legit "super" call because if the method
			// is in the array 'methodsToImplement', it has no valid implementation until then.
			if (methodsToImplement.indexOf(methodName) != -1) {
				var pattern = "_super.prototype." + methodName + ".call";
				if (method.toString().indexOf(pattern) != -1) {
					// TODO: create exception and test this
					throw new Exceptions.SuperCallToAbstractMethod(proto.constructor.name + "." + methodName);
					/*throw new Error("SEVERE! Using super call to an abstract method in "
						+ proto.constructor.name + "." + methodName);*/
				}
			}
			// TODO: Check params count?

			protoNonAbstractMethods.push(methodName);
		}

		// Now remove the non-abstract methods from the methods to implements
		var newMethodsToImplement = methodsToImplement.filter(function (el, i) {
			// only keep methods that were not implemented and that are not already in the list
			return protoNonAbstractMethods.indexOf(el) == -1
		});
		methodsToImplement = newMethodsToImplement;


		// Now add all the abstract method that were defined for the child class to process
		Array.prototype.push.apply(methodsToImplement, protoAbstractMethods)
		console.log("Class " + p.constructor.name + " implements: ", protoNonAbstractMethods);
		console.log("Class " + p.constructor.name + " makes its child implement: ", methodsToImplement);
	}

	return methodsToImplement;
}

/*function enforceAbstractR(proto, model, declaredMethods: string[]) {
 var parentProto = proto.__proto__;
 if (parentProto != Object.prototype) {
 enforceAbstract(proto, parentProto);
 } else {
 // no parent, all the methods must be implemented
 }

 console.log("Processing prototype "+proto.constructor.name);
 if (Reflect.getMetadata("isAbstractClass", proto)) {
 console.log("Found child class!");
 processAbstractChildClass(proto);
 }

 }*/

function enforceClass(proto) {
	var nonImpl = getNonImplementedMethods(proto);

	// Mark the class as processed
	Reflect.defineMetadata(KEY_REGULAR_ENFORCED, true, proto);
	processedPrototypes.push(proto);

	console.log("ENFORCED ", proto.constructor.name);

	if (nonImpl.length > 0) {
		throw new Exceptions.MethodNotImplementedException(proto, nonImpl);
		//throw new Error("Methods not implemented in " + proto.constructor.name + " : [" + nonImpl.join(',') + "]");
	}

}