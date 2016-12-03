/** @jsx element */

import CodeComment from './CodeComment'
import CodeEndLoop from './CodeEndLoop'
import LineNumber from './LineNumber'
import {selectLine, addCode} from '../actions'
import {nameToIcon} from '../utils'
import element from 'vdux/element'
import {Block, Box, Icon} from 'vdux-ui'
import CodeLoop from './CodeLoop'
import CodeIcon from './CodeIcon'
import Outline from './Outline'
import Indent from './Indent'
import Cursor from './Cursor'

let prevLength = 0
let lastSelected = 0

function getName (line) {
  if (line.search(/\/\//g) > -1) {
    return 'comment'
  } else if (line.search(/^loop\(/g) > -1) {
    return 'loop'
  } else if (line.trim() === '}' || line.trim() === '})') {
    return 'endLoop'
  } else {
    return line.split('\(')[0]
  }
}

function getIndent (line) {
  if (line.search(/^loop\(/g) > -1) {
    return 1
  } else if (line.trim() === '}' || line.trim() === '})') {
    return -1
  } else {
    return 0
  }
}

function render ({props, state}) {
  const {animals, active, activeLine, selectedLine, hasRun, finishAddLoop, waitingForLoop, editorActions={}} = props
  const handleSelectLine = editorActions.selectLine || selectLine
  const handleAddCode = editorActions.addCode || addCode
  const lineHeight = '36px'
  const sequence = animals[active].sequence || []
  let indent = 0

  const code = sequence.map((line, i, arr) => {
    const isActive = activeLine === i && hasRun
    const name =  getName(line)
    const re = /\((.*?)(?:\))/gi
    const argMatch = re.exec(line)
    const argument = argMatch ? argMatch[1] : ''
    const type = animals[active].type
    const addedLine = arr.length > prevLength
    indent += getIndent(line)

    const opts = {line, lastSelected, addedLine, arr, indent, lineHeight, active, i, type, argument, isActive, selectedLine, editorActions}

    return (
      <Block id={`code-icon-${i}`} cursor='pointer' onClick={[(e) => e.stopPropagation(), () => handleClick(active, i)]}>
        <Cursor w='250px' h='14px' active={selectedLine === i}/>
        <Block align='center'>
          <LineNumber editorActions={editorActions} fs='22px' absolute textAlign='right' numLines={arr.length} lineNum={i + 1} animalID={active} active={selectedLine === i}/>
          <Indent w='30px' level={name !== 'loop' && !waitingForLoop ? indent : indent - 1} borderLeft='1px dotted deepPurple'/>
          {getElement(name, opts)}
        </Block>
      </Block>
    )
  })

  prevLength = sequence.length
  lastSelected = typeof (selectedLine) === 'number' ? selectedLine : -10

  return (
    <Box
      flex
      class='code-editor'
      bgColor='#A7B4CB'
      minWidth='480px'
      relative
      tall
      onClick={[(e) => e.stopPropagation(), () => handleClick(active, prevLength)]}
      overflowY='auto'>
      <Block absolute w='50px' left='0' tall/>
      <Block p='4px 15px' pl='66px' fs='22px' fontFamily='Monaco' color='white' column wide>
        {code}
        <Block w='250px' cursor='pointer' onClick={[(e) => e.stopPropagation(), () => handleClick(active, prevLength)]}>
          <Cursor w='250px' h='18px' active={selectedLine === prevLength}/>
        </Block>
      </Block>
    </Box>
  )

  function * handleClick (active, idx) {
    yield handleSelectLine({id: active, idx})
    if (waitingForLoop) {
      yield finishAddLoop()
      yield handleAddCode(active, `})`, idx)
    }
  }
}

function getElement (name, opts) {
  const {lastSelected, line, selectedLine, addedLine, arr, lineHeight, active, i, type, argument, isActive, editorActions} = opts
  let {indent} = opts
  if (name === 'comment') {
    return <CodeComment
              newElement={i === lastSelected && addedLine}
              shouldTransition={!addedLine}
              numLines={arr.length}
              h={lineHeight}
              bgColor='#666'
              line={line}
              animal={active}
              editorActions={editorActions}
              color='#333'
              fs='28px'
              w='250px'
              lineNum={i}/>
  } else if (name === 'loop') {
    return <CodeLoop
              newElement={i === lastSelected && addedLine}
              shouldTransition={!addedLine}
              numLines={arr.length}
              h={lineHeight}
              bgColor='deepPurple'
              animal={active}
              editorActions={editorActions}
              color='#333'
              fs='28px'
              w='250px'
              lineNum={i}/>
  } else if (name === 'endLoop') {
    return <CodeEndLoop
              newElement={i === lastSelected && addedLine}
              shouldTransition={!addedLine}
              numLines={arr.length}
              h={lineHeight}
              editorActions={editorActions}
              bgColor='deepPurple'
              animal={active}
              color='white'
              fs='28px'
              w='250px'
              lineNum={i}/>
  } else {
    return <CodeIcon
              iconName={nameToIcon(name)}
              focus={selectedLine === i}
              shouldTransition={!addedLine}
              newElement={i === lastSelected && addedLine}
              numLines={arr.length}
              name={name}
              type={type}
              editorActions={editorActions}
              bgColor={isActive ? '#B43C3C' : '#2C4770'}
              argument={argument}
              fs='28px'
              p='15px'
              w='250px'
              h={lineHeight}
              animal={active}
              lineNum={i}/>
  }
}

export default {
  render
}
