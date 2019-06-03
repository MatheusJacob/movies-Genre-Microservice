"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/genres.service");
const rimraf = require("rimraf");

describe("Test 'genres' service", () => {
	delete process.env.MONGO_URI;
	rimraf.sync("../../data/");

	let broker = new ServiceBroker();
	const genresService = broker.createService(TestService);
	
	beforeAll(() => {
		broker.start();
	});
	afterAll(() => broker.stop());

	describe("Test 'greeter.hello' action", () => {

		it("should return with 'Hello Moleculer'", () => {
			expect(broker.call("greeter.hello")).resolves.toBe("Hello Moleculer");
		});

	});

	describe("Test 'greeter.welcome' action", () => {

		it("should return with 'Welcome'", () => {
			expect(broker.call("greeter.welcome", { name: "Adam" })).resolves.toBe("Welcome, Adam");
		});

		it("should reject an ValidationError", () => {
			expect(broker.call("greeter.welcome")).rejects.toBeInstanceOf(ValidationError);
		});

	});

});

