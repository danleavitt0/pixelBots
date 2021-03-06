/** @jsx element */

import scrollMw, {scrollTo as scrollToEffect} from 'middleware/scroll'
import fetchMw, {fetch, fetchEncodeJSON} from 'redux-effects-fetch'
import locationMw, * as location from 'redux-effects-location'
import mediaMw, {watchMedia} from 'redux-effects-media'
import firebaseConfig from 'client/firebaseConfig'
import {component, element} from 'vdux'
import {
  middleware as firebaseMw,
  set as firebaseSet,
  update as firebaseUpdate,
  once as firebaseOnce,
  push as firebasePush,
  transaction
} from 'vdux-fire'
import logger from 'redux-logger'
import App from 'components/App'
import theme from 'utils/theme'
import sleep from '@f/sleep'
import map from '@f/map'
import auth, {
  signOut as signOutEffect,
  signInWithProvider as signInEffect
} from 'middleware/auth'

export default component({
  getContext ({state, actions}) {
    return {
      isAnonymous: state.isAnonymous,
      username: state.username,
      url: state.url,
      uid: state.uid,
      uiTheme: theme,
      ...actions
    }
  },

  initialState: {
    url: ''
  },

  onCreate ({actions}) {
    return [
      actions.initializeApp(),
      actions.initializeMedia()
    ]
  },

  onUpdate (prev, next) {
    if (prev.state.title !== next.state.title && typeof document !== 'undefined') {
      document.title = next.state.title
    }
  },

  render ({props, state}) {
    return state.uid
      ? <App key={state.uid} {...state}/>
      : <span/>
  },

  middleware: [
    locationMw(),
    fetchEncodeJSON,
    fetchMw,
    mediaMw,
    firebaseMw(firebaseConfig),
    auth
  ],

  controller: {
    * initializeApp ({actions}) {
      yield actions.bindUrl((url) => actions.updateUrl(url))
    },
    * toast ({actions}, fn, time = 4500) {
      yield actions.showToast(fn)
      yield sleep(time)
      yield actions.hideToast()
    },
    * initializeMedia ({actions}) {
      yield watchMedia({
        print: 'print',
        xs: 'screen and (max-width: 599px)',
        sm: 'screen and (min-width: 600px) and (max-width: 959px)',
        md: 'screen and (min-width: 960px) and (max-width: 1279px)',
        lg: 'screen and (min-width: 1280px)'
      }, actions.updateMedia)
    },
    signOut: wrapEffect(signOutEffect),
    signIn: wrapEffect(signInEffect),
    firebaseSet: wrapEffect(firebaseSet),
    firebaseUpdate: wrapEffect(firebaseUpdate),
    firebaseOnce: wrapEffect(firebaseOnce),
    firebaseTransaction: wrapEffect(transaction),
    firebasePush: wrapEffect(firebasePush),
    scrollTo: wrapEffect(scrollToEffect),
    fetch: wrapEffect(fetch),
    firebaseTask: wrapEffect((state, obj) => firebasePush('/queue/tasks', {_state: state, ...obj})),
    ...map(wrapEffect, location)
  },

  reducer: {
    updateUrl: (state, url) => ({url}),
    setUserId: (state, user) => user && ({uid: user.uid, isAnonymous: user.isAnonymous}),
    setUsername: (state, username) => ({username}),
    openModal: (state, modal) => ({modal}),
    closeModal: () => ({modal: null}),
    showToast: (state, toast) => ({toast}),
    hideToast: () => ({toast: null}),
    setTitle: (state, title) => ({title}),
    updateMedia: (state, {key, matches}) => ({
      media: state.media === key
        ? matches ? key : null
        : matches ? key : state.media
    })
  }
})

function wrapEffect (fn) {
  return (model, ...args) => fn(...args)
}
