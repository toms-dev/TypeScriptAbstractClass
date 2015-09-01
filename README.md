# Abstract Classes for TypeScript
This library allows you to easily declare abstract classes using annotations/decorators :
```TypeScript
@Abstract
class Greetings {

	@AbstractMethod
	public getUserName(): string {
		return "";
	}

	public normalMethod(): void {
		console.log("Hello "+this.getUserName());
	}

}
```
The idea behind this library is that there is currently no simple way of doing abstract classes in TypeScript.
This library is adding an extra "compilation" step that is performed on code startup when in development
environment only (we don't want to ruin your production performances!).

**Notice:** This is a work-in-progress and some features are missing.

## Features
*Abstract Classes for TypeScript* will help you improve your development workflow, in particular when working in team, by limiting incorrect usage of each other's code thanks to abstract classes.

- **Save time**. Declare abstract classes with abstract methods in TypeScript in only a few keystrokes. Constraints validation is performed automatically.
- **Get in control of your codebase**. Only concrete classes can be instantiated. Abstract methods can't be triggered in any way.
- **Stay in control of performances**. Even if most validation is performed on startup only, you can still disable it for production environment **(WIP)**
- **Be forgiving**. If another developer forgot a non-critical annotation, a warning can be simply displayed without crashing everything. But that's configurable!

## Install

First, install the library with npm:
```bash
$ npm install ts-abstract-class --save
```

## Requirements

 - TypeScript compiler 1.7 or higher (`$ npm install -g typescript@next`)
 - ECMAScript5-compliant engine (nodejs version >= 0.10 will do fine)

## Getting started

Let's import the _Abstract Classes API_.
```TypeScript
	import AbstractClassAPI = require('ts-abstract-class');
```

Then, you have to define your abstract classes using the annotation ```@Class.Abstract``` :
```TypeScript
@AbstractClassAPI.Abstract
class Greetings {
	...
}
```
**Note.** To lighten the syntax, you can store some parts of the API in variables:
```
var Abstract = AbstractClassAPI.Abstract,
	AbstractMethod = AbstractClassAPI.AbstractMethod
```

Next, you can define the abstract methods that the child classes will have to implement, using ```@Class.AbstractMethod```:
```TypeScript
@Abstract
class Greetings {
	@AbstractMethod
	public doSomething(): void {
	}
	@AbstractMethod
	public getUserName(): string {
		return "";
	}
}
```
**Important.** The code you write in the abstract methods is only here to have syntactically correct TypeScript code, but be assured that **it will be never be called** (for real!). Actually, it's replaced by an exception throw when the class loads. 

Now you can extend your abstract class:
```TypeScript
@AbstractClassAPI.Class
class ChildClass extends Greetings {
	public doSomething(): void {
		console.log("More code!");
	}
	public getUserName(): string {
		
	}
}
```
**The annotation is optional**. Its purpose is to improve performances : the library will check at startup that the class is correctly extending its parent. If the annotation is not set, this check will be performed once when creating the first instance of the class.

## Configuration
To do. Sorry. Still, you may take a look in `AbstractClassAPI.Config`.

## Examples

You can find more examples in the *examples/* directory, and also in the *test* one, even if it might be a little more complex to read.
You may also want to take a look in *test-resources* for samples of valid and invalid usages.


## todo list

 - file loader for providing an additional compilation step in IDE like WebStorm.
 - production mode
 - proper *package.json*

### Author
Tom Guillermin, [http://www.tomsdev.com](www.tomsdev.com)
