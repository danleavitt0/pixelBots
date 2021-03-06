/**
 * Imports
 */

// import AddToPlaylistModal from 'components/AddToPlaylistModal'
import GameTypeOptions from 'components/GameTypeOptions'
import FlowTracker from 'components/FlowTracker'
import createCode from 'utils/createShortCode'
import OptionsPage from 'pages/OptionsPage'
import Loading from 'components/Loading'
import Layout from 'layouts/MainLayout'
// import {scrollTo} from '../middleware/scroll'
import PublishPage from './PublishPage'
import {component, element} from 'vdux'
import Button from 'components/Button'
import {Block, Text} from 'vdux-ui'
// import {publish} from '../utils'
import Game from 'pages/Game'
import enroute from 'enroute'
import fire from 'vdux-fire'
import omit from '@f/omit'
import pick from '@f/pick'

const router = enroute({
  'create': (params, props) => <OptionsPage
    {...props.newGame.value}
    ref={props.new ? `/drafts/${props.draftID}` : `/games/${props.draftID}`}
    {...omit('title', props)}>
    {props.btn}
  </OptionsPage>,
  'options': (params, props) => <GameTypeOptions 
  	{...props.newGame.value}
  	ref={props.new ? `/drafts/${props.draftID}` : `/games/${props.draftID}`}>
  	{props.btn}
  </GameTypeOptions>,
  'preview': (params, props) => <Game
    initialData={props.newGame.value}
    {...props}>
    {props.btn}
  </Game>,
  'publish': (params, props) => <PublishPage data={props.newGame.value} publish={props.publish} draftID={props.draftID}/>
})

const nextStep = (isNew) => ({
	create: 'options',
	options: 'preview',
	preview: isNew && 'publish'
})

/**
 * <Create/>
 */

export default fire((props) => ({
  newGame: props.new ? `drafts/${props.draftID}` : `games/${props.draftID}`
}))(component({
	* onCreate ({props, context}) {
		if (!props.step) {
	    const path = props.new
	      ? `/create/${props.draftID}/create`
	      : `/edit/${props.draftID}/create`
	    yield context.setUrl(path, true)
	  }
	},

  render ({props, context, actions}) {
	  const {newGame, step} = props
	  const {uid} = context
	  const path = props.new ? 'create' : 'edit'

	  if (newGame.loading || !step) {
	    return <Loading />
	  }

	  const btn = <Block my='1em' align='center center'>
	    <Button
	      fs='m'
	      p='18px'
	      fontWeight='300'
	      onClick={actions.clickNext}
	      bgColor='blue'>
	      {nextStep(props.new)[step] ? 'Save & Continue' : 'Save'}
	    </Button>
	  </Block>

	  const titleActions = <Block>
	    <FlowTracker
	      onClick={actions.clickFlowTracker}
	      active={step}
	      mr
	      steps={['create', 'options', 'preview', props.new && 'publish']} />
	  </Block>

	  return <Layout
	    navigation={[{
	      category: 'create a challenge',
	      title: step.split('').map((char, i) => i === 0 ? char.toUpperCase() : char).join('')
	    }]}
	    bodyProps={{display: 'flex', px: '10px'}}
	    titleActions={titleActions}
	    titleImg={`/animalImages/${newGame.value.animals[0].type}.jpg`}>
	    {router(step, {newGame, ...props, btn, publish: actions.publish})}
	  </Layout>
  },

  * onUpdate (prev, {props, context}) {
  	if (!props.step) {
	    const path = props.new
	      ? `/create/${props.draftID}/create`
	      : `/edit/${props.draftID}/create`
	    yield context.setUrl(path, true)
	  }
	},

  controller: {
  	* clickNext ({props, context, actions}) {
  		const s = nextStep(props.new)[props.step]
  		if (s) {
	      const path = props.new ? 'create' : 'edit'
	      yield context.setUrl(`/${path}/${props.draftID}/${s}`)
	      // yield scrollTo('.action-bar-holder', '#top')
	    } else if (props.new) {
	      yield actions.publish()
	    } else {
	      yield context.setUrl('/')
	    }
  	},
  	* publish ({context, props, state}) {
  		const metaAttrs = ['inputType', 'lastEdited', 'title', 'imageUrl', 'creatorID']
  		const meta = pick(metaAttrs, props.newGame.value)
  		const code = yield createCode()
  		const {firebaseUpdate, firebaseSet, setUrl} = context
  		yield firebaseUpdate(`/games/${props.draftID}`, {
  			...props.newGame.value,
  			shortLink: code,
  			lastEdited: Date.now()
  		})
  		yield firebaseUpdate(`/games/${props.draftID}/meta`, {
  			...meta,
  			animals: props.newGame.value.animals.map(animal => animal.type)
  		})
  		yield firebaseUpdate(`/users/${context.uid}/games/${props.draftID}`, {
  			...meta,
  			animal: props.newGame.value.animals[0].type,
  			ref: props.draftID
  		})
  		yield firebaseUpdate(`/links/${code}`, {
  			type: 'game',
  			payload: props.draftID
  		})
  		yield setUrl(`/${context.username}/authored/challenges`)
      yield firebaseSet(`/users/${context.uid}/drafts/${props.draftID}`, null)
      yield firebaseSet(`/drafts/${props.draftID}`, null)
  	},
  	* clickFlowTracker ({context, props}, selection) {
  		const path = props.new ? 'create' : 'edit'
  		yield context.setUrl(`/${path}/${props.draftID}/${selection}`)
  	}
  }
}))


