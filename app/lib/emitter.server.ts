import { EventEmitter as DefaultEventEmitter } from 'node:events'

import type { Event } from './sse'

class EventEmitter extends DefaultEventEmitter {
  override emit(eventName: Event, ...args: any[]) {
    return super.emit(eventName, ...args)
  }
  override on(
    eventName: Event,
    listener: Parameters<DefaultEventEmitter['on']>[1]
  ) {
    return super.on(eventName, listener)
  }
  override off(
    eventName: Event,
    listener: Parameters<DefaultEventEmitter['off']>[1]
  ) {
    return super.off(eventName, listener)
  }
}

export const emitter = new EventEmitter()
