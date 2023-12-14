<template lang="html">
  <div
    class="flex h-screen w-screen flex-col items-center justify-center bg-slate-900"
  >
    <!-- Title with icon -->
    <div class="flex select-none items-center justify-center gap-2">
      <h1 class="font-display text-xl font-light text-white">Nuxt Drawer</h1>
      <IconsIonColorPalette class="text-white" />
    </div>

    <!-- Panel & buttons -->
    <div class="flex items-center justify-center gap-2">
      <div class="flex flex-col">
        <!-- Color picker -->
        <div class="overflow-hidden rounded">
          <Chrome v-model="lineColor" />
        </div>
        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            class="mt-5 flex-1 rounded-full bg-sky-500 p-3 font-sans text-white transition-colors hover:bg-sky-600"
            @click="saveCanvas()"
          >
            Save
          </button>
          <button
            class="mt-5 flex-1 rounded-full bg-sky-500 p-3 font-sans text-white transition-colors hover:bg-sky-600"
            @click="loadCanvas()"
          >
            Load
          </button>
        </div>
        <button
          class="mt-5 rounded-full bg-sky-500 p-3 font-sans text-white transition-colors hover:bg-sky-600"
          @click="socket.emit('clear'), clearCanvas()"
        >
          Clear
        </button>
      </div>

      <!-- Canvas -->
      <canvas
        @mousedown="() => (isMouseDown = true)"
        ref="canvasRef"
        class="m-3 rounded bg-white"
        width="500px"
        height="500px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chrome } from '@ckpack/vue-color'
import { io } from 'socket.io-client'
import type { Draw, Point } from '~/types/typing'

const PORT = process.env.PORT || '3001'
const uri =
  process.env.NODE_ENV === 'production'
    ? 'wss://nuxt-drawer-ws.onrender.com'
    : `http://localhost:${PORT}`
const socket = io(uri, {
  transports: ['websocket']
})

const lineColor = ref<any>('#000000')
const isMouseDown = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const previousPoint = ref<Point | null>(null)

// Functions
function drawLine({ context, previousPoint, currentPoint, lineColor }: Draw) {
  // Configuration
  const lineWidth = 5
  const radius = 2
  const startAngle = 0
  const endAngle = 2 * Math.PI

  context.lineWidth = lineWidth
  if (typeof lineColor === 'string') {
    context.strokeStyle = lineColor
    context.fillStyle = lineColor
  } else {
    context.lineWidth = lineWidth
    context.strokeStyle = lineColor?.value.hex8
    context.fillStyle = lineColor?.value.hex8
  }

  // Context draw line
  let startPoint = previousPoint ?? currentPoint
  context.beginPath()
  context.moveTo(startPoint.x, startPoint.y)
  context.lineTo(currentPoint.x, currentPoint.y)
  context.stroke()

  context.beginPath()
  context.arc(startPoint.x, startPoint.y, radius, startAngle, endAngle)
  context.fill()
}
function createLine({ context, previousPoint, currentPoint }: Draw) {
  socket.emit('draw-line', {
    previousPoint,
    currentPoint,
    lineColor: lineColor.value.hex8
  })
  drawLine({
    context,
    previousPoint,
    currentPoint,
    lineColor: lineColor.value.hex8
  })
}
function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvas.width, canvas.height)
}
function saveCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dataURL = canvas.toDataURL()

  localStorage.setItem('nuxtDrawer', dataURL)

  alert('Drawing saved 💾')
}
function loadCanvas() {
  const savedData = localStorage.getItem('nuxtDrawer')
  if (!savedData) {
    alert('No saved drawing found ⚠')
    return
  }

  const canvas = canvasRef.value
  if (!canvas) return

  const context = canvas.getContext('2d')
  if (!context) return

  const img = new Image()

  img.src = savedData

  img.onload = function () {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(img, 0, 0)
  }

  alert('Drawing loaded 💾')
}

// Utilities
const computePointInCanvas = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  return { x, y }
}

// Handlers
const mouseMoveHandler = (e: MouseEvent) => {
  if (isMouseDown.value) {
    const currentPoint = computePointInCanvas(e)

    const ctx = canvasRef.value?.getContext('2d')
    if (!ctx || !currentPoint) return

    createLine({
      context: ctx,
      previousPoint: previousPoint.value,
      currentPoint: currentPoint
    })

    previousPoint.value = currentPoint
  }
}
const mouseUpHandler = (e: MouseEvent) => {
  isMouseDown.value = false
  previousPoint.value = null
}

// Lifehooks
onMounted(() => {
  const context = canvasRef.value?.getContext('2d')
  // Add sockets
  socket.emit('client-ready')
  socket.on('get-canvas-state', () => {
    if (!canvasRef.value?.toDataURL()) return
    socket.emit('canvas-state', canvasRef.value.toDataURL())
  })
  socket.on('canvas-state-from-server', (state: string) => {
    const img = new Image()
    img.src = state
    img.onload = () => {
      context?.drawImage(img, 0, 0)
    }
  })
  socket.on('draw-line', ({ previousPoint, currentPoint, lineColor }: Draw) => {
    if (!context) return
    drawLine({ context, previousPoint, currentPoint, lineColor })
  })
  socket.on('clear', () => {
    clearCanvas()
  })
  // Add event listener
  canvasRef.value?.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
})
onUnmounted(() => {
  // Remove sockets
  socket.off('get-canvas-state')
  socket.off('canvas-state-from-server')
  socket.off('draw-line')
  socket.off('clear')
  // Remove event listener
  canvasRef.value?.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('mouseup', mouseUpHandler)
})
</script>

<style lang="postcss" scoped></style>
