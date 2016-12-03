import { startRun, stopRun, setActiveLine, runCompleted } from '../actions'
import {loopAction} from '../animalApis/loop'
import {scrollTo} from '../middleware/scroll'
import isGeneratorObject from '@f/is-generator-object'
import animalApis from '../animalApis'
import { Observable } from 'rxjs'

const highlighter = (lineNum) => Observable.of(setActiveLine(lineNum))
const createDelay = (delay = 750) => Observable.empty().delay(delay)
const addScroll = (lineNum) => Observable.of(
  scrollTo('.code-editor', `#code-icon-${lineNum}`)
)

const getTimeout = (animals, id) => {
  return id
    ? animalApis[animals[id].type].speed
    : undefined
}

export default function runner (action$, store) {
  return action$.filter((action) => action.type === startRun.type)
    .map((action) => 
      Observable.from(action.payload).delay(800)
    )
    .switchMap((obs) => mapObserver(obs, store)
      .concatAll()
      .takeUntil(action$.ofType(stopRun.type) || action$.ofType(runCompleted.type))
    )
}

function mapObserver (obs, store) {
  return obs.map((x) => {
    return isGen(x) ? flattenGen(x) : addDelayAction(x)
  })

  function flattenGen (x) {
    return Observable.from(x.payload).concatMap((obs) => {
      if (isGen(obs)) {
        return flattenGen(obs)
      }
      return addDelayAction(obs)
    })
  }

  function addDelayAction (x) {
    const addDelay = Observable
      .of(x)
      .concat(
        createDelay(getTimeout(store.getState().game.animals, x.payload.id)
      ))
    return x.meta
      ? addDelay
        .merge(highlighter(x.meta.lineNum))
        .merge(addScroll(x.meta.lineNum))
      : addDelay
  }
}

function isGen (x) {
  return x.payload && isGeneratorObject(x.payload)
}