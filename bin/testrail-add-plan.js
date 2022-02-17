#!/usr/bin/env node

// @ts-check

const arg = require('arg')
const debug = require('debug')('cypress-testrail-simple')
const got = require('got')
const globby = require('globby')
const { getTestRailConfig, getAuthorization } = require('../src/get-config')
const { getTestSuite } = require('../src/testrail-api')

const args = arg(
  {
    '--planName': String,
    // aliases
    '-n': '--planName',
  },
  { permissive: true },
)
// optional arguments
const planName = args['--planName'] || args._[0]
debug('plan name: %s', planName)

async function addTestPlan({
  testRailInfo, planName
}) {
  console.error(
    'creating new TestRail plan for project %s',
    testRailInfo.projectId,
  )

  const addTestPlanUrl = `${testRailInfo.host}index.php?/api/v2/add_plan/${testRailInfo.project_id}`
  debug('add test plan url: %s', addTestPlanUrl)
  const authorization = getAuthorization(testRailInfo)

  const json = {
    name: planName,
  }
  debug('add plan params %o', json)
  // @ts-ignore
  return got(addTestPlanUrl, {
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
        debug('response from the add_plan')
        debug('%o', json)
        console.log(json.id)
      },
      (error) => {
        console.error('Could not create a new TestRail run')
        console.error('Response: %s', error.name)
        console.error('Please check your TestRail configuration')
        process.exit(1)
      },
    )
}
const testRailInfo = getTestRailConfig()
  // start a new test run for all test cases
  // @ts-ignore
addTestPlan({ testRailInfo, planName })
