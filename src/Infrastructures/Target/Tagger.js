'use strict'

class Tagger {

    /**
     * @var $tagService
     */

    constructor(tagService) {
        this.tagService = tagService
    }

    attach(workflow, action, person, tag) {

        const tag_type = 'person'
        
        return Promise.resolve(
           this.tagService
            .getInstances([
                {
                    tag: tag
                }
            ]).then((tagObjs) => {
                return Promise.resolve(
                    this.tagService
                    .attach(person, workflow.user_id, tagObjs, tag_type)    
                ) 
            })

       )
    }

    detach(workflow, action, person, tag) {

        const tag_type = 'person'
        
        return Promise.resolve(
            this.tagService
            .getInstances([
                {
                    tag: tag
                }
            ]).then(tagObjs => {
                return Promise.resolve (
                    this
                    .tagService
                    .detach(person, workflow.user_id, tagObjs, tag_type)
                )
            })
        )
    }
}

module.exports = Tagger
