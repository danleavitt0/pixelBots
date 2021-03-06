/**
 * Imports
 */

import PlaylistItem from 'components/PlaylistItem'
import {component, element} from 'vdux'
import {Block} from 'vdux-ui'

/**
 * <Showcase View/>
 */

export default component({
  render ({props}) {
    const {playlists, color} = props
    return (
      <Block w='60%' pb='xl' m='0 auto' column align='center center'>
        {playlists.map((playlist) => <PlaylistItem color={color} playlistRef={playlist} />)}
      </Block>
    )
  }
})
