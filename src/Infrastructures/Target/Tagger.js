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
                console.log('tagger send this to attach ===>', tagObjs)
                return Promise.resolve(
                    this.tagService
                    .attach(person, workflow.user_id, tagObjs, tag_type)    
                ) 
            })

       )
    }

    detach(workflow, person, tag, tag_type) {
        return Promise.resolve(
            this.tagService
            .getInstances([
                {
                    id: tag.id,
                    tag: tag.tag
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
