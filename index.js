const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // allows server to indicate which origins are allowed to access its resources
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.MONGODB_URI
const Person = require('./models/Person');

app.use(cors());
app.use(express.static('dist'))
app.use(express.json());
//set up database
mongoose.set('strictQuery', false);
mongoose.connect(url)
  .then(result => console.log('Connected to MongoDB'))
  .catch(err => console.log('error connecting to mongodb', err.message));


app.use(morgan(function (tokens, req, res) {
    console.log(req.method, req.url, res.statusCode, res.getHeader('content-length'), '-', req.body)
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }));


app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(phoneBook => {
    res.json(phoneBook);
  }).then(err => next(err))
    
})

app.post('/api/persons', (req, res, next) => {
    const person = req.body;
    if (!person.name || !person.number) return res.status(400).json({ error: 'Missing name or number' });
    const newPerson = new Person({
        name: person.name,
        number: person.number
    })
    newPerson.save().then(savedPerson => res.json(savedPerson))
      .catch(err => next(err));
    
})

app.get('/info', (req, res, next) => {
  Person.find({}).then(result => {
    res.send(`<p>Phonebook has info for ${result.length} people</p><p>${new Date()}</p>`)
  }).catch(err => next(err))
})

app.get('/api/persons/:id', (req,res, next) => {
    const id = req.params.id;
    Person.findById(id)
      .then(person => {
        if (person) res.json(person)
        else res.status(404).json({error: 'Person not found'});
      })
      .catch(err => next(err))
})

app.put('/api/persons/:id', (req,res, next) => {
  const {number}= req.body; 
  const id = req.params.id;
  Person.findOneAndUpdate({_id: id }, {number}, {new: 'true', runValidators: true, context: 'query'}) //since validations are not done when editing doc
    .then(updatedPerson => {
      if (updatedPerson) res.status(200).json(updatedPerson);
      else res.status(404).json({error: 'Not found'})
    })
    .catch(err => next(err));

})

app.delete('/api/persons/:id', (req,res, next) => {
    const id = req.params.id;
    Person.findOneAndDelete({_id: id })
      .then(docs => {
        if (docs) res.status(204).send();
        else res.status(404).json({error: 'Not found'})
      })
      .catch(err => next(err));
    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  // invalid object id
  if (error.name === 'CastError') return response.status(400).send({ error: 'malformatted id' });
  else if (error.name === 'ValidationError') return response.status(400).json({ error: error.message })
  next(error);
}
app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})