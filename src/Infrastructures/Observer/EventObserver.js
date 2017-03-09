'use strict'

class EventObserver {
    constructor() {
        this.events = {}
        this.states = {}
    }

    on(name, callback) {
        if (!this.events[name]) {
            this.events[name] = []
        }

        this.events[name].push(callback)

        return this
    }

    emit(name) {
        if (this.events[name]) {
            this.events[name].map(event => event(this.states))
        }
    }

    run(callback) {
        callback(this.states)
    }
}

module.exports = EventObserver