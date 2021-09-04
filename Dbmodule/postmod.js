const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postschema = new Schema({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        require: true
    }
},{
    timestamps: true
});

module.exports = mongoose.model('Post',postschema);