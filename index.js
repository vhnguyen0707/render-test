const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // allows server to indicate which origins are allowed to access its resources
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'))

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

let phoneBook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
    res.json(phoneBook);
})

app.post('/api/persons', (req, res) => {
    const person = req.body;
    if (!person.name || !person.number) return res.status(400).json({ error: 'Missing name or number' });
    if (phoneBook.find(entry => entry.name === person.name)) return res.status(400).json({ error: 'This person is already added' });
    const newPerson = {
        name: person.name,
        number: person.number,
        id: Math.floor(Math.random() * 10) + phoneBook.length
    }
    phoneBook = phoneBook.concat(newPerson);
    res.json(newPerson);
})
app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${phoneBook.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id);
    const person = phoneBook.find(person => person.id === id);
    if (person) res.json(person);
    else res.status(404).end();
})

app.delete('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id);
    phoneBook = phoneBook.filter(person => person.id !== id);
    res.status(204).end();
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})