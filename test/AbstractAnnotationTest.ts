/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/sinon/sinon.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
// <reference path="../typings/fix.d.ts" />

import chai = require('chai');
import sinon = require('sinon');

var assert = chai.assert;

import API = require('../lib/AbstractClassAPI');
import Exceptions = require('../lib/Exceptions');

describe("Abstract annotation unit test", () => {

	beforeEach(() => {
		API.Config.throwErrorOnMissingAnnotations = false;
	});

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

	describe("should throw an exception on instantiation if a method is missing," +
		"even if the annotation was forgotten", () => {

		var test = require("../test-resources/MissingClassAnnotation");

		describe("No annot. but correctly implementing the parent class", () => {

			beforeEach(() => {
				API.Config.reset();
			});

			it("every time an instantiation is performed when error mode is ON", () => {
				API.Config.throwErrorOnMissingAnnotations = true;
				chai.expect(()=> {
					new test.Class1();
				}).to.throw(Exceptions.MissingAnnotation);
				chai.expect(()=> {
					new test.Class1();
				}).to.throw(Exceptions.MissingAnnotation);
			});

			it("only the first time when using warning only", () => {
				API.Config.throwErrorOnMissingAnnotations = false;
				var warnSpy = sinon.spy(console, "warn");
				new test.Class1();
				var spyCount = warnSpy.callCount;
				chai.expect(spyCount).to.be.greaterThan(0, "first warnings");
				new test.Class1();
				chai.expect(warnSpy.callCount).to.be.equal(spyCount, "no more warning");
			});
		});
		describe("No annot. but incorrectly implementing the parent class", () => {

			beforeEach(() => {
				API.Config.reset();
			});
			it("should fail to MissingAnnotation when using error mode", () => {
				API.Config.throwErrorOnMissingAnnotations = true;
				chai.expect(() => {
					new test.Class2();
				}).to.throw(Exceptions.MissingAnnotation);
			});

			it("should fail directly to MethodNotImplemented when using warning mode", () => {
				API.Config.throwErrorOnMissingAnnotations = false;
				chai.expect(() => {
					new test.Class2();
				}).to.throw(Exceptions.MethodNotImplementedException);
			});
		});
	});

	it("should throw an exception if AbstractMethod is defined in a RegularClass", () => {
		chai.expect(() => {
			var test = require("../test-resources/AbstractMethodInRegularClass");
		}).to.throw(Exceptions.AbstractMethodInRegularClass);
	});

	it.skip("should throw an exception if AbstractMethod is defined in a non-annotated class", () => {
		// TODO: is this possible?
		chai.expect(() => {
			var test = require("../test-resources/AbstractMethodInRegularClass");
		}).to.throw(Exceptions.AbstractMethodInRegularClass);
	});

	it("should throw an exception if a method overriding an abstract method uses the super call", () => {
		chai.expect(() => {
			var test = require("../test-resources/SuperCallInAbstractOverride");
		}).to.throw(Exceptions.SuperCallToAbstractMethod);
	});

});