const dotenv = require('dotenv').config()

class Observer
{
    constructor(key) {
        this.value = process.env[key]
    }

    whenEmpty(defaultValue) {
        return (typeof this.value == "undefined" ) ? defaultValue : this.value;
    }
}

class Envloader
{
    _makeObserver(key) {
        return new Observer(key)
    }

    get(key) {
        return this._makeObserver(key)
    }
}

module.exports = new Envloader
