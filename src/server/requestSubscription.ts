import { dotenv } from './dotenv'
import { fetch } from './fetch'
import { channels } from '../config/channels'

export async function requestSubscription(): Promise<boolean> {
    const bodyObjs = Object.entries(channels).map(it => it[1]).map(channelId => ({
        'hub.callback': `https://voms-timeline.comame.xyz/sub/hook?verify_token=${dotenv.WEBSUB_VERIFY_TOKEN}`,
        'hub.verify': 'sync',
        'hub.mode': 'subscribe',
        'hub.secret': dotenv.WEBSUB_HUB_SECRET,
        'hub.topic': `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`
    }))
    const bodyEncodeds = bodyObjs.map(obj => {
        return Object.entries(obj).map(([ key, value ]) => {
            return key + '=' + encodeURIComponent(value)
        }).join('&')
    })

    const requestPromises = bodyEncodeds.map(body => fetch('https://pubsubhubbub.appspot.com/subscribe', {
        method: 'POST',
        body,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': '' + body.length,
            'user-agent': 'comame<dev@comame.xyz>'
        }
    }))

    const responses = await Promise.all(requestPromises)
    return responses.every(it => it.ok)
}
