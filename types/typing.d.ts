export type Draw = {
  context: CanvasRenderingContext2D
  currentPoint: Point
  previousPoint: Point | null
  lineColor?: Ref<T> | string
}

export type Point = { x: number; y: number }
