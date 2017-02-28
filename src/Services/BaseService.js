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

        this.resetWhere()
    }

    whereNotIn(field, values) {
        operator = '!='
        _.map(values, (value) => {
            this.whereClauses.push({field, operator, value})
        })

        return this        
    }

    resetWhere() {
        this.whereClauses = []
    }

    browse() {
        //delete from current table where deleted at = null
        const entity = knex(this.tableName)
            .where('deleted_at', null)

        _.map(this.whereClauses, (val) => {
            entity.whereRaw(val.field + ' ' + val.operator + ' ?', [val.value])
        })

        this.resetWhere()

        return entity
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
    
}

module.exports = BaseService

