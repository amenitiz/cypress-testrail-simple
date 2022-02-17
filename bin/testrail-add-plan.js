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
    '--name': String,
    '--nameRun': String,
    '--suite': String,
    // aliases
    '-n': '--name',
    '-st': '--suite',
    '-nr': '--nameRun',
  },
  { permissive: true },
)
// optional arguments
const name = args['--name'] || args._[0]
const nameRun = args['--nameRun'] || args._[1]
debug('args: %o', args)
debug('plan name: %s', name)
debug('run name: %s', nameRun)

async function addTestPlan({
  testRailInfo, name, nameRun
}) {
  console.error(
    'creating new TestRail plan for project %s',
    testRailInfo.projectId,
  )

  const addTestPlanUrl = `${testRailInfo.host}index.php?/api/v2/add_plan/${testRailInfo.project_id}`
  debug('add test plan url: %s', addTestPlanUrl)
  const authorization = getAuthorization(testRailInfo)

  const json = {
    name,
    entries: [
      {
        suite_id: testRailInfo.suiteId,
        name: nameRun,
      },
    ],
  }

  debug('add plan params %o', json)

  let suiteId = testRailInfo.suiteId
  if (suiteId) {
    // let the user pass the suite ID like the TestRail shows it "S..."
    // or just the number
    if (suiteId.startsWith('S')) {
      suiteId = suiteId.substring(1)
    }
    json.suite_id = Number(suiteId)
    debug('suite id %d', json.suite_id)
    // simply print all test cases
    await getTestSuite(suiteId, testRailInfo)
  }
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
        debug('response from the add_run')
        debug('%o', json)
        console.log(json.id)
      },
      (error) => {
        console.error('Could not create a new TestRail run')
        console.error('Response: %s', error.name)
        console.error('Please check your TestRail configuration')
        if (json.case_ids) {
          console.error('and the case IDs: %s', json.case_ids)
        }
        process.exit(1)
      },
    )
}
const testRailInfo = getTestRailConfig()
  // start a new test run for all test cases
  // @ts-ignore
addTestPlan({ testRailInfo, name, nameRun })
