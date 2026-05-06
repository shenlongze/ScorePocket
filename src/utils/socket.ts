let socketTask: UniApp.SocketTask | null = null
let reconnectAttempts = 0
const MAX_RECONNECT = 5

export interface SocketMessage {
  type: string
  data: any
  timestamp: number
  roomId: string
}

export function connectSocket(url: string, roomId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    socketTask = uni.connectSocket({
      url: `${url}?roomId=${roomId}`,
      success: () => {
        reconnectAttempts = 0
        resolve()
      },
      fail: (err) => {
        handleReconnect(url, roomId, reject)
      }
    })

    socketTask.onOpen(() => {
      reconnectAttempts = 0
    })

    socketTask.onError(() => {
      handleReconnect(url, roomId)
    })

    socketTask.onClose(() => {
      handleReconnect(url, roomId)
    })
  })
}

function handleReconnect(url: string, roomId: string, reject?: (reason?: any) => void) {
  if (reconnectAttempts < MAX_RECONNECT) {
    reconnectAttempts++
    setTimeout(() => {
      connectSocket(url, roomId).catch(() => {})
    }, Math.pow(2, reconnectAttempts) * 1000)
  } else if (reject) {
    reject(new Error('Max reconnect attempts exceeded'))
  }
}

export function sendMessage(message: SocketMessage): void {
  if (socketTask) {
    socketTask.send({
      data: JSON.stringify(message)
    })
  }
}

export function onMessage(callback: (message: SocketMessage) => void): void {
  if (socketTask) {
    socketTask.onMessage((res) => {
      try {
        const message = JSON.parse(res.data as string)
        callback(message)
      } catch (e) {
        console.error('Socket message parse error', e)
      }
    })
  }
}

export function closeSocket(): void {
  if (socketTask) {
    socketTask.close({
      success: () => {
        socketTask = null
      }
    })
  }
}

export function isConnected(): boolean {
  return socketTask !== null
}
