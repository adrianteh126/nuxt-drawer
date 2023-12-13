export type Draw = {
  context: CanvasRenderingContext2D
  currentPoint: Point
  previousPoint: Point | null
}

export type Point = { x: number; y: number }
