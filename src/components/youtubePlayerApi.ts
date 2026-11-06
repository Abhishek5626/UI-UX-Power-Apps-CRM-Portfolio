type YouTubePlayer = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}

type YouTubePlayerOptions = {
  height?: string | number
  width?: string | number
  videoId: string
  playerVars?: Record<string, string | number | boolean>
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void
    onError?: (event: { data: number; target: YouTubePlayer }) => void
  }
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: YouTubePlayerOptions,
      ) => YouTubePlayer
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export type { YouTubePlayer }

export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api'

let apiPromise: Promise<NonNullable<Window['YT']>> | null = null

export function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('YouTube API requires a browser window.'))
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (apiPromise) {
    return apiPromise
  }

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (window.YT?.Player) {
        resolve(window.YT)
      } else {
        reject(new Error('YouTube IFrame API failed to initialize.'))
      }
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    )
    if (existing) {
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onerror = () => {
      apiPromise = null
      reject(new Error('Could not load the YouTube IFrame API.'))
    }
    document.head.appendChild(script)
  })

  return apiPromise
}

export function createYouTubePlayer(
  element: string | HTMLElement,
  options: YouTubePlayerOptions,
) {
  return loadYouTubeIframeApi().then((YT) => new YT.Player(element, options))
}
