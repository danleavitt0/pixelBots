import {paintSquare, moveAnimal} from 'pages/Game/middleware/botsMiddleware'
import {getNewLocation} from 'utils/animal'
import docs from './docs'

const imageURL = '/animalImages/zebra.jpg'
const speed = 750

function wrap (id) {
  const up = (steps, lineNum) => move(0, steps, lineNum)
  const right = (steps, lineNum) => move(1, steps, lineNum)
  const down = (steps, lineNum) => move(2, steps, lineNum)
  const left = (steps, lineNum) => move(3, steps, lineNum)
  const paint = (lineNum) => paintSquare({id, color: 'black', lineNum})

  function move (dir, steps, lineNum) {
    return moveAnimal({id, getLocation: getNewLocation(dir, steps), lineNum})
  }

  return {
    up,
    right,
    down,
    left,
    paint
  }
}

function getPaintColor (state, id) {
  const painted = state.game.painted || {}
  const location = state.game.animals[id].current.location
  return painted[location] !== 'black' ? 'black' : 'white'
}

export default wrap
export {
  docs,
  imageURL,
  speed
}