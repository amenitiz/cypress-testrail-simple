#!/usr/bin/env node

// @ts-check

const arg = require('arg')
const debug = require('debug')('cypress-testrail-simple')
const got = require('got')
const { getTestRailConfig, getAuthorization } = require('../src/get-config')

const args = arg(
    {
        '--planId': String,
        '--runId': String,
        // aliases
        '-p': '--planId',
        '-r': '--runId',
    },
    { permissive: true },
)
// optional arguments
const planId = args['--planId'] || args._[0]
const runId = args['--runId'] || args._[1]
debug('args: %o', args)
debug('run name: %s', planId)
debug('run description: %s', runId)

async function addRunToPlan({ testRailInfo, planId, runId }) {
    // only output the run ID to the STDOUT, everything else is logged to the STDERR

    const addPlanEntryUrl = `${testRailInfo.host}/index.php?/api/v2/add_plan_entry/${planId}`
    //const addRunToPlanUrl = `${testRailInfo.host}/index.php?/api/v2/add_run_to_plan_entry/${planId}/${runId}`
    //debug('add run to plan url: %s', addRunToPlanUrl)
    const authorization = getAuthorization(testRailInfo)

    const json = {
        //config_ids: [1, testRailInfo.suiteId],
        suite_id: testRailInfo.suiteId
    }
    debug('add run to plan params %o', json)

    // @ts-ignore
    return got(addPlanEntryUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization,
        },
        json,
    })
        .json()
        .then(
            (json) => {
                debug('response from the add_run_to_plan')
                debug('%o', json)
            },
            (error) => {
                console.error('Could not add TestRail run to Test Plan')
                console.error('Response: %s', error.name)
                console.error('Response: %s', error.error)
                console.error('Please check your TestRail configuration')
                process.exit(1)
            },
        )
}

const testRailInfo = getTestRailConfig()
// start a new test run for all test cases
// @ts-ignore
addRunToPlan({ testRailInfo, planId, runId })

