!function(e){var t={};function o(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,o),i.l=!0,i.exports}o.m=e,o.c=t,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)o.d(n,i,function(t){return e[t]}.bind(null,i));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=4)}([function(e,t,o){"use strict";var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(o(10)),s=o(2);t.dotenv=Object.fromEntries(i.default.readFileSync(s.resolve(__dirname,"../../.env"),{encoding:"utf8"}).split("\n").map(e=>e.split("=")))},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.channels={"天野ピカミィ":"UCajhBT4nMrg3DLS-bLL2RCg","緋笠トモシカ":"UC3vzVK_N_SUVKqbX69L_X4g","磁富モノエ":"UCaFhsCKSSS821N-EcWmPkUQ"}},function(e,t){e.exports=require("path")},function(e,t,o){"use strict";var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(o(13));t.fetch=async function(e,t){return new Promise((o,n)=>{const r=i.default.request(e,null!=t?t:{},e=>{let t="";e.on("data",e=>{t+="string"==typeof e?e:new TextDecoder("utf-8").decode(e)}),e.on("end",()=>{const n={};for(const t of Object.keys(e.headers)){const o=e.headers[t];void 0!==o&&(Array.isArray(o)?n[t]=o.join(" "):n[t]=o)}o(new s(n,e.statusCode,e.url,t))})});r.on("error",e=>{n(e)}),(null==t?void 0:t.body)&&r.write(t.body),r.end()})};class s{constructor(e,t,o,n){this.headers=e,this.status=t,this.url=o,this.ok=200<=t&&t<300,this.json=async()=>JSON.parse(n),this.text=async()=>n}}t.Response=s},function(e,t,o){"use strict";var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(o(2)),s=n(o(5)),r=o(6),a=o(7),u=o(11),d=o(17),c=o(20),l=s.default();let p;l.use((e,t,o)=>{let n="";e.on("data",e=>{n+="string"==typeof e?e:e.toString("utf8")}),e.on("end",()=>{e.body=n,o()})}),l.get("**",s.default.static(i.default.resolve(__dirname,"../front"))),l.all("/sub/hook",async(e,t)=>{const o=await a.websubExpressHandler(e,t);if(!o)return;const n=await u.fetchVideo([o]);0!=(null==n?void 0:n.length)&&void 0!==n&&await d.cacheResponse(p,n)}),l.get("/api/videos",async(e,t)=>{var o;const{videos:n,lastUpdated:i,lastFetch:s}=await d.getCached(p);t.send({kind:"voms-timeline.comame.xyz#videosResponse",items:n.map(e=>e.item),lastUpdated:new Date(i).toISOString()});const r=n.filter(e=>{var t;return["upcoming","live"].includes(null===(t=e.item.snippet)||void 0===t?void 0:t.liveBroadcastContent)&&Date.now()-9e5>=e.fetched}).map(e=>e.item.id);console.log("OUTDATED UPCOMINGS",r);const a=null!==(o=await u.fetchVideo(r))&&void 0!==o?o:[];if(await d.cacheResponse(p,a),Date.now()-1728e4>=s){console.log("RE-SUBSCRIPTION"),await c.requestSubscription()||console.log("SOMETHING WENT WRONG IN SUBSCRIPTION"),console.log("SEARCH VIDEOS");const e=await u.searchVideos();if(0==e.length)return;const t=await u.fetchVideo(e);if(0==(null==t?void 0:t.length)||void 0===t)return;await d.cacheResponse(p,t,Date.now())}}),r.MongoClient.connect("mongodb://mongo:27017",{useUnifiedTopology:!0},(e,t)=>{if(e)throw e;p=t.db("voms-timeline"),l.listen(80,()=>{console.log("LISTEN")})})},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("mongodb")},function(e,t,o){"use strict";var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=n(o(8)),s=o(9),r=o(0),a=o(1);t.websubExpressHandler=async function(e,t){var o,n,u,d,c;const l=Object.fromEntries(null!==(n=null===(o=e.originalUrl.split("?")[1])||void 0===o?void 0:o.split("&").map(e=>e.split("=")))&&void 0!==n?n:[]),p=async({queryObj:t,subscribeObject:o,result:n,rawBody:i="",reason:s=""})=>{console.log({url:e.originalUrl,query:Object.fromEntries(Object.entries(null!=t?t:{}).map(e=>[e[0].replace(/\./g,"_"),e[1]])),method:e.method,body:o,headers:e.headers,result:n,rawBody:i,reason:s})};if("subscribe"==l["hub.mode"]){if(!Object.entries(a.channels).map(e=>e[1]).map(e=>("https://www.youtube.com/xml/feeds/videos.xml?channel_id="+e).replace(/\?/g,"%3F").replace(/\=/g,"%3D")).includes(l["hub.topic"]))return t.sendStatus(404),void await p({queryObj:l,result:404,reason:"invalid_hub.topic"});const e=r.dotenv.WEBSUB_VERIFY_TOKEN;if(l.verify_token!=e)return t.sendStatus(404),void await p({queryObj:l,result:404,reason:"invalid_verify_token"});const o=l["hub.challenge"];return t.send(o),void await p({queryObj:l,result:200})}if("unsubscribe"==l["hub.mode"])return t.sendStatus(404),void await p({queryObj:l,result:404,reason:"unsubscribe_forbidden"});if("denied"==l["hub.mode"])return t.send(),void await p({queryObj:l,result:200});if(!0!==s.validate(e.body)){const o=s.validate(e.body);return console.error("VALIDATE ERROR",o),t.status(500).send("error"),void await p({result:500,rawBody:e.body,reason:"invalid_xml"})}const f=r.dotenv.WEBSUB_HUB_SECRET,v=i.default.createHmac("sha1",f).update(e.body).digest("hex"),b=null===(u=e.header("x-hub-signature"))||void 0===u?void 0:u.slice("sha1=".length);if(v!=b)return console.error("Invalid digest request","wants: "+v,"got: "+b),t.send("ok"),void await p({result:200,rawBody:e.body,reason:"invalid_digest"});const m=r.dotenv.WEBSUB_VERIFY_TOKEN;if(l.verify_token!=m)return t.send("ok"),void await p({result:200,rawBody:e.body,reason:"invalid_verify_token"});t.send("ok");const y=s.parse(e.body),h=null===(c=null===(d=y.feed)||void 0===d?void 0:d.entry)||void 0===c?void 0:c["yt:videoId"];return await p({subscribeObject:y,result:200,rawBody:e.body}),h}},function(e,t){e.exports=require("crypto")},function(e,t){e.exports=require("fast-xml-parser")},function(e,t){e.exports=require("fs")},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(12),i=o(3),s=o(14),r=o(0),a=o(15),u=o(16),d=o(1);t.fetchVideo=async function(e){const t={part:["id","snippet","liveStreamingDetails"],id:e,key:r.dotenv.GOOGLE_API_KEY},o=a.buildUrlQuery(s.youtube.videos,{...t,part:t.part.join(","),id:e.join(",")}),u=await i.fetch(o),d=await u.json();if(!n.isVideoAPIResponse(d))throw"ERROR";return d.items},t.searchVideos=async function(){const e=Object.entries(d.channels).map(e=>e[1]).map(e=>({part:["id","snippet"],channelId:e,maxResults:10,order:"date",type:"video",key:r.dotenv.GOOGLE_API_KEY})).map(e=>({...e,part:e.part.join(",")})).map(e=>a.buildUrlQuery(s.youtube.search,e)),t=await Promise.all(e.map(e=>i.fetch(e).then(e=>e.json())));if(!t.every(e=>u.isSearchAPIResponse(e)))return console.log(t),[];const o=[];for(const e of t){const t=e.items.map(e=>{var t;return null===(t=e.id)||void 0===t?void 0:t.videoId});o.push(...t)}return o}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isVideoAPIResponse=function(e){return"object"==typeof e&&"youtube#videoListResponse"==e.kind}},function(e,t){e.exports=require("https")},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.youtube={search:"https://www.googleapis.com/youtube/v3/search",activities:"https://www.googleapis.com/youtube/v3/activities",videos:"https://www.googleapis.com/youtube/v3/videos"},t.self={videos:"/api/videos"}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.buildUrlQuery=function(e,t){return e+"?"+Object.keys(t).map(e=>{const o=t[e];if(void 0!==o)return encodeURIComponent(e)+"="+encodeURIComponent(o)}).filter(e=>void 0!==e).join("&")}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.isSearchAPIResponse=function(e){return"object"==typeof e&&"youtube#searchListResponse"==e.kind}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(18);t.cacheResponse=async function(e,t,o){const i=e.collection("metadata"),s=o?{lastUpdated:(new Date).getTime(),lastFetch:o}:{lastUpdated:(new Date).getTime()};await i.updateOne({},{$set:s},{upsert:!0});const r=e.collection("videos");await Promise.all(t.map(e=>r.updateOne({_id:e.id},{$set:{_id:e.id,time:n.getVideoTime(e).getTime(),item:e,update:Date.now()}},{upsert:!0})))},t.getCached=async function(e,t=50){var o,n;const i=e.collection("metadata"),s=e.collection("videos"),r=await i.findOne({}),a=(await s.find().sort("time",-1).limit(t).toArray()).map(e=>({item:e.item,fetched:e.update}));return{lastUpdated:null!==(o=null==r?void 0:r.lastUpdated)&&void 0!==o?o:0,lastFetch:null!==(n=null==r?void 0:r.lastFetch)&&void 0!==n?n:0,videos:a}}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(19);t.getVideoTime=function(e){var t,o,i;return(null===(t=e.liveStreamingDetails)||void 0===t?void 0:t.actualEndTime)?n.asDate(e.liveStreamingDetails.actualEndTime):(null===(o=e.liveStreamingDetails)||void 0===o?void 0:o.scheduledStartTime)?n.asDate(e.liveStreamingDetails.scheduledStartTime):n.asDate(null===(i=e.snippet)||void 0===i?void 0:i.publishedAt)}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.asDate=function(e){return new Date(e)}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const n=o(0),i=o(3),s=o(1);t.requestSubscription=async function(){const e=Object.entries(s.channels).map(e=>e[1]).map(e=>({"hub.callback":"https://voms-timeline.comame.xyz/sub/hook?verify_token="+n.dotenv.WEBSUB_VERIFY_TOKEN,"hub.verify":"sync","hub.mode":"subscribe","hub.secret":n.dotenv.WEBSUB_HUB_SECRET,"hub.topic":"https://www.youtube.com/xml/feeds/videos.xml?channel_id="+e})).map(e=>Object.entries(e).map(([e,t])=>e+"="+encodeURIComponent(t)).join("&")).map(e=>i.fetch("https://pubsubhubbub.appspot.com/subscribe",{method:"POST",body:e,headers:{"content-type":"application/x-www-form-urlencoded","content-length":""+e.length,"user-agent":"comame<dev@comame.xyz>"}}));return(await Promise.all(e)).every(e=>e.ok)}}]);
//# sourceMappingURL=app.js.map