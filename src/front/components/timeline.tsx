import React, { useRef } from 'react'
import { useFetchVideos } from '../hooks/useAPI'
import { VideoList } from './videolist'
import { ChannelFilter } from '../hooks/useChannelFilter'
import { Video } from '../../API/YouTubeApiOptions/VideosAPIOptions'
import { getVideoTime } from '../../util/videoTime'
import { isVideoLive } from '../../util/isVideoLive'

import '../assets/arrow-up.svg'

export const Timeline: React.FunctionComponent<{
    filter: ChannelFilter
}> = ({ filter }) => {
    const { videos } = useFetchVideos()

    const channelFilterFunc = (video: Video) => {
        const channelId = video.snippet?.channelId
        const enable = filter.find(it => it.id == channelId)?.enable
        return enable
    }

    const sortByDateFunc = (asc: boolean = false) => (a: Video, b: Video) => {
        const timeA = getVideoTime(a).getTime()
        const timeB = getVideoTime(b).getTime()
        return asc ? timeA - timeB : timeB - timeA
    }

    const liveStreams = videos.filter(isVideoLive).filter(channelFilterFunc).sort(sortByDateFunc())

    const upcomingStreams = videos.filter(video =>
        video.snippet?.liveBroadcastContent == 'upcoming' &&
        !isVideoLive(video)
    ).filter(channelFilterFunc).sort(sortByDateFunc(true))

    const uploads = videos.filter(video =>
        video.snippet?.liveBroadcastContent == ('none' || void 0)
    ).filter(channelFilterFunc).sort(sortByDateFunc())

    const timelineViewRef = useRef<HTMLDivElement>(null)

    return <div className='Timeline' ref={ timelineViewRef }>
        <h2>配信中</h2>
        <VideoList items={ liveStreams } useRelativeTime={ true } />
        <h2>今後のライブストリーム</h2>
        <VideoList items={ upcomingStreams } useRelativeTime={ false }/>
        <h2>アップロード動画</h2>
        <VideoList items={ uploads } useRelativeTime={ true } />

        <a id='to-top' onClick={ () => { timelineViewRef.current?.scroll(0, 0)} }>
            <img src='./arrow-up.svg' />
        </a>
    </div>
}
