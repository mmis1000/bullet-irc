(function() {
  var AABB;

  AABB = (function() {
    function AABB(x0, y0, x1, y1) {
      if (!(this instanceof AABB)) {
        return new AABB(x0, y0, x1, y1);
      }
      this.xMin = x0 < x1 ? x0 : x1;
      this.xMax = x0 >= x1 ? x0 : x1;
      this.yMin = y0 < y1 ? y0 : y1;
      this.yMax = y0 >= y1 ? y0 : y1;
    }

    AABB.prototype.overlapWithBoxs = function(arr) {
      var box, _i, _len;
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        box = arr[_i];
        if (AABB.hasOverlap(box, this)) {
          return true;
        }
      }
      return false;
    };

    AABB.hasOverlap = function(box1, box2) {
      if (box1.xMax > box2.xMin && box2.xMax > box1.xMin && box1.yMax > box2.yMin && box2.yMax > box1.yMin) {
        return true;
      } else {
        return false;
      }
    };

    return AABB;

  })();

  this.AABB = AABB;

}).call(this);
