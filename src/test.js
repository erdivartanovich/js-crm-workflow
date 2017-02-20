const PersonEmailService = require('./Services/Person/PersonEmailService.js')


const PES = new PersonEmailService
let person = {
  id: '8'
}

PES.read(person)
    .then((result) => console.log(result))
