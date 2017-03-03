'use strict'

const knex = require('../connection')
const moment = require('moment')
const DATEFORMAT = 'YYYY-MM-DD HH:mm:ss'

const _ = require('lodash')

class BaseService {
    /**
     * Constructor
     */
     //set tablename to null, when extends need to intialize it with string value
     //softDelete flag is set to default = true
    constructor() {
        //set tablename to null, when extends need to intialize it with string value
        //softDelete flag is set to default = true
        this.tableName = null
        this.softDelete = true
        this.relationLists = []

        this.resetConditions()
    }

    where(field, operator, value) {
        this.whereClauses.push({field, operator, value})

        return this
    }

    getRelationLists() {
        return this.relationLists

    }

    having(table, have, map) {
        this.havingSegments.push({table, have, map})
    }

    join(tableName, relation, type) {
        if (typeof type === 'undefined') {
            type = ''
        }

        this.joinClauses.push({tableName, relation, type})

        return this
    }

    whereNotIn(field, values) {
        const operator = '!='
        _.map(values, (value) => {
            this.whereClauses.push({field, operator, value})
        })

        return this
    }

    resetWhere() {
        this.whereClauses = []

        return this
    }

    resetHaving() {
        this.havingSegments = []

        return this
    }

    resetJoin() {
        this.joinClauses = []

        return this
    }

    applyConditions(entities) {
        const tableName = this.tableName
        _.map(this.whereClauses, val => {
            entities.whereRaw(val.field + ' '  + val.operator + ' ?', [val.value])
        })

        _.map(this.joinClauses, val => {
            let jointing = true
            switch (val.type) {
            case '':
                entities.join(val.tableName, val.relation)
                break
            case 'left outer':
                entities.leftOuterJoin(val.tableName, val.relation)
                break
            case 'left':
                entities.leftJoin(val.tableName, val.relation)
            default:
                jointing = false
            }

            if (jointing) {
                entities.select(knex.raw(val.tableName + '.*'))
            }
        })

        _.map(this.havingSegments, val => {
            entities.join(val.map[1], function () {
                _.mapValues(val.have, id => {
                    this.on(val.map[2] + '_id', tableName + '.id')
                    this.on(val.map[2] + '_type', knex.raw(`'${tableName}'`))
                    this.on(val.map[1] + '.' + val.map[0], id)

                })
            })
        })

        if (this.joinClauses.length > 0) {
            entities.select(knex.raw(this.tableName + '.*'))
        }
    }

    resetConditions() {
        this.resetWhere()
            .resetJoin()
            .resetHaving()

        return this
    }

    applyCriteria(criteria) {
        return criteria.apply(this)
    }

    browse() {
        const entities = this.get()

        this.resetConditions()

        return entities
    }

    get() {
        const deletedColumn = 
            this.joinClauses.length > 0 ? this.tableName + '.deleted_at' : 'deleted_at'

        //delete from current table where deleted at = null
        const entities = knex(this.tableName)
            .where(deletedColumn, null)

        this.applyConditions(entities)

        return entities
    }

    read(id) {
        //select from current table where table.id=id
        return knex(this.tableName)
            .where('deleted_at', null)
            .where('id', id)
            .first()
    }

    edit(payload) {
        //add timestamp before edit to payload
        //update where table.id = payload.id
        this.beforeEdit(payload)
        return knex(this.tableName)
            .where('id', payload['id'])
            .update(payload)
    }

    add(payload) {
        //add timestamp before edit to payload
        //insert payload to current table
        this.beforeAdd(payload)
        return knex(this.tableName)
            .insert(payload)
    }

    delete(payload, isForced) {
        //create query delete
        //execute query
        const query =  knex(this.tableName).where('id', payload['id'])

        //if isForced and isSoftDelete then add deleted timestamp
        if ( ! isForced && this.softDelete) {
            return query.update({'deleted_at': this.getNow()})
        }
        return query.del()
    }

    forceDelete(payload) {
        return this.delete(payload, true)
    }

    beforeAdd(payload) {
        //add timestamp on before add
        if (! payload.created_at) {
            payload.created_at = this.getNow()
        }

        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }
    }

    beforeEdit(payload) {
        //add timestamp on before edit
        if (! payload.updated_at) {
            payload.updated_at = this.getNow()
        }

    }

    getNow() {
        //get current timestamp
        return (new moment).format(DATEFORMAT)
    }

    //method for ensure relation/ foreign key, it will process find-> if none -> add -> return newly added entityID
    findOrAddRelated(related_service, entity) {
        //ensure passed entity is valid object
        if (typeof entity != 'undefined' && typeof entity.id !== 'undefined') {
            //find entity in related_service
            return Promise.resolve(related_service.read(entity.id))
            .then(function(obj){
                //if get one then return the ID
                if (typeof obj != 'undefined') {
                    return Promise.resolve(obj.id)
                } else { //if none then add and return the ID
                    return Promise.resolve(related_service.add(entity).returning('id'))
                }
            })
        //if passed entity not valid, it means it has to be added and return the ID
        } else {
            return Promise.resolve(related_service.add(entity).returning('id'))
        }
    }

    readBy(field_name, value) {
        //select from current table where table.field_name=field_name
        return knex(this.tableName)
            .where('deleted_at', null)
            .where(field_name, value)
            .first()
    }

    paginate(limit, offset, select) {
        const deletedColumn = 
            this.joinClauses.length > 0 ? this.tableName + '.deleted_at' : 'deleted_at'

        const entities = knex(this.tableName)
            .where(deletedColumn, null)

        this.applyConditions(entities)

        return entities.limit(limit).offset(offset).select(select)
    }
}

module.exports = BaseService
