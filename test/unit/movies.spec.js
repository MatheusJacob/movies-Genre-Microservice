"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/movies.service");
const GenresService = require("../../services/genres.service");
const rimraf = require("rimraf");

function seedDB(broker){
	const genresToCreate = [
		{_id: "1", title : "Romantic", description : "Romantic description"},
		{_id: "2", title : "Drama", description : "Drama description"},
		{_id: "3", title : "Action", description : "Action description"},
		{_id: "4", title : "Thriller", description : "Thriller description"}
	];

	//no need to mock date cause we dont do any operation with dates
	const moviesToCreate = [
		{ _id : "1", name : "movieName", description : "Movie description", duration : 5, rating : 8, releaseDate : new Date(), genres : ["1","2","3"]},
		{ _id : "2", name : "movieName2", description : "Movie description2", duration : 6, rating : 4, releaseDate : new Date(), genres : ["4"]},
		{ _id : "3", name : "movieName3", description : "Movie description3", duration : 7, rating : 3, releaseDate : new Date(), genres : ["4","1"]},
		{ _id : "4", name : "movieName4", description : "Movie description4", duration : 8, rating : 5, releaseDate : new Date(), genres : ["2"]},
		{ _id : "5", name : "movieName5", description : "Movie description5", duration : 9, rating : 6, releaseDate : new Date(), genres : ["3","1"]},
	];

	const promisesToCreate = [];
	genresToCreate.forEach(function(e){
		promisesToCreate.push(broker.call("genres.create",e));
	});

	moviesToCreate.forEach(function(e){
		promisesToCreate.push(broker.call("movies.create",e));
	});

	return Promise.all(promisesToCreate);
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

	describe("Test 'Movies.get' action", () => {

		beforeAll(() => {
			rimraf("data/",function(err){
				if(err)
					console.log("ERROR : " , err);
			});	
		
			return broker.start()
			.then(()=>{ 
				return seedDB(broker);
			});
		});

		it("should return validation error, if sent without parameters", () => {
			return broker.call("movies.get",{})
				.catch((e) => {
					expect(e).toBeInstanceOf(ValidationError);
					expect(e).toMatchObject({code : 422});
				});
			
		});

		it("should return EntityNotFoundError for entity not found ", () => {

			return broker.call("movies.get",{ populate : [], fields: ["_id"], id: 99})
			.catch((e)=>{
				expect(e).toMatchObject({code : 404});
			});
		});

		it("should get a specific existent movie", () => {

			let movieToCompare = {};
			return broker.call("movies.list",{ populate : [], fields: ["_id","name","description"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(5);
				movieToCompare = data.rows[0];
				return broker.call("movies.get",{ populate : [], fields: ["_id","name","description"], id: data.rows[0]._id});
			})
			.then((data)=>{
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("name");
				expect(data).toHaveProperty("description");
				expect(data).toEqual(movieToCompare);
			});
		});

		it("should get movie and populate genres", () => {

			return broker.call("movies.get",{ populate : ["genres"], fields: ["_id","name","description","genres"], id: "1"})
			.then((data)=>{
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("name");
				expect(data).toHaveProperty("description");
				expect(data).toHaveProperty("genres");
				expect(data.genres).toEqual(expect.arrayContaining([expect.objectContaining({title : expect.any(String)})]));
			});
		});
	});

	describe("Test 'Movies.list' action", () => {

		beforeAll(() => {
			rimraf("data/",function(err){
				if(err)
					console.log("ERROR : " , err);
			});	
		
			return broker.start()
			.then(()=>{ 
				return seedDB(broker);
			});
		});

		it("should return validation error, if sent without parameters", () => {
			return broker.call("movies.list",{})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
			})
		});
		
		it("should get 5 movies with fields", () => {

			return broker.call("movies.list",{ populate : [], fields: ["_id","name","description"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(5);
				expect(data.rows[0]).toHaveProperty("_id");
				expect(data.rows[0]).toHaveProperty("name");
				expect(data.rows[0]).toHaveProperty("description");
			});
		});

		it("should get all movies that contains '2' (1 expected)", () => {

			return broker.call("movies.list",{ populate : [], fields: ["_id","name","description"], searchFields : ["name"], search : "2"})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(1);
			});
		});
	});


	describe("Test 'MOvies.delete' action", () => {

		beforeAll(() => {
			rimraf("data/",function(err){
				if(err)
					console.log("ERROR : " , err);
			});	
		
			return broker.start()
			.then(()=>{ 
				return seedDB(broker);
			});
		});

		it("should return validation error, if sent without parameters", () => {
			return broker.call("movies.remove",{})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
			})
		});
		
		it("should get 404 for movie not found", () => {

			return broker.call("movies.remove",{ populate : [], fields: [], searchFields : [], id : "99"})
			.catch((e) => {
				expect(e).toMatchObject({code : 404});	
			});
		});

		it("should delete movie", () => {

			let movieDeletedId = null;
			return broker.call("movies.list",{ populate : [], fields: ["_id","name","description"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(5);

				movieDeletedId = data.rows[0]._id;
				return broker.call("movies.remove",{ populate : [], fields: [], id: movieDeletedId});
			})
			.then((data)=>{
				expect(data).toEqual(1);				
				return broker.call("movies.get",{ populate : [], fields: [], id: movieDeletedId});
			})
			.catch((e)=>{
				expect(e).toMatchObject({code : 404});	
			});
		});
	});
});



