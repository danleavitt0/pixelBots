/**
 * Imports
 */

import EmptyState from 'components/EmptyState'
import Challenges from 'components/Challenges'
import Playlists from 'components/Playlists'
import ComboList from 'components/ComboList'
import Loading from 'components/Loading'
import {component, element} from 'vdux'
import mapValues from '@f/map-values'
import {Block} from 'vdux-ui'
import enroute from 'enroute'

function getItems (profileGames = {}, profilePlaylists = {}) {
  const games = mapValues((game) => ({...game, type: 'game'}), profileGames).filter((game) => !game.isInPlaylist)
  const playlists = mapValues((playlist) => ({...playlist, type: 'playlist'}), profilePlaylists)
  return [...games, ...playlists]
}

const router = enroute({
  'inProgress': function (params, props) {
    const items = getItems(props.profile.inProgress, props.profile.lists)
    return (
    	items && Object.keys(items).length
    		? <ComboList items={items} />
    		: <EmptyState icon='access_time' title='In Progress Projects' description={'You don\'t currently have any projects in progress. In progress projects will appear here so you can continue where you left off. '} />
  	)
  },
  'completed': function (params, props) {
    const items = getItems(props.profile.completed, props.profile.completedPlaylists)
    return (
    	items && Object.keys(items).length
    		? <ComboList completed items={items} />
    		: <EmptyState icon='check_circle' title='Completed Projects' description='All the projects you complete will show up here. Complete your first project to get your list started!' />
  	)
  },
  'playlists': function (params, props) {
  	const items = props.profile.playlists
    return (
    	items && Object.keys(items).length
    		? <Block ml='-1'><Playlists items={items} /></Block>
    		: <EmptyState icon='view_list' title='In Progress Playlists' description={'You don\'t currently have any playlists in progress. In progress playlists will appear here so you can continue where you left off. '} />
  	)
  },
})

/**
 * <Studio/>
 */

export default component({
	* onCreate ({props, context}) {
		const {category, username, subcategory, mine} = props
	  if (!mine) {
	    return yield context.setUrl(`/${username}`)
	  }
	  if (!subcategory) {
	    return yield context.setUrl(`/${username}/${category}/inProgress`)
	  }
	},
  render ({props, actions}) {
	  return (
      <Block column wide tall>
      	{router(props.subcategory, props)}
      </Block>
  	)
	},
	controller: {
		* handleClick ({props, context}, key) {
			yield context.setUrl(`/${context.username}/${props.category}/${key}`)
		}
	}
})
