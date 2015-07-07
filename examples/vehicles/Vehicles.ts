

import ClassAPI = require('../../index');

import AbstractClass = ClassAPI.Abstract;
import AbstractMethod = ClassAPI.AbstractMethod;
import Class = ClassAPI.Class;

@AbstractClass
class Vehicle {

	private price: number;

	constructor(price:number) {
		this.price = price;
	}

	public sell() {
		console.log("You won $"+this.price+" by selling your "+this.toString());
	}

	@AbstractMethod
	public run(): void {

	}

	@AbstractMethod
	public toString() {

	}

}

@AbstractClass
class MotorizedVehicle extends Vehicle {

	protected engineStarted: boolean = false;

	public start(): void {
		this.engineStarted = true;
	}

	public stopEngine() {
		this.engineStarted = false;
	}

}

@Class
class Car extends MotorizedVehicle {

	public run():void {
		super.run();
	}

	// TODO: @Override
	public stopEngine():void {
		console.log("Bye!");
		return super.stopEngine();
	}

	public toString() {
		return "Car";
	}
}

var myCar = new Car(12000);
console.log(myCar.run.toString());
myCar.run();
myCar.sell();