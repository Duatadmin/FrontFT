README — Switching the Front-End to Cloudflare Stream
(Phase 2 – video only, no posters yet)

0 · Current State
Layer	What we already have
Database	Table exrcwiki with columns
• exercise_id – four-digit code (0001, 0375 …)
• cf_video_uid – 32-char Cloudflare Stream UID
Video assets	Short 6-10 s clips stored locally and served as /videos/0001.mp4
Player	Web (React), iOS, Android — each queries one API endpoint and loops the clip
Goal of this step	Replace local .mp4 with Cloudflare HLS manifest without touching posters yet

1 · Back-End changes (Node / FastAPI / whatever)
1.1 Environment variables
var	example	purpose
CF_STREAM_SIGN_KEY	super-secret-32-bytes	HMAC secret used for JWT
CF_STREAM_KEY_ID	app_v1	goes into JWT header kid
CF_STREAM_TOKEN_TTL	3600 (seconds)	link lifetime
CF_STREAM_DELIVERY	https://videodelivery.net	Stream delivery host

1.2 New endpoint
http
Копировать
Редактировать
GET /videos/:exercise_id/play         --> 200 JSON
Response shape

json
Копировать
Редактировать
{
  "url":  "https://videodelivery.net/<UID>/manifest/video.m3u8?token=<JWT>",
  "loop": true
}
Controller pseudo-code

python
Копировать
Редактировать
@app.get("/videos/{exercise_id}/play")
def play(exercise_id: str, user: User):
    row = db.fetch_one(
        "SELECT cf_video_uid FROM exrcwiki WHERE exercise_id=%s",
        (exercise_id,)
    )
    if not row:
        raise HTTPException(404)

    uid = row["cf_video_uid"]
    exp = int(time.time()) + int(os.getenv("CF_STREAM_TOKEN_TTL", 3600))
    token = jwt.encode(
        {"sub": str(user.id), "kid": uid, "exp": exp},
        os.getenv("CF_STREAM_SIGN_KEY"),
        algorithm="HS256",
        headers={"kid": os.getenv("CF_STREAM_KEY_ID")},
    )
    url = f"{os.getenv('CF_STREAM_DELIVERY')}/{uid}/manifest/video.m3u8?token={token}"
    return {"url": url, "loop": True}
For local dev set USE_LOCAL_MEDIA=true and fall back to /videos/<id>.mp4.

2 · Front-End integration
2.1 React component (web)
tsx
Копировать
Редактировать
function VideoCard({ id }: { id: string }) {
  const { data } = useSWR<PlayDTO>(`/videos/${id}/play`, fetcher);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!data?.url || !ref.current) return;

    if (ref.current.canPlayType("application/vnd.apple.mpegurl")) {
      ref.current.src = data.url;          // Safari / iOS
    } else {
      const hls = new Hls();
      hls.loadSource(data.url);            // Chrome / Firefox
      hls.attachMedia(ref.current);
    }
  }, [data]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      width={160}
      height={90}
      loading="lazy"
    />
  );
}
Wrap in an IntersectionObserver so the request is fired only when the card enters the viewport (+150 px margin).

2.2 iOS (Swift + AVKit)
swift
Копировать
Редактировать
AF.request("/videos/\(id)/play").responseDecodable(of: PlayDTO.self) { resp in
    guard let dto = resp.value, let url = URL(string: dto.url) else { return }
    let player = AVPlayer(url: url)
    player.actionAtItemEnd = .none
    player.play()                     // loops automatically on iOS 17+
}
2.3 Android (Kotlin + ExoPlayer)
kotlin
Копировать
Редактировать
val factory = CacheDataSource.Factory()
    .setCache(simpleCache)                 // 50 MB RAM/disk loop-cache
    .setUpstreamDataSourceFactory(DefaultHttpDataSource.Factory())

val player = ExoPlayer.Builder(ctx).build()

suspend fun bind(id: String) {
    val dto = api.getPlay(id)
    val media = HlsMediaSource.Factory(factory)
        .createMediaSource(MediaItem.fromUri(dto.url))
    player.setMediaSource(media)
    player.repeatMode = Player.REPEAT_MODE_ALL
    player.prepare()
}
3 · Caching explained
Layer	Who stores data	What is cached	Lifetime
Cloudflare edge	300+ PoPs	HLS .m3u8 + .ts/.m4s segments	Cache-Control: public, max-age=31536000 (set by Stream)
End-user browser / AVPlayer / ExoPlayer	Device RAM/disk	last 1-2 segments (≈ 6-12 s) + manifest	while tab/app is alive
Railway back-end	None	only signs URL — no media passes through your server	

So bandwidth is saved by Cloudflare + each user’s browser; Railway just returns a JSON stub.

