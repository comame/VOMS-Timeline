import { Db, Collection } from 'mongodb'
import { Video } from '../API/YouTubeApiOptions/VideosAPIOptions'
import { getVideoTime } from '../util/videoTime'

interface CacheMeta {
    lastUpdated: number,
    lastFetch?: number
}

interface VideoCache {
    _id: Video['id'],
    time: number,
    item: Video,
    update: number,
    deleted?: boolean
}

export async function deleteCaches(db: Db, ids: Video['id'][]) {
    const collection = db.collection<VideoCache>('videos')
    await collection.deleteMany({
        _id: { $in: ids }
    })
    await collection.updateMany({
        _id: { $in: ids }
    }, {
        $set: {
            deleted: true
        }
    })
}

export async function cacheResponse(db: Db, videos: Video[], lastFetch?: number) {
    const metadataCollection: Collection<CacheMeta> = db.collection('metadata')

    const metaUpdate = lastFetch ? {
        lastUpdated: new Date().getTime(),
        lastFetch
    } : {
        lastUpdated: new Date().getTime()
    }

    await metadataCollection.updateOne({}, {
        '$set': metaUpdate
    }, {
        upsert: true
    })

    const videosCollection: Collection<VideoCache> = db.collection('videos')
    await Promise.all(videos.map(video => videosCollection.updateOne({
        _id: video.id
    }, {
        '$set': {
            _id: video.id,
            time: getVideoTime(video).getTime(),
            item: video,
            update: Date.now()
        }
    }, {
        upsert: true
    })))
}

export async function getCached(db: Db, limit: number = 50): Promise<{
    lastUpdated: number,
    lastFetch: number,
    videos: Array<{ item: Video, fetched: number }>
}> {
    const metadataCollection: Collection<CacheMeta> = db.collection('metadata')
    const videosCollection: Collection<VideoCache> = db.collection('videos')

    const cacheMetadata = await metadataCollection.findOne({})
    const videoCaches = await videosCollection.find({
        deleted: false
    })
        .sort('time', -1)
        .limit(limit)
        .toArray()

    const videos = videoCaches.map(it => ({ item: it.item, fetched: it.update }))
    const lastUpdated = cacheMetadata?.lastUpdated ?? 0
    const lastFetch = cacheMetadata?.lastFetch ?? 0

    return { lastUpdated, lastFetch, videos }
}
