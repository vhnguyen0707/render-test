//LBE4YZxvS5jIRSPO
const mongoose = require('mongoose');

if (process.argv.length < 3){
    console.log('give password as argument')
    process.exit(1);
}

const password = process.argv[2]

// supply mongodb URL to mongodb client library
const url = `mongodb+srv://vhnguyen779:${password}@cluster0.4khq7kc.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3){
    Person.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(person => console.log(`${person.name} ${person.number}`));
        mongoose.connection.close();
    })
} else if (process.argv.length === 5){
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save().then(result => {
        console.log(`Added ${person.name} number ${person.number} to phone book `);
        mongoose.connection.close()
    })
} else {
    console.log('cannot be saved');
    mongoose.connection.close();
}

