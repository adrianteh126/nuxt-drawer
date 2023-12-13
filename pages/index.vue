<template lang="html">
  <div
    class="flex h-screen w-screen flex-col items-center justify-center bg-slate-900"
  >
    <!-- Title with icon -->
    <div class="flex select-none items-center justify-center gap-2">
      <h1 class="font-display font-light text-white">Nuxt Drawer</h1>
      <IconsIonColorPalette class="text-white" />
    </div>

    <div class="flex items-center justify-center gap-2">
      <!-- Color picker -->
      <div class="flex flex-col">
        <!-- <div class="rounded bg-white text-center">Pen size : O O O</div> -->
        <Chrome v-model="lineColor" />
        <button
          class="mt-5 rounded-full bg-sky-500 p-3 font-sans text-white transition-colors hover:bg-sky-600"
          @click="clearCanvas()"
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
import type { Draw, Point } from '@customTypes/typing'

const lineColor = ref<any>('#000000')

const isMouseDown = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const previousPoint = ref<Point | null>(null)

// Functions
function drawLine({ context, previousPoint, currentPoint }: Draw) {
  // Configuration
  const lineWidth = 5
  const radius = 2
  const startAngle = 0
  const endAngle = 2 * Math.PI

  context.lineWidth = lineWidth
  context.strokeStyle = lineColor?.value.hex8
  context.fillStyle = lineColor?.value.hex8

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
function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvas.width, canvas.height)
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

    drawLine({
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
  canvasRef.value?.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('mouseup', mouseUpHandler)
})
onUnmounted(() => {
  canvasRef.value?.removeEventListener('mousemove', mouseMoveHandler)
  window.removeEventListener('mouseup', mouseUpHandler)
})
</script>

<style lang="postcss" scoped></style>
