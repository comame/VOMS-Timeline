import path from 'path'
import express, { Response } from 'express'
import { obtainVideoIdFromNotification, verifySubscription } from './websubExpressHandler'
import { fetchVideo, searchVideos } from './fetchVideo'
import { cacheResponse, getCached, deleteCaches } from './cache'
import { VideosResponse } from '../API/selfApiOptions/options'
import { requestSubscription } from './requestSubscription'

const app = express()

// Parse body as string
app.use((req, _res, next) => {
    let bodyText = ''
    req.on('data', (chunk: Buffer|string) => {
        if (typeof chunk == 'string') {
            bodyText += chunk
        } else {
            bodyText += chunk.toString('utf8')
        }
    })
    req.on('end', () => {
        req.body = bodyText
        next()
    })
})

app.get('**', express.static(path.resolve(__dirname, '../front')))
app.get('/sub/hook', (req, res) => {
    const query = Object.fromEntries(req.originalUrl.split('?')[1]?.split('&').map(it => it.split('=')) ?? [])
    const verified = verifySubscription(query['hub.mode'], query['hub.topic'], Number.parseInt(query['hub.lease_seconds']))
    if (verified) {
        res.send(query['hub.challenge'])
    } else {
        res.sendStatus(404)
    }
})
app.post('/sub/hook', async (req, res) => {
    res.send()
    const videoId = obtainVideoIdFromNotification(req.header('x-hub-signature') ?? '', req.body)
    if (!videoId) return
    const videos = await fetchVideo([ videoId ]) ?? []
    await cacheResponse(videos)
})

let isYouTubeApiSearching: boolean = false
let isYouTubeApiRenewingVideo: boolean = false

app.get('/api/videos', async (_req, res: Response<VideosResponse>) => {
    const { videos, lastUpdated, lastFetch } = await getCached(100)

    let willSearchVideos = false
    let willRefetchOutdatedVideos = false

    if (Date.now() - 24 * 60 * 60 * 1000 / 5 /* 5 times per day */ >= lastFetch && !isYouTubeApiSearching) {
        willSearchVideos = true
    }

    const outdatedUpcomingVideoIds = videos.filter(video => (
        [ 'upcoming', 'live' ].includes(video.item.snippet?.liveBroadcastContent!!) &&
        Date.now() - 15 * 60 * 1000 /* 15 mins */ >= video.fetched
    )).map(video => video.item.id)
    if (outdatedUpcomingVideoIds.length != 0 && !isYouTubeApiRenewingVideo) {
        willRefetchOutdatedVideos = true
    }

    res.send({
        kind: 'voms-timeline.comame.xyz#videosResponse',
        items: videos.map(it => it.item),
        lastUpdated: new Date(lastUpdated).toISOString(),
        willUpdate: willSearchVideos || willRefetchOutdatedVideos || isYouTubeApiRenewingVideo || isYouTubeApiSearching
    })

    if (willSearchVideos) {
        isYouTubeApiSearching = true
        try {
            console.log('SEARCH VIDEOS')
            const videoIds = await searchVideos()
            const videos = await fetchVideo(videoIds) ?? []
            await cacheResponse(videos, Date.now())
        } finally {
            isYouTubeApiSearching = false
        }

        await requestSubscription()
    }

    if (willRefetchOutdatedVideos) {
        isYouTubeApiRenewingVideo = true
        try {
            console.log('OUTDATED UPCOMINGS', outdatedUpcomingVideoIds)
            const updatedUpcomingVideos = await fetchVideo(outdatedUpcomingVideoIds) ?? []
            await cacheResponse(updatedUpcomingVideos)

            const removedVideoIds: string[] = []
            for (const cachedId of outdatedUpcomingVideoIds) {
                if (!updatedUpcomingVideos.map(it => it.id).includes(cachedId)) {
                    removedVideoIds.push(cachedId)
                }
            }

            console.log('CANCELED', removedVideoIds)
            await deleteCaches(removedVideoIds)
        } finally {
            isYouTubeApiRenewingVideo = false
        }
    }
})

app.listen(process.env.PORT || 80, () => {
    console.log('LISTEN')
})
