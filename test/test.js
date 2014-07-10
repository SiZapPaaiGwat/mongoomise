var bluebird = require('bluebird')
var Q = require('q')
var when = require('when')
var RSVP = require('rsvp')
var mongoose = require('mongoose')

require('mongoomise').promisifyAll(mongoose, Q)

var Feed = mongoose.model('Feed')

// static method from Model
Feed.countAsync().then(function(total){
	console.log('static method from Model', total)
})

// instance method from Query
Feed.find().countAsync().then(function(total){
	console.log('instance method from Query', total)
})

// instance method from Model
Feed.findOne().execAsync().then(function(feed){
	feed.text = 'oops'
	return feed.saveAsync()
}).then(function(results){
	console.log(results)
})

// custom static method
Feed.testAsync().then(function(output){
	console.log('custom static method', output)
})