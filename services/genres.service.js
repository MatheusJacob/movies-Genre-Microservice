"use strict";

const DbService = require("../mixins/db.mixin.js");


module.exports = {
	name: "genres",
	mixins: [
		DbService("genres"),
	],
	/**
	 * Service settings
	 */
	settings: {
		fields: ["_id", "title", "description"],
		entityValidator: {
			title: "string",
			description: {type: "string", optional:true},
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