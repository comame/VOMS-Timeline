import { Video } from '../API/YouTubeApiOptions/VideosAPIOptions'
import crypto from 'crypto'
import { parse as parseXml, validate as validateXml } from 'fast-xml-parser'
import { Request, Response } from 'express'
import { dotenv } from './dotenv'
import { channels } from '../config/channels'

export async function websubExpressHandler(req: Request, res: Response): Promise<Video['id']|undefined> {
    const queryObj = Object.fromEntries(req.originalUrl.split('?')[1]?.split('&').map(it => it.split('=')) ?? [])

    const logRequest = async ( { queryObj, subscribeObject, result, rawBody = '', reason = '' }: {
        queryObj?: object,
        subscribeObject?: object,
        result: number,
        rawBody?: string,
        reason?: string
    }) => {
        console.log({
            url: req.originalUrl,
            query: Object.fromEntries(Object.entries(queryObj ?? {}).map(it => {
                return [ (it[0] as string).replace(/\./g, '_'), it[1] ]
            })),
            method: req.method,
            body: subscribeObject,
            headers: req.headers,
            result,
            rawBody,
            reason
        })
    }

    if (queryObj['hub.mode'] == 'subscribe') {
        const acceptChannelIds = Object.entries(channels).map(it => it[1])
        const acceptTopics = acceptChannelIds.map(id =>
            ('https://www.youtube.com/xml/feeds/videos.xml?channel_id=' + id)
                .replace(/\?/g, '%3F')
                .replace(/\=/g, '%3D')
        )

        if (!acceptTopics.includes(queryObj['hub.topic'])) {
            res.sendStatus(404)
            await logRequest({ queryObj, result: 404, reason: 'invalid_hub.topic' })
            return
        }

        const verifyToken = dotenv.WEBSUB_VERIFY_TOKEN
        if (queryObj['verify_token'] != verifyToken) {
            res.sendStatus(404)
            await logRequest({ queryObj, result: 404, reason: 'invalid_verify_token' })
            return
        }

        const challenge = queryObj['hub.challenge']
        res.send(challenge)
        await logRequest({ queryObj, result: 200 })
        return
    } else if (queryObj['hub.mode'] == 'unsubscribe') {
        res.sendStatus(404)
        await logRequest({ queryObj, result: 404, reason: 'unsubscribe_forbidden' })
        return
    } else if (queryObj['hub.mode'] == 'denied') {
        res.send()
        await logRequest({ queryObj, result: 200 })
        return
    }

    if (validateXml(req.body) !== true) {
        const error = validateXml(req.body)
        console.error('VALIDATE ERROR', error)
        res.status(500).send('error')
        await logRequest({ result: 500, rawBody: req.body, reason: 'invalid_xml' })
        return
    }

    const hmacKey = dotenv.WEBSUB_HUB_SECRET
    const hmacDigest = crypto.createHmac('sha1', hmacKey).update(req.body).digest('hex')
    const requestedHmacDigest = req.header('x-hub-signature')?.slice('sha1='.length)

    if (hmacDigest != requestedHmacDigest) {
        console.error('Invalid digest request', 'wants: ' + hmacDigest, 'got: ' + requestedHmacDigest)
        res.send('ok')
        await logRequest({ result: 200, rawBody: req.body, reason: 'invalid_digest' })
        return
    }

    const verifyToken = dotenv.WEBSUB_VERIFY_TOKEN
    if (queryObj['verify_token'] != verifyToken) {
        res.send('ok')
        await logRequest({ result: 200, rawBody: req.body, reason: 'invalid_verify_token'})
    }

    res.send('ok')

    const subscribeObject = parseXml(req.body)
    const updatedVideoId = subscribeObject.feed?.entry?.['yt:videoId'] as string | undefined

    await logRequest({ subscribeObject, result: 200, rawBody: req.body })

    return updatedVideoId
}
