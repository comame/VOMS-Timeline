import path from 'path'
import express, { Response } from 'express'
import { MongoClient, Db } from 'mongodb'
import { websubExpressHandler } from './websubExpressHandler'
import { fetchVideo, searchVideos } from './fetchVideo'
import { cacheResponse, getCached } from './cache'
import { VideosResponse } from '../API/selfApiOptions/options'
import { requestSubscription } from './requestSubscription'

const app = express()
let db: Db

// Parse body as string
// @ts-ignore: res unused
app.use((req, res, next) => {
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
app.all('/sub/hook', async (req, res) => {
    const videoId = await websubExpressHandler(req, res)
    if (!videoId) return
    const videos = await fetchVideo([ videoId ])
    if (videos?.length == 0 || typeof videos == 'undefined') return

    await cacheResponse(db, videos)
})

// @ts-ignore: req unused
app.get('/api/videos', async (req, res: Response<VideosResponse>) => {
    const { videos, lastUpdated, lastFetch } = await getCached(db)
    res.send({
        kind: 'voms-timeline.comame.xyz#videosResponse',
        items: videos.map(it => it.item),
        lastUpdated: new Date(lastUpdated).toISOString()
    })

    const outdatedUpcomingVideoIds = videos.filter(video => (
        [ 'upcoming', 'live' ].includes(video.item.snippet?.liveBroadcastContent!!) &&
        Date.now() - 15 * 60 * 1000 /* 15 mins */ >= video.fetched
    )).map(video => video.item.id)
    console.log('OUTDATED UPCOMINGS', outdatedUpcomingVideoIds)
    const updatedUpcomingVideos = await fetchVideo(outdatedUpcomingVideoIds) ?? []
    await cacheResponse(db, updatedUpcomingVideos)

    if (Date.now() - 24 * 60 * 60 * 1000 / 5 /* 5 times per day */ >= lastFetch) {
        console.log('RE-SUBSCRIPTION')
        if (!await requestSubscription()) {
            console.log('SOMETHING WENT WRONG IN SUBSCRIPTION')
        }

        console.log('SEARCH VIDEOS')
        const videoIds = await searchVideos()
        if (videoIds.length == 0) {
            return
        }
        const videos = await fetchVideo(videoIds)
        if (videos?.length == 0 || typeof videos == 'undefined') return
        await cacheResponse(db, videos, Date.now())
    }
})

MongoClient.connect('mongodb://mongo:27017', { useUnifiedTopology: true }, (err, client) => {
    if (err) throw err
    db = client.db('voms-timeline')

    app.listen(80, () => {
        console.log('LISTEN')
    })
})
