import { Video } from "../API/YouTubeApiOptions/VideosAPIOptions";

export function isVideoLive(video: Video): boolean {
    if (
        new Date(video.liveStreamingDetails?.scheduledStartTime!!).getTime() <= new Date().getTime() &&
        !video.liveStreamingDetails?.actualEndTime
    ) return true

    return false
}
