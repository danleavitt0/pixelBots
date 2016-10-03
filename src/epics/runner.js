import { startRun, stopRun, setActiveLine } from '../actions'
import {scrollTo} from '../middleware/scroll'
import * as animalApis from '../animalApis'
import { Observable } from 'rxjs'

const highlighter = (lineNum) => Observable.of(setActiveLine(lineNum))
const createDelay = (delay = 750) => Observable.empty().delay(delay)
const addScroll = (lineNum) => Observable.of(scrollTo('.code-editor', `#code-icon-${lineNum}`))

export default function runner (action$) {
  return action$.ofType(startRun.type)
    .map((action) => Observable.from(action.payload))
    .switchMap((obs) =>
      obs.map((x) => {
        const addDelay = Observable.of(x).concat(createDelay())
        return x.meta
          ? addDelay
            .merge(highlighter(x.meta.lineNum))
            .merge(addScroll(x.meta.lineNum))
          : addDelay
      })
         .concatAll()
         .takeUntil(action$.ofType(stopRun.type))
    )
}