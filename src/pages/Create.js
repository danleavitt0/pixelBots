/** @jsx element */

import IndeterminateProgress from '../components/IndeterminateProgress'
import SelectOptions from './SelectOptions'
import SelectAnimal from './SelectAnimal'
import DrawLevel from './DrawLevel'
import element from 'vdux/element'
import {Block} from 'vdux-ui'
import enroute from 'enroute'
import fire from 'vdux-fire'

const router = enroute({
  'animal': (params, props) => <SelectAnimal title='create a challenge' {...props} />,
  'options': (params, props) => <SelectOptions {...props}/>,
  'level': (params, props) => <DrawLevel {...props} />
})

function render ({props}) {
  const {newGame} = props

  if (newGame.loading) {
    return <IndeterminateProgress/>
  }

  return (
    <Block absolute m='0 auto' ml='60px' top={props.top} tall w='calc(100% - 60px)' overflowY='auto'>
      {router(props.params, props)}
    </Block>
  )
}

export default fire((props) => ({
  newGame: `drafts/${props.gameID}`
}))({
  render
})
