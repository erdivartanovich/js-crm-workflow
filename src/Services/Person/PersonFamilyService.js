'use strict'

const knex = require('../../connection')
const BaseService = require('../BaseService')

/**
 * Family types.
 */
const RELATIVE_TYPE_FATHER = 1
const RELATIVE_TYPE_MOTHER = 2
const RELATIVE_TYPE_SON = 3
const RELATIVE_TYPE_DAUGHTER = 4
const RELATIVE_TYPE_BROTHER = 5
const RELATIVE_TYPE_SISTER = 6
const RELATIVE_TYPE_SPOUSE = 7

const RELATIVE_TYPE_SIBLING = 8
const RELATIVE_TYPE_PARENT = 9
const RELATIVE_TYPE_CHILD = 10
const RELATIVE_TYPE_SIBLING_OF_PARENT = 11
const RELATIVE_TYPE_CHILD_OF_SIBLING = 12
const RELATIVE_TYPE_COUSIN = 13
const RELATIVE_TYPE_GRANDPARENT = 14
const RELATIVE_TYPE_GRANDCHILD = 15
const RELATIVE_TYPE_STEP_SIBLING = 16
const RELATIVE_TYPE_STEP_PARENT = 17
const RELATIVE_TYPE_STEP_CHILD = 18
const RELATIVE_TYPE_SIBLING_IN_LAW = 19
const RELATIVE_TYPE_PARENT_IN_LAW = 20
const RELATIVE_TYPE_CHILD_IN_LAW = 21
const RELATIVE_TYPE_OTHER = 99

const RELATIVE_OPPOSITE_MAP = {}

RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_SPOUSE] = RELATIVE_TYPE_SPOUSE,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_SIBLING] = [RELATIVE_TYPE_SIBLING,
    RELATIVE_TYPE_BROTHER,
    RELATIVE_TYPE_SISTER,],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_MOTHER] = [RELATIVE_TYPE_CHILD,
    RELATIVE_TYPE_DAUGHTER,
    RELATIVE_TYPE_SON, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_FATHER] = [RELATIVE_TYPE_CHILD,
    RELATIVE_TYPE_DAUGHTER,
    RELATIVE_TYPE_SON, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_DAUGHTER] = [RELATIVE_TYPE_PARENT,
    RELATIVE_TYPE_FATHER,
    RELATIVE_TYPE_MOTHER, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_SON] = [RELATIVE_TYPE_PARENT,
    RELATIVE_TYPE_FATHER,
    RELATIVE_TYPE_MOTHER, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_SISTER] = [RELATIVE_TYPE_SIBLING,
    RELATIVE_TYPE_BROTHER,
    RELATIVE_TYPE_SISTER, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_BROTHER] = [RELATIVE_TYPE_SIBLING,
    RELATIVE_TYPE_BROTHER,
    RELATIVE_TYPE_SISTER, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_PARENT] = [RELATIVE_TYPE_CHILD,
    RELATIVE_TYPE_DAUGHTER,
    RELATIVE_TYPE_SON, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_CHILD] = [RELATIVE_TYPE_PARENT,
    RELATIVE_TYPE_FATHER,
    RELATIVE_TYPE_MOTHER, ],
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_SIBLING_OF_PARENT] = RELATIVE_TYPE_CHILD_OF_SIBLING,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_CHILD_OF_SIBLING] = RELATIVE_TYPE_SIBLING_OF_PARENT,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_COUSIN] = RELATIVE_TYPE_COUSIN,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_GRANDPARENT] = RELATIVE_TYPE_GRANDCHILD,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_GRANDCHILD] = RELATIVE_TYPE_GRANDPARENT,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_STEP_SIBLING] = RELATIVE_TYPE_STEP_SIBLING,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_STEP_PARENT] = RELATIVE_TYPE_STEP_CHILD,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_STEP_CHILD] = RELATIVE_TYPE_STEP_PARENT,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_SIBLING_IN_LAW] = RELATIVE_TYPE_SIBLING_IN_LAW,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_PARENT_IN_LAW] = RELATIVE_TYPE_CHILD_IN_LAW,
RELATIVE_OPPOSITE_MAP[RELATIVE_TYPE_CHILD_IN_LAW] = RELATIVE_TYPE_PARENT_IN_LAW

class PersonFamilyService extends BaseService {
    
    /**
     * Constructor
     */
    constructor() {
        super()
        //set the table name
        this.tableName = 'person_family'
    }

    oppositeFamilyRelation(family) {
        const oppositeType = this.getOppositeRelativeType(family['relative_type'])
        const oppositeFamily = {}
        oppositeFamily['relative_type'] = oppositeType
        oppositeFamily['label'] =  family['label']
        oppositeFamily['person_id'] = family['related_to']
        oppositeFamily['related_to'] = family['person_id']
        return oppositeFamily
    }

    getOppositeRelativeType(familyRelativeType, all=false) {
        const oppositeFamilyType = RELATIVE_OPPOSITE_MAP[familyRelativeType]
        if (all) {
            if (oppositeFamilyType instanceof Array) {
                return oppositeFamilyType[0]
            }
        }
        return oppositeFamilyType
    }

    createRelatedFamily(family) {
        const oppositeFamily = this.oppositeFamilyRelation(family)
        return this.add(oppositeFamily)
    }

    updateRelatedFamily(family) {
        const old_family = this.read(family.id)
        var relatedFamily = null
        const oppositeTypes = this.getOppositeRelativeType(old_family['relative_type'], true)
        relatedFamily = Promise.resolve(knex(this.tableName)
            .where({
                deleted_at: null,
                person_id: old_family.related_to,
                related_to: old_family.person_id
            })
            .whereIn('relative_type', oppositeTypes)
            .first())
        const oppositeFamily = this.oppositeFamilyRelation(family)
        if (typeof relatedFamily === 'undefined') {
            //don't have relation yet
            return this.add(oppositeFamily)
        }
        relatedFamily['relative_type'] = oppositeFamily['relative_type']
        relatedFamily['label'] = oppositeFamily['label']
        relatedFamily['person_id'] = oppositeFamily['person_id']
        relatedFamily['related_to'] = oppositeFamily['related_to']
        return this.edit(relatedFamily)
    }

    deleteRelatedFamily(family) {
        const oppositeTypes = this.getOppositeRelativeType(family['relative_type'], true)
        return Promise.resolve(knex(this.tableName)
            .where({
                person_id: family['related_to'],
                related_to: family['person_id'],
            })
            .wherein('relative_type', oppositeTypes)    
            .del()    
        )
    }

}

module.exports = PersonFamilyService