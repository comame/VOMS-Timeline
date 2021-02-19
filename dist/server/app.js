!function(e){var t={};function o(i){if(t[i])return t[i].exports;var n=t[i]={i:i,l:!1,exports:{}};return e[i].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=t,o.d=function(e,t,i){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(o.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(i,n,function(t){return e[t]}.bind(null,n));return i},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=4)}([function(e,t,o){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.dotenv=void 0;const n=i(o(10)),s=o(2);t.dotenv=Object.fromEntries(n.default.readFileSync(s.resolve(__dirname,"../../.env"),{encoding:"utf8"}).split("\n").map(e=>e.split("=")))},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.channels=void 0,t.channels={"天野ピカミィ":"UCajhBT4nMrg3DLS-bLL2RCg","緋笠トモシカ":"UC3vzVK_N_SUVKqbX69L_X4g","磁富モノエ":"UCaFhsCKSSS821N-EcWmPkUQ",Gyari:"GYARISUTA"}},function(e,t){e.exports=require("path")},function(e,t,o){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.Response=t.fetch=void 0;const n=i(o(13));t.fetch=async function(e,t){return new Promise((o,i)=>{const r=n.default.request(e,null!=t?t:{},e=>{let t="";e.on("data",e=>{t+="string"==typeof e?e:new TextDecoder("utf-8").decode(e)}),e.on("end",()=>{const i={};for(const t of Object.keys(e.headers)){const o=e.headers[t];void 0!==o&&(Array.isArray(o)?i[t]=o.join(" "):i[t]=o)}o(new s(i,e.statusCode,e.url,t))})});r.on("error",e=>{i(e)}),(null==t?void 0:t.body)&&r.write(t.body),r.end()})};class s{constructor(e,t,o,i){this.headers=e,this.status=t,this.url=o,this.ok=200<=t&&t<300,this.json=async()=>JSON.parse(i),this.text=async()=>i}}t.Response=s},function(e,t,o){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=i(o(2)),s=i(o(5)),r=o(6),a=o(7),c=o(11),u=o(17),d=o(20),l=s.default();let p;l.use((e,t,o)=>{let i="";e.on("data",e=>{i+="string"==typeof e?e:e.toString("utf8")}),e.on("end",()=>{e.body=i,o()})}),l.get("**",s.default.static(n.default.resolve(__dirname,"../front"))),l.get("/sub/hook",(e,t)=>{var o,i;const n=Object.fromEntries(null!==(i=null===(o=e.originalUrl.split("?")[1])||void 0===o?void 0:o.split("&").map(e=>e.split("=")))&&void 0!==i?i:[]);a.verifySubscription(n["hub.mode"],n["hub.topic"],Number.parseInt(n["hub.lease_seconds"]))?t.send(n["hub.challenge"]):t.sendStatus(404)}),l.post("/sub/hook",async(e,t)=>{var o,i;t.send();const n=a.obtainVideoIdFromNotification(null!==(o=e.header("x-hub-signature"))&&void 0!==o?o:"",e.body);if(!n)return;const s=null!==(i=await c.fetchVideo([n]))&&void 0!==i?i:[];await u.cacheResponse(p,s)});let f=!1,v=!1;l.get("/api/videos",async(e,t)=>{var o,i;const{videos:n,lastUpdated:s,lastFetch:r}=await u.getCached(p,100);let a=!1,l=!1;Date.now()-1728e4>=r&&!f&&(a=!0);const b=n.filter(e=>{var t;return["upcoming","live"].includes(null===(t=e.item.snippet)||void 0===t?void 0:t.liveBroadcastContent)&&Date.now()-9e5>=e.fetched}).map(e=>e.item.id);if(0==b.length||v||(l=!0),t.send({kind:"voms-timeline.comame.xyz#videosResponse",items:n.map(e=>e.item),lastUpdated:new Date(s).toISOString(),willUpdate:a||l||v||f}),a){f=!0;try{console.log("SEARCH VIDEOS");const e=await c.searchVideos(),t=null!==(o=await c.fetchVideo(e))&&void 0!==o?o:[];await u.cacheResponse(p,t,Date.now())}finally{f=!1}await d.requestSubscription()}if(l){v=!0;try{console.log("OUTDATED UPCOMINGS",b);const e=null!==(i=await c.fetchVideo(b))&&void 0!==i?i:[];await u.cacheResponse(p,e);const t=[];for(const o of b)e.map(e=>e.id).includes(o)||t.push(o);console.log("CANCELED",t),await u.deleteCaches(p,t)}finally{v=!1}}}),r.MongoClient.connect("mongodb://mongo:27017",{useUnifiedTopology:!0},(e,t)=>{e&&(console.log(e),process.exit(1)),p=t.db("voms-timeline"),l.listen(80,()=>{console.log("LISTEN")})})},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("mongodb")},function(e,t,o){"use strict";var i=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.verifySubscription=t.obtainVideoIdFromNotification=void 0;const n=i(o(8)),s=o(9),r=o(0),a=o(1);t.obtainVideoIdFromNotification=function(e,t){var o,i;if(console.log("Notification"),!0!==s.validate(t)){const e=s.validate(t);return void console.error("XML syntax error",e)}if(n.default.createHmac("sha1",r.dotenv.WEBSUB_HUB_SECRET).update(t).digest("hex")!=(null==e?void 0:e.slice("sha1=".length)))return void console.error("Invalid digest");const a=null===(i=null===(o=s.parse(t).feed)||void 0===o?void 0:o.entry)||void 0===i?void 0:i["yt:videoId"];return console.log("Update notification",a),a},t.verifySubscription=function(e,t,o){if("subscribe"==e){return Object.entries(a.channels).map(e=>e[1]).map(e=>("https://www.youtube.com/xml/feeds/videos.xml?channel_id="+e).replace(/\?/g,"%3F").replace(/\=/g,"%3D")).includes(t)?Number.isNaN(o)||o<216e3?(console.log("Denied WebSub Verification Request (mode: subscribe): invalid leaseSeconds",o),!1):(console.log("Accepted WebSub Verification Request (mode: subscribe)",t),!0):(console.log("Denied WebSub Verification Request (mode: subscribe): invalid topic",t),!1)}return"unsubscribe"==e?(console.log("Denied WebSub Verification Request (mode: unsubscribe)"),!1):"denied"==e?(console.log("Accepted WebSub Verification Request (mode: denied)"),!0):(console.log("Denied invalid WebSub Verification Request"),!1)}},function(e,t){e.exports=require("crypto")},function(e,t){e.exports=require("fast-xml-parser")},function(e,t){e.exports=require("fs")},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.searchVideos=t.fetchVideo=void 0;const i=o(12),n=o(3),s=o(14),r=o(0),a=o(15),c=o(16),u=o(1);t.fetchVideo=async function(e){if(0==e.length)return[];const t={part:["id","snippet","liveStreamingDetails"],id:e,key:r.dotenv.GOOGLE_API_KEY},o=a.buildUrlQuery(s.youtube.videos,{...t,part:t.part.join(","),id:e.join(",")}),c=await n.fetch(o),u=await c.json();if(!i.isVideoAPIResponse(u))throw"ERROR";return u.items},t.searchVideos=async function(){const e=Object.entries(u.channels).map(e=>e[1]).map(e=>({part:["id","snippet"],channelId:e,maxResults:10,order:"date",type:"video",key:r.dotenv.GOOGLE_API_KEY})).map(e=>({...e,part:e.part.join(",")})).map(e=>a.buildUrlQuery(s.youtube.search,e)),t=await Promise.all(e.map(e=>n.fetch(e).then(e=>e.json())));if(!t.every(e=>c.isSearchAPIResponse(e)))return console.log(t),[];const o=[];for(const e of t){const t=e.items.map(e=>{var t;return null===(t=e.id)||void 0===t?void 0:t.videoId});o.push(...t)}return o}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isVideoAPIResponse=void 0,t.isVideoAPIResponse=function(e){return"object"==typeof e&&"youtube#videoListResponse"==e.kind}},function(e,t){e.exports=require("https")},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.self=t.youtube=void 0,t.youtube={search:"https://www.googleapis.com/youtube/v3/search",activities:"https://www.googleapis.com/youtube/v3/activities",videos:"https://www.googleapis.com/youtube/v3/videos"},t.self={videos:"/api/videos"}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.buildUrlQuery=void 0,t.buildUrlQuery=function(e,t){return e+"?"+Object.keys(t).map(e=>{const o=t[e];if(void 0!==o)return encodeURIComponent(e)+"="+encodeURIComponent(o)}).filter(e=>void 0!==e).join("&")}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isSearchAPIResponse=void 0,t.isSearchAPIResponse=function(e){return"object"==typeof e&&"youtube#searchListResponse"==e.kind}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getCached=t.cacheResponse=t.deleteCaches=void 0;const i=o(18);t.deleteCaches=async function(e,t){const o=e.collection("videos");await o.deleteMany({_id:{$in:t}}),await o.updateMany({_id:{$in:t}},{$set:{deleted:!0}})},t.cacheResponse=async function(e,t,o){const n=e.collection("metadata"),s=o?{lastUpdated:(new Date).getTime(),lastFetch:o}:{lastUpdated:(new Date).getTime()};await n.updateOne({},{$set:s},{upsert:!0});const r=e.collection("videos");await Promise.all(t.map(e=>r.updateOne({_id:e.id},{$set:{_id:e.id,time:i.getVideoTime(e).getTime(),item:e,update:Date.now()}},{upsert:!0})))},t.getCached=async function(e,t=50){var o,i;const n=e.collection("metadata"),s=e.collection("videos"),r=await n.findOne({}),a=(await s.find({deleted:!1}).sort("time",-1).limit(t).toArray()).map(e=>({item:e.item,fetched:e.update}));return{lastUpdated:null!==(o=null==r?void 0:r.lastUpdated)&&void 0!==o?o:0,lastFetch:null!==(i=null==r?void 0:r.lastFetch)&&void 0!==i?i:0,videos:a}}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.getVideoTime=void 0;const i=o(19);t.getVideoTime=function(e){var t,o,n;return(null===(t=e.liveStreamingDetails)||void 0===t?void 0:t.actualEndTime)?i.asDate(e.liveStreamingDetails.actualEndTime):(null===(o=e.liveStreamingDetails)||void 0===o?void 0:o.scheduledStartTime)?i.asDate(e.liveStreamingDetails.scheduledStartTime):i.asDate(null===(n=e.snippet)||void 0===n?void 0:n.publishedAt)}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.asDate=void 0,t.asDate=function(e){return new Date(e)}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.requestSubscription=void 0;const i=o(0),n=o(3),s=o(1);t.requestSubscription=async function(){const e=Object.entries(s.channels).map(e=>e[1]).map(e=>({"hub.callback":"https://voms-timeline.comame.xyz/sub/hook?verify_token="+i.dotenv.WEBSUB_VERIFY_TOKEN,"hub.verify":"sync","hub.mode":"subscribe","hub.secret":i.dotenv.WEBSUB_HUB_SECRET,"hub.topic":"https://www.youtube.com/xml/feeds/videos.xml?channel_id="+e})).map(e=>Object.entries(e).map(([e,t])=>e+"="+encodeURIComponent(t)).join("&")).map(e=>n.fetch("https://pubsubhubbub.appspot.com/subscribe",{method:"POST",body:e,headers:{"content-type":"application/x-www-form-urlencoded","content-length":""+e.length,"user-agent":"comame<dev@comame.xyz>"}}));return(await Promise.all(e)).every(e=>e.ok)}}]);
//# sourceMappingURL=app.js.map