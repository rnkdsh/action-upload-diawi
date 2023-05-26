import * as core from '@actions/core'
import {uploadToDiawi} from './diawi'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {trimWhitespace: true})

    const file = core.getInput('file', {trimWhitespace: true})
    core.debug(`file: ${file}`)

    const password = core.getInput('password', {trimWhitespace: true})
    // core.debug(`password: ${password}`)

    const recipients = core.getInput('recipients', {trimWhitespace: true})
    core.debug(`recipients: ${recipients}`)

    const wallOfApps =
      core.getInput('wall_of_apps', {trimWhitespace: true}) === 'true'
    core.debug(`wallOfApps: ${wallOfApps}`)

    const findByUdid =
      core.getInput('find_by_udid', {trimWhitespace: true}) === 'true'
    core.debug(`findByUdid: ${findByUdid}`)

    const installationNotifications =
      core.getInput('installation_notifications', {trimWhitespace: true}) ===
      'true'
    core.debug(`installationNotifications: ${installationNotifications}`)

    const dryRun = core.getInput('dry-run', {trimWhitespace: true}) === 'true'
    core.debug(`dryRun: ${dryRun}`)

    const comment = core.getInput('comment', {trimWhitespace: true})
    core.debug(comment) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const {url, qrcode} = await uploadToDiawi({
      token,
      file,
      password,
      recipients,
      wallOfApps,
      findByUdid,
      installationNotifications,
      dryRun,
      comment
    })

    core.debug(`url: ${url}`)
    core.setOutput('url', url)
    core.debug(`qrcode: ${qrcode}`)
    core.setOutput('qrcode', qrcode)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
