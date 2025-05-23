const pageConfig = {
  // Title for your status page
  title: "pschroen's Status Page",
  // Links shown at the header of your status page, could set `highlight` to `true`
  links: [
    { link: 'https://github.com/pschroen', label: 'GitHub' },
    { link: 'https://alienkitty.com/', label: 'Website' },
    { link: 'mailto:hello@alienkitty.com', label: 'Email', highlight: true },
  ],
  // [OPTIONAL] Group your monitors
  // If not specified, all monitors will be shown in a single list
  // If specified, monitors will be grouped and ordered, not-listed monitors will be invisble (but still monitored)
  group: {
    "Public": ['alienkitty'],
    // "Private": ['test_tcp_monitor'],
  },
}

const workerConfig = {
  // Write KV at most every 3 minutes unless the status changed
  kvWriteCooldownMinutes: 3,
  // Enable HTTP Basic auth for status page & API by uncommenting the line below, format `<USERNAME>:<PASSWORD>`
  // passwordProtection: 'username:password',
  // Define all your monitors here
  monitors: [
    {
      // `id` should be unique, history will be kept if the `id` remains constant
      id: 'alienkitty',
      // `name` is used at status page and callback message
      name: 'Alien Kitty',
      // `method` should be a valid HTTP Method
      method: 'GET',
      // `target` is a valid URL
      target: 'https://alienkitty.com/',
      // [OPTIONAL] `tooltip` is ONLY used at status page to show a tooltip
      // tooltip: 'This is a tooltip for this monitor',
      // [OPTIONAL] `statusPageLink` is ONLY used for clickable link at status page
      statusPageLink: 'https://alienkitty.com/',
      // [OPTIONAL] `hideLatencyChart` will hide status page latency chart if set to true
      // hideLatencyChart: false,
      // [OPTIONAL] `expectedCodes` is an array of acceptable HTTP response codes, if not specified, default to 2xx
      // expectedCodes: [200],
      // [OPTIONAL] `timeout` in millisecond, if not specified, default to 10000
      // timeout: 10000,
      // [OPTIONAL] headers to be sent
      /* headers: {
        'User-Agent': 'Uptimeflare',
        Authorization: 'Bearer YOUR_TOKEN_HERE',
      }, */
      // [OPTIONAL] body to be sent
      // body: 'Hello, world!',
      // [OPTIONAL] if specified, the response must contains the keyword to be considered as operational.
      responseKeyword: '<title>Alien Kitty</title>',
      // [OPTIONAL] if specified, the response must NOT contains the keyword to be considered as operational.
      // responseForbiddenKeyword: 'bad gateway',
      // [OPTIONAL] if specified, the check will run in your specified region,
      // refer to docs https://github.com/pschroen/UptimeFlare/wiki/Geo-specific-checks-setup before setting this value
      // checkLocationWorkerRoute: 'https://xxx.example.com',
    },
    // Example TCP Monitor
    /* {
      id: 'test_tcp_monitor',
      name: 'Example TCP Monitor',
      // `method` should be `TCP_PING` for tcp monitors
      method: 'TCP_PING',
      // `target` should be `host:port` for tcp monitors
      target: '1.2.3.4:22',
      tooltip: 'My production server SSH',
      statusPageLink: 'https://example.com',
      timeout: 5000,
    }, */
  ],
  notification: {
    // [Optional] apprise API server URL
    // if not specified, no notification will be sent
    // appriseApiServer: "https://apprise.example.com/notify",
    // [Optional] recipient URL for apprise, refer to https://github.com/caronc/apprise
    // if not specified, no notification will be sent
    // recipientUrl: "tgram://bottoken/ChatID",
    // [Optional] recipient email for AWS SES, refer to https://www.daniel-mitchell.com/blog/send-email-with-aws-ses-in-a-cloudflare-workers/
    recipientEmail: 'patrick@alienkitty.com',
    // [Optional] timezone used in notification messages, default to "Etc/GMT"
    // timeZone: "Asia/Shanghai",
    // [Optional] grace period in minutes before sending a notification
    // notification will be sent only if the monitor is down for N continuous checks after the initial failure
    // if not specified, notification will be sent immediately
    // gracePeriod: 5,
  },
  callbacks: {
    onStatusChange: async (
      env: any,
      monitor: any,
      isUp: boolean,
      timeIncidentStart: number,
      timeNow: number,
      reason: string
    ) => {
      // This callback will be called when there's a status change for any monitor
      // Write any Typescript code here

      // This will not follow the grace period settings and will be called immediately when the status changes
      // You need to handle the grace period manually if you want to implement it
    },
    onIncident: async (
      env: any,
      monitor: any,
      timeIncidentStart: number,
      timeNow: number,
      reason: string
    ) => {
      // This callback will be called EVERY 1 MINTUE if there's an on-going incident for any monitor
      // Write any Typescript code here
    },
  },
}

// Don't forget this, otherwise compilation fails.
export { pageConfig, workerConfig }
