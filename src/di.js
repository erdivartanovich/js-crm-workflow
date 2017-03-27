'use strict'

const BottleJS = require('bottlejs')

let bottle

if (typeof bottle == 'undefined') {
    bottle = new BottleJS()
    bottle.service('RuleService', require('./Services/Workflow/RuleService'))
    bottle.service('ActionService', require('./Services/Action/ActionService'))
    bottle.service('TaskService', require('./Services/Task/TaskService'))
    bottle.service('LogService', require('./Services/Workflow/LogService'), 'WorkflowService')

    bottle.service('WorkflowService', require('./Services/Workflow/WorkflowService'),
        'RuleService', 'ActionService', 'TaskService')

    bottle.service('UserService', require('./Services/User/UserService'))
    bottle.service('StageService', require('./Services/Stage/StageService'))
    bottle.service('LeadTypeService', require('./Services/Person/LeadTypeService'))
    bottle.service('PersonProfessionService', require('./Services/Person/PersonProfessionService'))
    bottle.service('CompanyService', require('./Services/Company/CompanyService'))

    bottle.service('PersonService', require('./Services/Person/PersonService'),
        'UserService', 'StageService', 'LeadTypeService', 'PersonProfessionService', 'CompanyService')

    bottle.service('InteractionService', require('./Services/Interaction/InteractionService'))
    bottle.service('PhoneService', require('./Services/Person/PersonPhoneService'))
    bottle.service('TemplateService', require('./Services/CommunicationTemplate/CommunicationTemplateService'))

    bottle.service('SMS', require('./Infrastructures/Target/Sms'),
        'InteractionService', 'PhoneService', 'TemplateService')

    bottle.service('TagService', require('./Services/Tags/TagService'))
    bottle.service('Tagger', require('./Infrastructures/Target/Tagger'), 'TagService')


    bottle.service('PersonMotivation', require('./Services/Person/PersonMotivationService'))
    bottle.service('PersonScore', require('./Services/Person/PersonScoreService'))

    bottle.service('PersonCrawlService', require('./Services/Person/PersonCrawlService'))
    bottle.service('SocialAppend', require('./Infrastructures/Target/SocialAppend'), 'PersonCrawlService')
}


module.exports = bottle