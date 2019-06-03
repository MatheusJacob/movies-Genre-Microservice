"use strict";

const DbService = require("../mixins/db.mixin.js");

module.exports = {
	name: "movies",
	mixins: [
		DbService("movies"),
	],

	/**
	 * Service settings
	 */
	settings: {
		fields: ["_id", "name", "description", "releaseDate","duration","rating","genres"],
		populates : {
			"genres" : {
				action: "genres.get",
				params: {
					populate : "",
					fields: "title,_id",
					searchFields: ""
				}
			}
		},
		entityValidator: {
			name: "string",
			description: { type: "string", optional : true},
			releaseDate: { type: "date", convert: true, optional : true},
			duration: { type: "number",min:0,max: 500, optional : true},
			rating: { type: "number",min:0, max:10, optional : true},
			genres: { type: "array", items:"string", optional : true},
		}
	},

	/**
	 * Service metadata
	 */
	metadata: {

	},

	/**
	 * Service dependencies
	 */
	//dependencies: [],	

	/**
	 * Actions
	 */
	actions: {

	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped() {

	}
};