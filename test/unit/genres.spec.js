"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../services/genres.service");
const rimraf = require("rimraf");

function seedDB(broker){
	const genresToCreate = [
		{title : "Romantic", description : "Romantic description"},
		{title : "Drama", description : "Drama description"},
		{title : "Action", description : "Action description"},
		{title : "Thriller", description : "Thriller description"}
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
	return broker.start();
});

afterAll(() => broker.stop());

describe("Test 'genres' service", () => {

	describe("Test 'Genres.create' action", () => {

		it("should return validation error, if sent without parameters", () => {
			return broker.call("genres.create",{})
				.catch((e) => {
					expect(e).toBeInstanceOf(ValidationError);
					expect(e).toMatchObject({code : 422});
				});
			
		});

		it("should return validation error, if sent without mandatory fields", () => {
			return broker.call("genres.create",{ description : "Genre Description"})
				.catch((e) => {
					expect(e).toBeInstanceOf(ValidationError);
					expect(e).toMatchObject({code : 422});
				});
		});


		it("should return validation error, if sent with wrong type in description", () => {
			return broker.call("genres.create",{ title: "Genre Title" , description : 2})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "string"})]));
			})
		});

		it("should return validation error, if sent with wrong type in title", () => {
			return broker.call("genres.create",{ title: 2})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "string"})]));
			})
		});

		it("should succeed", () => {
			return broker.call("genres.create",{ title: "Genre TItle" , description : "Genre description"})
			.then((data) => {
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("title");
				expect(data).toHaveProperty("description");
			})
		});
	});

	describe("Test 'Genres.get' action", () => {

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
			return broker.call("genres.get",{})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
				expect(e.data).toEqual(expect.arrayContaining([expect.objectContaining({type : "required",field: "id"})]));
			})
		});
		
		it("should get a specific existent genre", () => {

			let genreToCompare = {};
			return broker.call("genres.list",{ populate : [], fields: ["_id","title","description"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(4);
				genreToCompare = data.rows[0];
				return broker.call("genres.get",{ populate : [], fields: ["_id","title","description"], id: data.rows[0]._id});
			})
			.then((data)=>{
				expect(data).toHaveProperty("_id");
				expect(data).toHaveProperty("title");
				expect(data).toHaveProperty("description");
				expect(data).toEqual(genreToCompare);
			});
		});

		it("should get a specific existent genre with only ID field", () => {

			return broker.call("genres.list",{ populate : [], fields: ["_id"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(4);
				return broker.call("genres.get",{ populate : [], fields: ["_id"], id: data.rows[0]._id});
			})
			.then((data)=>{
				expect(data).toHaveProperty("_id");
				expect(data).not.toHaveProperty("title");
				expect(data).not.toHaveProperty("description");
			});
		});

		it("should return EntityNotFoundError for entity not found ", () => {

			return broker.call("genres.get",{ populate : [], fields: ["_id","title","description"], id: 1})
			.catch((e)=>{
				expect(e).toMatchObject({code : 404});
			});
		});
	});

	describe("Test 'Genres.list' action", () => {

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
			return broker.call("genres.list",{})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
			})
		});
		
		it("should get 4 genres with fields", () => {

			return broker.call("genres.list",{ populate : [], fields: ["_id","title","description"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(4);
				expect(data.rows[0]).toHaveProperty("_id");
				expect(data.rows[0]).toHaveProperty("title");
				expect(data.rows[0]).toHaveProperty("description");
			});
		});

		it("should get all genres that contains 'A' (3 expected)", () => {

			return broker.call("genres.list",{ populate : [], fields: ["_id","title","description"], searchFields : ["title"], search : "A"})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(3);
			});
		});
	});

	describe("Test 'Genres.delete' action", () => {

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
			return broker.call("genres.remove",{})
			.catch((e) => {
				expect(e).toBeInstanceOf(ValidationError);
				expect(e).toMatchObject({code : 422});
			})
		});
		
		it("should get 404 for genre not found", () => {

			return broker.call("genres.remove",{ populate : [], fields: [], searchFields : [], id : 1})
			.catch((e) => {
				expect(e).toMatchObject({code : 404});	
			});
		});

		it("should delete genre", () => {

			let genreDeletedId = null;
			return broker.call("genres.list",{ populate : [], fields: ["_id","title","description"], searchFields : []})
			.then((data) => {
				expect(data).toHaveProperty("total");
				expect(data.total).toEqual(4);

				genreDeletedId = data.rows[0]._id;
				return broker.call("genres.remove",{ populate : [], fields: [], id: genreDeletedId});
			})
			.then((data)=>{
				expect(data).toEqual(1);				
				return broker.call("genres.get",{ populate : [], fields: [], id: genreDeletedId});
			})
			.catch((e)=>{
				expect(e).toMatchObject({code : 404});	
			});
		});
	});
});



