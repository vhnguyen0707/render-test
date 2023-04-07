const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    name: { type: String, minLength: 3, required: true },
    number: String
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Person = mongoose.model('Person', personSchema)

module.exports = Person;