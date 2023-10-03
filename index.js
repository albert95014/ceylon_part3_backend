require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(cors())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(requestLogger)

morgan.token('person', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

let persons = [
    // { 
    //   "id": 1,
    //   "name": "Arto Hellas", 
    //   "number": "040-123456"
    // },
    // { 
    //   "id": 2,
    //   "name": "Ada Lovelace", 
    //   "number": "39-44-5323523"
    // },
    // { 
    //   "id": 3,
    //   "name": "Dan Abramov", 
    //   "number": "432432432432"
    // }
]

// if (process.argv.length > 3) {
//   const person = new Person({
//       name: process.argv[3],
//       number: process.argv[4],
//   })

//   person.save().then(result => {
//       console.log(`Added ${process.argv[3]} to the phonebook!`)
//       console.log(process.argv.length)
//       mongoose.connection.close()
//   })
// } else {
//   Person.find({}).then(result => {
//       console.log("phonebook:")
//       result.forEach(person => {
//           console.log(`${person.name} ${person.number}`)
//       })
//       mongoose.connection.close()
//   })
// }

app.get('/', (request, response) => {
  response.send('<h1>Welcome to the database of persons!</h1>')
})

app.get('/api/persons', (request, response) => {
  console.log("Got Item!")
  // response.json(persons)

  Person.find({}).then(people => {
    console.log("phonebook:")
    response.json(people)
    people.forEach(person => {
        console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id) //Number used to convert the id from a string to num
  const person = persons.findById(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.get('/info', (request, response) => {
  const numPersons = persons.length
  const hey = new Date()

  response.send(`<p>Phonebook has info for ${numPersons} people</p><p>${hey}</p>`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })
  person.id = Math.floor(Math.random()*1000000)

  if (persons.map(person => person.name).includes(person.name)) {
    return response.status(400).json({ 
      error: 'name must be unique!'  
    })
  } else if (!person.name) {
    return response.status(400).json({
      error: 'name field is empty!'
    })
  } else {
    // persons = persons.concat(person)
    person.save().then(savedPerson => {
      // persons = persons.concat(savedPerson)
      response.json(savedPerson)
    })
  }
})

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


// morgan.token('type', function (req, res) { return req.headers['content-type'], 
//                                                   req.method['method'],
//                                                   req.url['url'],
//                                                   req.status['status']
//                                                   req.})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})