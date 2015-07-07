/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import fs = require('fs');
import chai = require('chai');
import sinon = require('sinon');

var assert = chai.assert;

import Exceptions = require('../lib/Exceptions');

describe("Abstract annotation unit test", () => {
	it("should be able to process correctly written classes", () => {
		var test = require("../test-resources/SimpleAbstractInheritance");
	});

	it("should throw an exception if a method is not implemented", () => {
		chai.expect(() => {
			var test = require("../test-resources/MissingMethodImplementation");
		}).to.throw(Exceptions.MethodNotImplementedException);
	});

	it("should throw an exception if an abstract class is instantiated directly", () => {
		var test = require("../test-resources/BasicInheritanceSetup");
		chai.expect(() => {
			var a = new test.Abstract1()
		}).to.throw(Exceptions.CantInstantiateAbstractClass);

		chai.expect(() => {
			var a = new test.Class1()
		}).to.not.throw(Exceptions.CantInstantiateAbstractClass);
	});

	it("should throw an exception on instantiation if a method is missing," +
		"even if the annotation was forgotten", () => {
		var test = require("../test-resources/MissingClassAnnotation");
		// No tag but correctly implementing the parent class
		var a = new test.Class1();
		console.log("derp");
		// No tag but incorrectly implementing the parent class

		chai.expect(() => {
			new test.Class2();
		}).to.throw(Exceptions.MethodNotImplementedException);
	});

});