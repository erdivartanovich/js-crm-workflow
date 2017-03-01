'use strict'

class Tagger {

    /**
     * @var $tagService
     */
    
    constructor(tagService) {
        this.tagService = tagService
    }


    attach(workflow, action, person, tag) {
        const tagObjs = this.tagService.getInstances([{'tag': tag}])
        return this.tagService.attach(person, workflow.getOwner(), tagObjs)
    }


    detach(workflow, action, person, tag) {
        const tagObjs = this.tagService.getInstances([{'tag': tag}])
        return this.tagService.detach(person, workflow.getOwner(), tagObjs)
    }
}

module.exports = Tagger