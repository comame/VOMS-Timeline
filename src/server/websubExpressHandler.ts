import crypto from 'crypto'
import { parse as parseXml, validate as validateXml } from 'fast-xml-parser'
import { dotenv } from './dotenv'
import { channels } from '../config/channels'

export function obtainVideoIdFromNotification(signature: string, body: string): string|undefined {
    console.log('Notification')

    if (validateXml(body) !== true) {
        const error = validateXml(body)
        console.error('XML syntax error', error)
        return
    }

    const hmacDigest = crypto.createHmac('sha1', dotenv.WEBSUB_HUB_SECRET).update(body).digest('hex')
    const requestedHmacDigest = signature?.slice('sha1='.length)

    if (hmacDigest != requestedHmacDigest) {
        console.error('Invalid digest')
        return
    }

    const subscribeObject = parseXml(body)
    const updatedVideoId = subscribeObject.feed?.entry?.['yt:videoId'] as string | undefined
    console.log('Update notification', updatedVideoId)
    return updatedVideoId
}

export function verifySubscription(mode: string, topic: string, leaseSeconds: number): boolean {
    if (mode == 'subscribe') {
        const acceptChannelIds = Object.entries(channels).map(it => it[1])
        const acceptTopics = acceptChannelIds.map(id =>
            ('https://www.youtube.com/xml/feeds/videos.xml?channel_id=' + id)
                .replace(/\?/g, '%3F')
                .replace(/\=/g, '%3D')
        )
        if (!acceptTopics.includes(topic)) {
            console.log('Denied WebSub Verification Request (mode: subscribe): invalid topic', topic)
            return false
        }

        if (Number.isNaN(leaseSeconds) || leaseSeconds < 432000 / 2) {
            console.log('Denied WebSub Verification Request (mode: subscribe): invalid leaseSeconds', leaseSeconds)
            return false
        }

        console.log('Accepted WebSub Verification Request (mode: subscribe)', topic)
        return true
    } else if (mode == 'unsubscribe') {
        console.log('Denied WebSub Verification Request (mode: unsubscribe)')
        return false
    } else if (mode == 'denied') {
        console.log('Accepted WebSub Verification Request (mode: denied)')
        return true
    }

    console.log('Denied invalid WebSub Verification Request')
    return false
}
