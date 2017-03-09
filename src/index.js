'use strict'

const ActionCommand = require('./Jobs/Action/ActionCommand')

const program = require('commander')
const actionCommand = new ActionCommand()

program
    .option('-w, --workflow =<n>', 'Workflow id')
    .option('-a, --action <n>', 'Action id')
    .option('-o, --runnable-once', 'Runnable once')
    .on('--help', () => {
        console.log('  Examples:')
        console.log()
        console.log('    $ index -w workflow_id -a action_id')
        console.log()
    })
    .parse(process.argv)

actionCommand.handle(program.workflow, program.action, typeof program.runnableOnce == 'undefined' ? false : program.runnableOnce)

if (!process.argv.slice(2).length) {
    program.help()
}
