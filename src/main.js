var $ = require('lodash')

/*
 * get a promise from different promise provider
 * */
var getPromise = function (Promise, resolver) {
	//bluebird
	if (Promise.promisifyAll) {
		return new Promise(resolver)
	}
	// when
	if (Promise.lift) {
		return Promise.promise(resolver)
	}
	//RSVP / Q / es6-promise
	if (Promise.Promise) {
		return new Promise.Promise(resolver)
	}
	// io.js promise
	if (Promise.defer) {
		return new Promise(resolver)
	}

	throw new Error('mongoomise promisification aborted, promise library is not supported')
}

/*
 * get a resolver from the original node style callback function
 * */
var getResolver = function (method, args, context) {
	return function (resolve, reject) {
		args.push(function (err) {
			if (err) {
				return reject(err)
			}
			var receivedArgs = $.toArray(arguments)
			// remove the first argument for error
			receivedArgs.shift()
			resolve(receivedArgs.length > 1 ? receivedArgs : receivedArgs[0])
		})

		method.apply(context, args)
	}
}

exports.promisifyAll = function (mongoose, Promise, suffix) {
	suffix = suffix || 'Async'

	if (!Promise) {
		throw new Error('mongoomise promisification aborted, missing promise library')
	}

	/*
	 * connect mongodb via `mongoose.connect` or `mongoose.createConnection`
	 * */
	var connection = mongoose.base ? mongoose : null
	mongoose = mongoose.base ? mongoose.base : mongoose

	/*
	 * models may be stored on other connections
	 * but schemas are stored on the unique mongoose instance
	 * */
	var Schemas = mongoose.modelSchemas
	if (Object.keys(Schemas).length < 1) {
		throw new Error('mongoomise promisification aborted, please ensure that all your schemas are loaded')
	}

	/*
	 * promisify `mongoose.Model` static methods by appending a suffix, default `Async`
	 * */
	var modelStaticsList = [
		'aggregate', 'count', 'create', 'distinct', 'ensureIndexes',
		'find', 'findById', 'findByIdAndRemove', 'findByIdAndUpdate',
		'findOne', 'findOneAndRemove', 'findOneAndUpdate',
		'geoNear', 'geoSearch', 'mapReduce', 'populate', 'remove', 'update'
	]
	var mongooseModelClass = mongoose.Model
	$.each(modelStaticsList, function (methodName) {
		mongooseModelClass[methodName + suffix] = function () {
			// using this to ref the target child class, do not use Model
			return getPromise(Promise, getResolver(mongooseModelClass[methodName], $.toArray(arguments), this))
		}
	})

	/*
	 * promisify custom static methods from schema.statics
	 * NOTE:
	 * global models may be empty when using `connection.model`
	 * so we need `mongoose.model` to cache it and then start the promisification;
	 * `connection.model` will lookup to base when no models found
	 * */
	var globalModels = mongoose.models
	var connectionModels = connection && connection.models
	var unregistered = $.difference($.keys(connectionModels), $.keys(globalModels))
	$.each(unregistered, function (i) {
		mongoose.model(i)
	})
	$.each(Schemas, function (schema, schemaName) {
		$.each(schema.statics, function (fn, methodName) {
			var model = globalModels[schemaName]
			var connectionModel = connectionModels && connectionModels[schemaName]
			if (model) {
				model[methodName + suffix] = function () {
					return getPromise(Promise, getResolver(model[methodName], $.toArray(arguments), this))
				}
			}
			if (connectionModel) {
				connectionModel[methodName + suffix] = function () {
					return getPromise(Promise, getResolver(connectionModel[methodName], $.toArray(arguments), this))
				}
			}
		})
	})

	/*
	 * promisify mongoose supplied classes instance methods
	 * */
	var instanceSource = {
		Query: [
			'count', 'distinct', 'exec', 'find', 'findOne', 'findOneAndRemove',
			'findOneAndUpdate', 'remove', 'update'
		],
		Model: [
			'remove', 'save',
			// extended from Document
			'update', 'validate', 'populate'
		]
	}
	$.forIn(instanceSource, function (methods, className) {
		var cls = mongoose[className], prototype = cls.prototype
		$.each(methods, function (i) {
			var methodName = i + suffix
			prototype[methodName] = function () {
				return getPromise(Promise, getResolver(this[i], $.toArray(arguments), this))
			}
		})
	})

	/*
	 * TODO promisify custom instance methods
	 * */
}
