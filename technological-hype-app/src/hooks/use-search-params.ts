import { useCallback, useSyncExternalStore } from "react"

const SEARCHPARAMS_EVENT = "searchparamschange"

function getSnapshot() {
  return window.location.search
}

function getServerSnapshot() {
  return ""
}

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb)
  window.addEventListener(SEARCHPARAMS_EVENT, cb)
  return () => {
    window.removeEventListener("popstate", cb)
    window.removeEventListener(SEARCHPARAMS_EVENT, cb)
  }
}

type Updater =
  | URLSearchParams
  | ((prev: URLSearchParams) => URLSearchParams)

type SetOptions = { replace?: boolean }

export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const params = new URLSearchParams(search)

  const setParams = useCallback(
    (next: Updater, options: SetOptions = { replace: true }) => {
      const current = new URLSearchParams(window.location.search)
      const updated =
        typeof next === "function" ? next(current) : new URLSearchParams(next)
      const qs = updated.toString()
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`

      if (options.replace) {
        window.history.replaceState(null, "", url)
      } else {
        window.history.pushState(null, "", url)
      }
      window.dispatchEvent(new Event(SEARCHPARAMS_EVENT))
    },
    [],
  )

  return [params, setParams] as const
}
