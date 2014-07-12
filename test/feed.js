var mongoose = require('mongoose')
var Schema = mongoose.Schema

var FeedSchema = new Schema({
	text: String,
	create_time: Date,
	pid: {
		type: Schema.Types.ObjectId, ref: 'Feed'
	}
})

// custom static method
FeedSchema.statics.custom = function(input, fn){
	setTimeout(function(){
		fn(null, input)
	}, 20)
}

FeedSchema.pre('save', function(next){
	this.create_time = new Date()
	next()
})

FeedSchema.post('save', function(){
//	console.log('document has been saved')
})

module.exports = mongoose.model('Feed', FeedSchema)