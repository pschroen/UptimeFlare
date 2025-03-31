import { AwsClient } from 'aws4fetch'

async function getWorkerLocation() {
  const res = await fetch('https://cloudflare.com/cdn-cgi/trace')
  const text = await res.text()

  const colo = /^colo=(.*)$/m.exec(text)?.[1]
  return colo
}

const fetchTimeout = (
  url: string,
  ms: number,
  { signal, ...options }: RequestInit<RequestInitCfProperties> | undefined = {}
): Promise<Response> => {
  const controller = new AbortController()
  const promise = fetch(url, { signal: controller.signal, ...options })
  if (signal) signal.addEventListener('abort', () => controller.abort())
  const timeout = setTimeout(() => controller.abort(), ms)
  return promise.finally(() => clearTimeout(timeout))
}

function withTimeout<T>(millis: number, promise: Promise<T>): Promise<T> {
  const timeout = new Promise<T>((resolve, reject) =>
    setTimeout(() => reject(new Error(`Promise timed out after ${millis}ms`)), millis)
  )

  return Promise.race([promise, timeout])
}

function formatStatusChangeNotification(
  monitor: any,
  isUp: boolean,
  timeIncidentStart: number,
  timeNow: number,
  reason: string,
  timeZone: string
) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timeZone,
  })

  let downtimeDuration = Math.round((timeNow - timeIncidentStart) / 60);
  const timeNowFormatted = dateFormatter.format(new Date(timeNow * 1000))
  const timeIncidentStartFormatted = dateFormatter.format(new Date(timeIncidentStart * 1000))

  if (isUp) {
    return {
      title: `✅ ${monitor.name} is up!`,
      body: `The service is up again after being down for ${downtimeDuration} minutes.`,
    }
  } else if (timeNow == timeIncidentStart) {
    return {
      title: `🔴 ${monitor.name} is currently down.`,
      body: `Service is unavailable at ${timeNowFormatted}. Issue: ${reason || 'unspecified'}`,
    }
  } else {
    return {
      title: `🔴 ${monitor.name} is still down.`,
      body: `Service is unavailable since ${timeIncidentStartFormatted} (${downtimeDuration} minutes). Issue: ${reason || 'unspecified'}`,
    }
  }
}

async function notifyWithApprise(
  appriseApiServer: string,
  recipientUrl: string,
  title: string,
  body: string
) {
  console.log('Sending Apprise notification: ' + title + '-' + body + ' to ' + recipientUrl + ' via ' + appriseApiServer)
  try {
    const resp = await fetchTimeout(appriseApiServer, 5000, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: recipientUrl,
        title,
        body,
        type: 'warning',
        format: 'text'
      }),
    })

    if (!resp.ok) {
      console.log('Error calling apprise server, code: ' + resp.status + ', response: ' + await resp.text())
    } else {
      console.log('Apprise notification sent successfully, code: ' + resp.status)
    }
  } catch (e) {
    console.log('Error calling apprise server: ' + e)
  }
}

// https://www.daniel-mitchell.com/blog/send-email-with-aws-ses-in-a-cloudflare-workers/
async function sendEmail(
  accessKeyId: string,
  secretAccessKey: string,
  recipientEmail: string,
  title: string,
  body: string
) {
  const aws = new AwsClient({ accessKeyId, secretAccessKey });
  const resp = await aws.fetch('https://email.us-east-1.amazonaws.com/v2/email/outbound-emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Destination: {
        ToAddresses: [recipientEmail],
      },
      FromEmailAddress: 'alert@cyberspace.app',
      Content: {
        Simple: {
          Subject: {
            Data: title
          },
          Body: {
            Text: {
              Data: body
            }
          }
        },
      },
    }),
  })

  const respText = await resp.json()
  console.log(resp.status + ' ' + resp.statusText)
  console.log(respText)
  if (resp.status != 200 && resp.status != 201) {
    throw new Error('Error sending email: ' + resp.status + ' ' + resp.statusText + ' ' + respText)
  }
  return resp.status
}

export { getWorkerLocation, fetchTimeout, withTimeout, notifyWithApprise, sendEmail, formatStatusChangeNotification }
