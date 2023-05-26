import {existsSync, createReadStream} from 'node:fs'
import axios from 'axios'
import FormData from 'form-data'

type UploadArgs = {
  token: string
  file: string
  password: string
  recipients: string
  wallOfApps: boolean
  findByUdid: boolean
  installationNotifications: boolean
  dryRun: boolean
  comment: string
}

type DiawiOutput = {
  url: string
  qrcode: string
}

const UPLOAD_URL = 'https://upload.diawi.com'
const POLL_MAX_COUNT = 10
const POLL_INTERVAL = 2

export async function uploadToDiawi(args: UploadArgs): Promise<DiawiOutput> {
  if (!existsSync(args.file)) {
    throw new Error(`Could not find file at ${args.file}`)
  }

  const file = createReadStream(args.file)

  const data = new FormData()
  data.append('token', args.token)
  data.append('file', file)
  data.append('password', args.password)
  data.append('callback_emails', args.recipients)
  data.append('wall_of_apps', args.wallOfApps ? '1' : '0')
  data.append('find_by_udid', args.findByUdid ? '1' : '0')
  data.append(
    'installation_notifications',
    args.installationNotifications ? '1' : '0'
  )
  data.append('comment', args.comment)

  const response = await axios.post(UPLOAD_URL, data, {
    headers: {'Content-Type': 'multipart/form-data'},
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })
  const job = response.data.job
  return pollUploadStatus(job, args.token)
}

async function pollUploadStatus(
  job: string,
  token: string
): Promise<DiawiOutput> {
  let pollCount = 0

  while (pollCount < POLL_MAX_COUNT) {
    const response = await axios.get(
      `${UPLOAD_URL}/status?job=${job}&token=${token}`
    )
    switch (response.data.status) {
      case 2000:
        if (response.data.link) {
          return {
            url: response.data.link,
            qrcode: response.data.qrcode
          }
        } else {
          throw new Error('Failed to get link from success response')
        }
      case 2001:
        // Nothing, this just means poll again
        break
      default:
        throw new Error(`Error in status response - ${response.data.message}`)
    }

    await sleep(POLL_INTERVAL)
    pollCount++
  }

  throw new Error('Timed out polling for job completion')
}

const sleep = async (seconds: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000)
  })
}
