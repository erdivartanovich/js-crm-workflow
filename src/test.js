const ruleService = require('./Services/Workflow/RuleService')
const ob = require('./Services/CustomField/ObjectCustomFieldService')

const a = new ob()

let u ={
    id : 1
}

let cf = {
    id : 2
}

let o = {
    id : 2,
    tableName: 'persons'
}

a.getFieldValue(cf, o, u).then(r => console.log(r)).then(() => process.exit())

// const a = new ruleService()

// let z = {
//     id: 3,
//     parent_id: 2
// }

// a.getParentsFor(z).then(x => console.log(x)).then(() => process.exit())