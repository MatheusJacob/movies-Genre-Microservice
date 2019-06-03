"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/movies.service");
const GenresService = require("../../services/genres.service");
const rimraf = require("rimraf");

function seedDB(broker){
	const genresToCreate = [
		{_id: 1, title : "Romantic", description : "Romantic description"},
		{_id: 2, title : "Drama", description : "Drama description"},
		{_id: 3, title : "Action", description : "Action description"},
		{_id: 4, title : "Thriller", description : "Thriller description"}
	];

	const moviesToCreate = [

	];

	const genresPromises = [];
	genresToCreate.forEach(function(e){
		genresPromises.push(broker.call("genres.create",e));
	});

	return Promise.all(genresPromises);
}

let broker = {};

beforeAll(() => {
	delete process.env.MONGO_URI;

	rimraf("data/",function(err){
		if(err)
			console.log("ERROR : " , err);
	});	

	broker = new ServiceBroker();
	broker.createService(TestService);
	broker.createService(GenresService);
	return broker.start();
});

afterAll(() => broker.stop());

describe("Test 'movies' service", () => {

	describe("Test 'Movies.create' action", () => {

		it("should return validation error, if sent without parameters", () => {
			return broker.call("movies.create",{})
				.catch((e) => {
					expect(e).toBeInstanceOf(ValidationError);
					expect(e).toMatchObject({code : 422});
				});
			
		});

		it("should return validation error, if sent without mandatory fields", () => {
			return broker.call("movies.create",{ description : "Movie Description"})
				.catch((e) => {
					expect(e).toBeInstanceOf(ValidationError);
					expect(e).toMatchObject({code : 422});
				});
		});


		it("should return validation error, if sent with wrong type in description", () => {
			return broker.call("movies.create",{ name: "Movie Title" , description : 2})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "string"})]));
			})
		});

		it("should return validation error, if sent with wrong type in release date", () => {
			return broker.call("movies.create",{ name: "Movie Title" , releaseDate : "noDate"})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "date"})]));
			})
		});

		it("should return validation error, if sent with wrong type in duration", () => {
			return broker.call("movies.create",{ name: "Movie Title" , duration : "string"})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "number"})]));
			})
		});

		it("should return validation error, if sent with wrong type in rating", () => {
			return broker.call("movies.create",{ name: "Movie Title" , rating : "string"})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "number"})]));
			})
		});

		it("should return validation error, if sent with wrong type in Genres", () => {
			return broker.call("movies.create",{ name: "Movie Title" , genres : [1]})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "string"})]));
			})
		});

		it("should succeed with simple movie created", () => {
			return broker.call("movies.create",{ name: "Movie name" })
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("name");
			})
		});

		it("should succeed with right release date", () => {
			return broker.call("movies.create",{ name: "Movie name" , releaseDate : new Date()})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("releaseDate");
			})
		});

		it("should succeed with right duration", () => {
			return broker.call("movies.create",{ name: "Movie name" , duration : 5})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("duration");
			})
		});

		it("should succeed with right rating", () => {
			return broker.call("movies.create",{ name: "Movie name" , rating : 5})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("rating");
			})
		});

		it("should succeed with right Genres", () => {
			return broker.call("movies.create",{ name: "Movie name" , genres : ["1"]})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("genres");
			})
		});

		it("should succeed with multiple Genres", () => {
			return broker.call("movies.create",{ name: "Movie name" , genres : ["1","2"]})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("genres");
			})
		});

		it("should succeed with full creation", () => {
			return broker.call("movies.create",{ 
				name: "Movie name" ,description: "Movie description", genres : ["1","2"], 
				duration : 5, rating : 4, releaseDate : new Date()})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("name");
				expect(data).toHaveProperty("description");
				expect(data).toHaveProperty("genres");
				expect(data).toHaveProperty("duration");
				expect(data).toHaveProperty("rating");
				expect(data).toHaveProperty("releaseDate");
			})
		});
	});

});



