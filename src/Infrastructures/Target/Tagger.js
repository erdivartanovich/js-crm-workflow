'use strict'

class Tagger {

    /**
     * @var $tagService
     */

    constructor(tagService) {
        this.tagService = tagService
    }

    attach(workflow, person, tag, tag_type) {
        this.tagService
            .getInstances([
                {
                    'tag': tag
                }
            ]).then(tagObjs => {
                return this.tagService
                    .attach(person, workflow.user_id, tagObjs, tag_type)
            })
    }

    detach(workflow, person, tag, tag_type) {
        const tagObjs = this
            .tagService
            .getInstances([
                {
                    'tag': tag
                }
            ])
        return this
            .tagService
            .detach(person, workflow.user_id, tagObjs, tag_type)
    }
}

module.exports = Tagger