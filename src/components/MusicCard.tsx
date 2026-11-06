import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  createYouTubePlayer,
  YT_PLAYER_STATE,
  type YouTubePlayer,
} from './youtubePlayerApi.ts'
import './music-card.css'

const track = {
  title: "L'Amour Toujours",
  artist: "Gigi D'Agostino",
  videoId: 'uU_B9eZvc0U',
  youtubeUrl: 'https://www.youtube.com/watch?v=uU_B9eZvc0U',
  artwork: '/landing/music-cover.webp',
  // Shown until the player loads on first use and reports the real length.
  durationSeconds: 230,
}

const SKIP_SECONDS = 10
/** The clock shows seconds and the slider moves under a pixel per second. */
const PROGRESS_INTERVAL_MS = 250
/** Movement that makes a press a drag; a swipe across the slider must not seek. */
const SEEK_DRAG_PX = 4

let artworkHue: Promise<{ hue: number; saturation: number } | null> | null = null

/** The artwork's most colourful average, shared by every copy of the card. */
function readArtworkHue() {
  artworkHue ??= new Promise((resolve) => {
    const image = new Image()
    image.onerror = () => resolve(null)
    image.onload = () => {
      try {
        const size = 16
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext('2d', { willReadFrequently: true })
        if (!context) return resolve(null)
        context.drawImage(image, 0, 0, size, size)
        const { data } = context.getImageData(0, 0, size, size)
        let red = 0
        let green = 0
        let blue = 0
        let weight = 0
        for (let index = 0; index < data.length; index += 4) {
          const [r, g, b] = [data[index]!, data[index + 1]!, data[index + 2]!]
          const chroma = Math.max(r, g, b) - Math.min(r, g, b)
          red += r * chroma
          green += g * chroma
          blue += b * chroma
          weight += chroma
        }
        if (weight === 0) return resolve(null)
        const [r, g, b] = [red / weight, green / weight, blue / weight]
        const max = Math.max(r, g, b)
        const chroma = max - Math.min(r, g, b)
        if (chroma === 0) return resolve(null)
        const sector =
          max === r ? ((g - b) / chroma + 6) % 6 : max === g ? (b - r) / chroma + 2 : (r - g) / chroma + 4
        resolve({ hue: Math.round(sector * 60), saturation: Math.round((chroma / max) * 100) })
      } catch {
        resolve(null)
      }
    }
    image.src = track.artwork
  })
  return artworkHue
}

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'unavailable'

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function PlayTriangle() {
  return (
    <svg className="music-card-play-icon" width="13" height="15" viewBox="0 0 13 15" aria-hidden="true">
      <path
        d="M2.1 1.05c0-.72.79-1.16 1.4-.78l8.15 5.45c.55.37.55 1.19 0 1.56L3.5 12.73c-.61.38-1.4-.06-1.4-.78V1.05Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PauseBars() {
  return (
    <svg className="music-card-pause-icon" width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
      <rect x="1" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="7.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

function SkipBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6h2v12H6zM20 6l-10 6 10 6z" fill="currentColor" />
    </svg>
  )
}

function SkipForwardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 6h2v12h-2zM4 6l10 6-10 6z" fill="currentColor" />
    </svg>
  )
}

function ProgressSeek({
  progress,
  playing,
  disabled,
  labelledBy,
  onSeek,
}: {
  progress: number
  playing: boolean
  disabled: boolean
  labelledBy: string
  onSeek: (ratio: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const pressRef = useRef({ x: 0, moved: false })
  const [dragging, setDragging] = useState(false)

  const ratioFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) {
      return 0
    }
    return clamp((clientX - rect.left) / rect.width, 0, 1)
  }

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return
    }
    draggingRef.current = false
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const played = clamp(progress, 0, 1)
  const percent = `${played * 100}%`

  return (
    <div
      ref={trackRef}
      className={[
        'music-card-seek',
        dragging ? 'is-dragging' : '',
        playing ? 'is-playing' : '',
        disabled ? 'is-disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(played * 100)}
      aria-valuetext={`${Math.round(played * 100)}% through the track`}
      aria-labelledby={labelledBy}
      aria-disabled={disabled || undefined}
      data-fisheye-drag-axis="x"
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) {
          return
        }
        event.preventDefault()
        pressRef.current = { x: event.clientX, moved: false }
        draggingRef.current = true
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) {
          return
        }
        if (!pressRef.current.moved && Math.abs(event.clientX - pressRef.current.x) < SEEK_DRAG_PX) {
          return
        }
        pressRef.current.moved = true
        onSeek(ratioFromClientX(event.clientX))
      }}
      onPointerUp={(event) => {
        // A tap seeks too, but only here: until now it could still become a pan
        // of the page, which must never load the player or skip the track.
        if (draggingRef.current && !pressRef.current.moved) {
          onSeek(ratioFromClientX(event.clientX))
        }
        finishPointer(event)
      }}
      onPointerCancel={finishPointer}
      onLostPointerCapture={finishPointer}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) {
          return
        }
        const step = event.shiftKey ? 0.1 : 0.05
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault()
          onSeek(clamp(progress + step, 0, 1))
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault()
          onSeek(clamp(progress - step, 0, 1))
        } else if (event.key === 'Home') {
          event.preventDefault()
          onSeek(0)
        } else if (event.key === 'End') {
          event.preventDefault()
          onSeek(1)
        }
      }}
    >
      <span className="music-card-line" aria-hidden="true">
        <span className="music-card-wave" style={{ width: percent }} />
        <span className="music-card-rest" style={{ left: percent }} />
        <span className="music-card-thumb" style={{ left: percent }} />
      </span>
    </div>
  )
}

export function MusicCard() {
  const reactId = useId()
  const hostId = `music-yt-host-${reactId.replace(/:/g, '')}`
  const titleId = `music-card-title-${reactId.replace(/:/g, '')}`
  const statusId = `music-card-status-${reactId.replace(/:/g, '')}`

  const cardRef = useRef<HTMLElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const tickerRef = useRef<number | null>(null)
  const playIntentRef = useRef(false)

  const pendingSeekRef = useRef<number | null>(null)

  const [playerWanted, setPlayerWanted] = useState(false)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(track.durationSeconds)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const stopTicker = () => {
    if (tickerRef.current === null) {
      return
    }
    window.clearTimeout(tickerRef.current)
    tickerRef.current = null
  }

  const readTimes = useEffectEvent(() => {
    const player = playerRef.current
    if (!player) {
      return
    }
    try {
      const nextCurrent = player.getCurrentTime() || 0
      const nextDuration = player.getDuration() || 0
      setCurrentTime(nextCurrent)
      if (nextDuration > 0) {
        setDuration(nextDuration)
      }
    } catch {
      // Player may be mid-teardown.
    }
  })

  const startTicker = useEffectEvent(() => {
    stopTicker()
    const tick = () => {
      readTimes()
      tickerRef.current = window.setTimeout(tick, PROGRESS_INTERVAL_MS)
    }
    tick()
  })

  useEffect(() => {
    let current = true
    void readArtworkHue().then((color) => {
      const card = cardRef.current
      if (!current || !color || !card) return
      // Fixed lightness keeps the dark icon on the accent readable for any artwork.
      const saturation = clamp(color.saturation, 25, 60)
      card.style.setProperty('--music-accent', `hsl(${color.hue} ${saturation}% 80%)`)
      card.style.setProperty('--music-accent-ink', `hsl(${color.hue} ${saturation}% 14%)`)
    })
    return () => {
      current = false
    }
  }, [])

  useEffect(() => {
    if (!playerWanted) return
    let cancelled = false
    let becameReady = false
    setStatus('loading')
    setErrorMessage(null)

    let readyPoll: number | null = null
    let readyTimeout: number | null = null

    const shell = shellRef.current
    if (!shell) {
      setStatus('unavailable')
      setErrorMessage(
        'Playback is unavailable right now. Open the track on YouTube instead.',
      )
      return
    }

    shell.replaceChildren()
    const mountNode = document.createElement('div')
    mountNode.id = hostId
    shell.appendChild(mountNode)

    const clearReadyWaiters = () => {
      if (readyPoll !== null) {
        window.clearInterval(readyPoll)
        readyPoll = null
      }
      if (readyTimeout !== null) {
        window.clearTimeout(readyTimeout)
        readyTimeout = null
      }
    }

    const markReady = (player: YouTubePlayer) => {
      if (cancelled || becameReady) {
        return
      }
      becameReady = true
      clearReadyWaiters()
      playerRef.current = player
      setStatus('ready')
      try {
        const readyDuration = player.getDuration() || 0
        if (readyDuration > 0) {
          setDuration(readyDuration)
        }
        if (pendingSeekRef.current !== null) {
          player.seekTo(pendingSeekRef.current, true)
          pendingSeekRef.current = null
        } else {
          setCurrentTime(player.getCurrentTime() || 0)
        }
      } catch {
        // Duration can arrive after buffering starts.
      }
      if (playIntentRef.current) {
        try {
          player.playVideo()
        } catch {
          // Ignore until the API becomes fully responsive.
        }
      }
    }

    createYouTubePlayer(mountNode, {
      height: 48,
      width: 48,
      videoId: track.videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          markReady(event.target)
        },
        onStateChange: (event) => {
          if (cancelled) {
            return
          }
          playerRef.current = event.target
          const state = event.data
          if (state === YT_PLAYER_STATE.PLAYING) {
            setPlaying(true)
            setStatus('ready')
            setErrorMessage(null)
            startTicker()
            readTimes()
          } else if (
            state === YT_PLAYER_STATE.PAUSED ||
            state === YT_PLAYER_STATE.ENDED ||
            state === YT_PLAYER_STATE.CUED
          ) {
            setPlaying(false)
            stopTicker()
            readTimes()
            if (state === YT_PLAYER_STATE.ENDED) {
              playIntentRef.current = false
            }
          } else if (state === YT_PLAYER_STATE.BUFFERING) {
            setStatus('ready')
            startTicker()
          }
        },
        onError: () => {
          if (cancelled) {
            return
          }
          playIntentRef.current = false
          setPlaying(false)
          stopTicker()
          setStatus('unavailable')
          setErrorMessage(
            'This track cannot be played here. Open it on YouTube instead.',
          )
        },
      },
    })
      .then((player) => {
        if (cancelled) {
          try {
            player.destroy()
          } catch {
            // Ignore destroy races during teardown.
          }
          return
        }
        playerRef.current = player
        readyPoll = window.setInterval(() => {
          try {
            const nextDuration = player.getDuration() || 0
            const state = player.getPlayerState()
            if (
              nextDuration > 0 ||
              state === YT_PLAYER_STATE.CUED ||
              state === YT_PLAYER_STATE.PAUSED ||
              state === YT_PLAYER_STATE.PLAYING
            ) {
              markReady(player)
            }
          } catch {
            // Keep polling until the API responds.
          }
        }, 200)
        readyTimeout = window.setTimeout(() => {
          if (cancelled || becameReady) {
            return
          }
          markReady(player)
        }, 5000)
      })
      .catch(() => {
        if (cancelled) {
          return
        }
        setStatus('unavailable')
        setErrorMessage(
          'Playback is unavailable right now. Open the track on YouTube instead.',
        )
      })

    return () => {
      cancelled = true
      stopTicker()
      clearReadyWaiters()
      try {
        playerRef.current?.destroy()
      } catch {
        // Ignore destroy races.
      }
      playerRef.current = null
      shell.replaceChildren()
    }
  }, [hostId, playerWanted])

  const canSeek = status !== 'unavailable' && duration > 0
  const progress = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0

  const seekToRatio = (ratio: number) => {
    const player = playerRef.current
    if (!(duration > 0) || status === 'unavailable') {
      return
    }
    const next = clamp(ratio, 0, 1) * duration
    setCurrentTime(next)
    if (!player) {
      pendingSeekRef.current = next
      setPlayerWanted(true)
      return
    }
    try {
      player.seekTo(next, true)
    } catch {
      setErrorMessage('Could not seek this track.')
    }
  }

  const skipBy = (seconds: number) => {
    if (duration > 0) {
      seekToRatio((currentTime + seconds) / duration)
    }
  }

  const togglePlayback = () => {
    if (status === 'unavailable') {
      return
    }
    const player = playerRef.current
    if (!player) {
      playIntentRef.current = true
      setPlayerWanted(true)
      setStatus('loading')
      return
    }
    try {
      if (playing) {
        playIntentRef.current = false
        player.pauseVideo()
        setPlaying(false)
        stopTicker()
        readTimes()
      } else {
        playIntentRef.current = true
        setErrorMessage(null)
        player.playVideo()
      }
    } catch {
      // Keep the card usable; YouTube may still raise onError if playback fails.
    }
  }

  return (
    <article ref={cardRef} className="music-card" data-hover-tile="" data-repel="">
      <div className="music-card-surface">
        <img
          className="music-card-art"
          src={track.artwork}
          alt=""
          width={335}
          height={597}
          decoding="async"
        />
        <div className="music-card-heading">
          <span className="music-card-icon" aria-hidden="true">
            <img src="/landing/music-aperture.svg" alt="" width={14} height={14} />
          </span>
          <h2 className="music-card-label">My Fav Music</h2>
          <div className="music-card-times">
            <span>{formatTime(currentTime)}</span>
            <span className="music-card-duration">
              {duration > 0 ? formatTime(duration) : '--:--'}
            </span>
          </div>
        </div>
        <div className="music-card-track">
          <div className="music-card-meta">
            <p id={titleId} className="music-card-title">
              {track.title}
            </p>
            <p className="music-card-artist">{track.artist}</p>
          </div>
          {status === 'unavailable' ? null : (
            <button
              type="button"
              className="music-card-play"
              aria-label={
                playing
                  ? `Pause ${track.title} by ${track.artist}`
                  : `Play ${track.title} by ${track.artist}`
              }
              aria-pressed={playing}
              aria-describedby={statusId}
              onClick={togglePlayback}
            >
              {status === 'loading' && !playing ? (
                <span className="music-card-loading-dot" aria-hidden="true" />
              ) : playing ? (
                <PauseBars />
              ) : (
                <PlayTriangle />
              )}
            </button>
          )}
        </div>
        {errorMessage ? (
          <p className="music-card-error" role="status">
            {errorMessage}{' '}
            <a href={track.youtubeUrl} target="_blank" rel="noreferrer">
              Open on YouTube
            </a>
          </p>
        ) : null}
        {status === 'unavailable' ? null : (
          <div className="music-card-controls">
            <button
              type="button"
              className="music-card-skip"
              aria-label={`Back ${SKIP_SECONDS} seconds`}
              disabled={!canSeek}
              onClick={() => skipBy(-SKIP_SECONDS)}
            >
              <SkipBackIcon />
            </button>
            <ProgressSeek
              progress={progress}
              playing={playing}
              disabled={!canSeek}
              labelledBy={titleId}
              onSeek={seekToRatio}
            />
            <button
              type="button"
              className="music-card-skip"
              aria-label={`Forward ${SKIP_SECONDS} seconds`}
              disabled={!canSeek}
              onClick={() => skipBy(SKIP_SECONDS)}
            >
              <SkipForwardIcon />
            </button>
          </div>
        )}
      </div>
      <div ref={shellRef} className="music-card-yt-host" aria-hidden="true" />
      <p id={statusId} className="visually-hidden" role="status">
        {status === 'loading'
          ? 'Loading track.'
          : status === 'unavailable'
            ? errorMessage || 'Track unavailable.'
            : playing
              ? 'Playing.'
              : 'Paused.'}
      </p>
    </article>
  )
}
