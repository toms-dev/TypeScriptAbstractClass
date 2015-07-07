import ClassAPI = require('../index');

import AbstractClass = ClassAPI.Abstract;
import AbstractMethod = ClassAPI.AbstractMethod;
import Class = ClassAPI.Class;

@AbstractClass
class Instrument {
	protected name:string;

	@AbstractMethod
	public play():void {

	}
}

@AbstractClass
class StringedInstrument extends Instrument {
	protected numberOfStrings:number;
}

@Class
class ElectricGuitar extends StringedInstrument {

	public constructor(numberOfStrings:number = 6) {
		super();
		this.name = "Guitar";
		this.numberOfStrings = numberOfStrings;
	}

	// TODO @Override
	public play():void {
		console.log("An electric " + this.numberOfStrings + "-string " + this.name
			+ " is playing a riff!");
	}
}

@Class
class ElectricBassGuitar extends StringedInstrument {

	public constructor(numberOfStrings:number = 4) {
		super();
		this.name = "Bass";
		this.numberOfStrings = numberOfStrings;
	}

	// TODO @Override
	public play():void {
		console.log("An electric " + this.numberOfStrings + "-string " + this.name
			+ " is slapping!");
	}
}


var guitar = new ElectricGuitar();
var bassGuitar = new ElectricBassGuitar();

guitar.play();
bassGuitar.play();

guitar = new ElectricGuitar(7);
bassGuitar = new ElectricBassGuitar(5);

guitar.play();
bassGuitar.play();

