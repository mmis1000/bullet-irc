class AABB
  constructor: (x0, y0, x1, y1)->
    if not (@ instanceof AABB)
      return new AABB x0, y0, x1, y1
    @xMin = if x0 < x1 then x0 else x1
    @xMax = if x0 >= x1 then x0 else x1
    @yMin = if y0 < y1 then y0 else y1
    @yMax = if y0 >= y1 then y0 else y1
  
  overlapWithBoxs: (arr)->
    for box in arr
      if AABB.hasOverlap box, @
        return true
    false
  
  @hasOverlap: (box1, box2)->
  
    if box1.xMax > box2.xMin and box2.xMax > box1.xMin and box1.yMax > box2.yMin and box2.yMax > box1.yMin
      true
    else
      false

@AABB = AABB