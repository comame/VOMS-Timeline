import { Video } from '../API/YouTubeApiOptions/VideosAPIOptions'
import { getVideoTime } from '../util/videoTime'
import mysql from 'mysql'

interface CacheMeta {
    id: 1,
    lastUpdated: number,
    lastFetch: number
}

// interface VideoCache {
//     _id: Video['id'],
//     time: number,
//     item: Video,
//     update: number
// }

// TODO: Read from secret
const db = mysql.createPool({
    host: 'mysql.comame.dev',
    user: 'voms_timeline',
    password: process.env.DB_PASS,
    database: 'voms_timeline'
})

async function query(query: string, param?: any) {
    return new Promise((resolve, reject) => {
        db.query(query, param, (error, result) => {
            if (error) {
                reject(error)
            } else {
                resolve(result)
            }
        })
    })
}

export async function deleteCaches(ids: Video['id'][]) {
    await query(`DELETE FROM video WHERE id IN (?)`, ids)
}

export async function cacheResponse(videos: Video[], lastFetch?: number) {
    const metaUpdate: CacheMeta = {
        id: 1,
        lastUpdated: new Date().getTime(),
        lastFetch: lastFetch ?? 0
    }

    await query(`
    INSERT INTO metadata (id, last_updated, last_fetched) VALUES (?, ?, ?) AS new ON DUPLICATE KEY UPDATE last_updated=new.last_updated, last_fetched=new.last_fetched
    `, [ metaUpdate.id, metaUpdate.lastUpdated, metaUpdate.lastFetch])

    await Promise.all(videos.map(video => query(
        `INSERT INTO video (id, time, videoJson, updated) VALUES (?, ?, ?, ?) AS new ON DUPLICATE KEY UPDATE time=new.time, videoJson=new.videoJson, updated=new.updated`,
        [ video.id, getVideoTime(video).getTime(), encodeURIComponent(JSON.stringify(video)), Date.now() ]
    )))
}

export async function getCached(limit: number = 50): Promise<{
    lastUpdated: number,
    lastFetch: number,
    videos: Array<{ item: Video, fetched: number }>
}> {

    const [ cacheMetadata ] = (await query(`SELECT * from metadata`, []) ?? []) as [ any ]
    const videoCaches = (await query(`SELECT * FROM video ORDER BY time DESC LIMIT ?`, [ limit ]) ?? []) as [ any ]

    const videos = videoCaches.map((it: any) => ({ item: JSON.parse(decodeURIComponent(it.videoJson)), fetched: it.updated }))
    const lastUpdated = cacheMetadata?.last_updated ?? 0
    const lastFetch = cacheMetadata?.last_fetched ?? 0

    return { lastUpdated, lastFetch, videos }
}
