'use strict'

const Bottle = require('bottlejs')
const bottle = new Bottle()

bottle.service('RuleService', require('./Services/Workflow/RuleService'))
bottle.service('ActionService', require('./Services/Action/ActionService'))
bottle.service('TaskService', require('./Services/Task/TaskService'))

bottle.service('WorkflowService', require('./Services/Workflow/WorkflowService'),
    'RuleService', 'ActionService', 'TaskService')

module.exports = bottle
