/**
 * Imports
 */

import {component, element, Window, preventDefault} from 'vdux'
import Animal from 'components/Animal'
import animalApis from 'animalApis'
import {Block, Flex} from 'vdux-ui'
import objEqual from '@f/equal-obj'
import setProp from '@f/set-prop'
import Row from 'components/Row'
import reduce from '@f/reduce'

/**
 * <Grid/>
 */

export default component({
	initialState: {
		dragging: false,
		mouseDown: false
	},
	* onCreate ({props, actions}) {
		yield actions.setPaintedRows(getPainted(props.painted))
	},
	* onUpdate (prev, {props, actions}) {
		if (prev.props !== props && !props.paintMode) {
			yield actions.dragEnd()
		}
		if (!objEqual(prev.props.painted || {}, props.painted || {})) {
			yield actions.setPaintedRows(getPainted(props.painted))
		}
	},
  render ({props, state, actions, children}) {
	  const {dragging, mouseDown, paintedRows} = state
	  const {
	    numRows = 5,
	    levelSize,
	    paintMode,
	    editMode,
	    animals,
	    hasRun,
	    running,
	    active,
	    painted,
	    w = '100%',
	    h = '100%',
	    speed = 1,
	    ...cellProps
	  } = props

	  if (!paintedRows) {
	  	return <div/>
	  }

	  const size = parseFloat(levelSize) / numRows + 'px'
	  const thisAnimal = animals[0] ? animalApis[animals[0].type] : undefined
	  const animationSpeed = thisAnimal
	    ? (thisAnimal.speed * (1 / speed)) / 1000
	    : (500 * (1 / speed)) / 1000

	  return (
	    <Window onMouseUp={paintMode && actions.dragEnd()}>
	      <Block
	        w={w}
	        h={h}
	        relative
	        onMouseMove={(mouseDown && !dragging) && actions.dragStart()}
	        onMouseDown={paintMode && actions.mouseDown()}
	        onMouseUp={paintMode && actions.dragEnd()}>
	        {
	        	Array.from({length: numRows}, (v,k) => k + 1).map((i) => (
					  	<Row
					  		size={size}
					  		row={i}
					  		dragging={dragging}
					  		editMode={editMode}
					  		painted={paintedRows[i]}
					  		{...cellProps} />
					  ))
	        }
	        {
	        	animals.map((animal, i) => (
		          <Animal
		            hasRun={hasRun}
		            running={running}
		            editMode={editMode}
		            animationSpeed={animationSpeed}
		            cellSize={size}
		            active={active}
		            animal={animal}
		            id={i}/>
	        ))}
	        {children}
	      </Block>
	    </Window>
	  )
  },
  reducer: {
  	dragStart: () => ({dragging: true}),
  	dragEnd: () => ({dragging: false, mouseDown: false}),
  	mouseDown: () => ({mouseDown: true}),
  	setPaintedRows: (state, paintedRows) => ({paintedRows})
  }
})

function getPainted (painted) {
	return reduce((obj, next, key) => {
		const loc = key.split(',').map((num) => Number(num))
		return setProp(`${loc[0] + 1}.${loc[1] + 1}`, obj, next)
	}, {}, painted)
}
