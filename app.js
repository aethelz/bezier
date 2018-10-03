// globals

const SVGNS = "http://www.w3.org/2000/svg";

// Base geometry primitives

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `Point (${this.x}, ${this.y})`;
  }
}

class Line {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  toString() {
    return `Line (${this.p1}, ${this.p2})`;
  }
}

class QuadraticBezier {
  constructor(origin_point, end_point, cp1) {
    this.origin = origin_point;
    this.end = end_point;
    this.cp1 = cp1;
  }

  toString() {
    return `Quadratic Bezier Curve ${this.cp1}`;
  }
}

class CubicBezier extends QuadraticBezier {
  constructor(origin_point, end_point, cp1, cp2) {
    super(origin_point, end_point, cp1);
    this.cp2 = cp2;
  }

  toString() {
    return `Cubic Bezier Curve ${this.cp1} ${this.cp2}`;
  }
}

// SVG-specific classes

class SVGElement {
  constructor(stroke='black', stroke_width='1', fill='none') {
    this.stroke = stroke;
    this.stroke_width = stroke_width;
    this.fill = fill;
  }

  setStyle(element) {
    element.setAttribute('stroke', this.stroke);
    element.setAttribute('stroke-width', this.stroke_width);
    element.setAttribute('fill', this.fill);

  }

  toString() {
    return `Style (${this.stroke}, ${this.stroke_width})`;
  }
}

class SVGLine extends SVGElement {
  constructor(line, stroke='black', stroke_width='1', fill='none') {
    super(stroke, stroke_width, fill);
    this.line = line;
  }

  toString() {
    return `Line at (${this.line},${this.line})`;
  }

  generate() {
    let line = document.createElementNS(SVGNS, 'line');

    line.setAttribute('x1', this.line.p1.x);
    line.setAttribute('x2', this.line.p2.x);
    line.setAttribute('y1', this.line.p1.y);
    line.setAttribute('y2', this.line.p2.y);
    this.setStyle(line);

    return line;
  }
}

class SVGCircle extends SVGElement {
  constructor(point, r='1', stroke='black', stroke_width='1', fill='none') {
    super(stroke, stroke_width, fill);
    this.point = point;
    this.r = r;
  }

  toString() {
    return `Circle R${this.r} with origin at (${this.point.x},${this.point.y})`;
  }

  generate() {
    let circle = document.createElementNS(SVGNS, 'circle');

    circle.setAttribute('cx', this.point.x);
    circle.setAttribute('cy', this.point.y);
    circle.setAttribute('r', this.r);
    this.setStyle(circle);

    return circle;
  }
}

class SVGQuadraticBezier extends SVGElement {
  constructor(bezier, stroke='black', stroke_width='1', fill='none') {
    super(stroke, stroke_width, fill);

    this.bezier = bezier;
    this.stroke = stroke;
    this.stroke_width = stroke_width;
    this.fill = fill;
    this.d = `M${this.bezier.origin.x} ${this.bezier.origin.y}`
           + `Q ${this.bezier.end.x} ${this.bezier.end.y} ${this.bezier.cp1.x} `
           + `${this.bezier.cp1.y}`;
  }

  toString() {
    return `Quadratic Bezier Curve ${this.d}`;
  }

  generate() {
    let path = document.createElementNS(SVGNS, 'path');

    path.setAttribute('d', this.d);
    this.setStyle(path);

    return path;
  }
}

class SVGCubicBezier extends SVGElement {
  constructor(bezier, stroke='black', stroke_width='1', fill='none') {
    super(stroke, stroke_width, fill);

    this.bezier = bezier;
    this.stroke = stroke;
    this.stroke_width = stroke_width;
    this.fill = fill;
    this.d = `M${this.bezier.origin.x} ${this.bezier.origin.y}`
           + `C ${this.bezier.cp1.x} ${this.bezier.cp1.y} ${this.bezier.cp2.x} `
           + `${this.bezier.cp2.y} ${this.bezier.end.x} ${this.bezier.end.y}`;
  }

  toString() {
    return `Quadratic Bezier Curve ${this.d}`;
  }

  generate() {
    let path = document.createElementNS(SVGNS, 'path');

    path.setAttribute('d', this.d);
    this.setStyle(path);

    return path
  }
}

// Composite SVG objects

class SVGField {
  // stores html svg object, info about all figures already drawn, mode and so on
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.svgObject = document.createElementNS(SVGNS, "svg");
    this.svgObject.setAttribute("width", this.width);
    this.svgObject.setAttribute("height", this.height);
    this.svgObject.style.border = "thin solid #000000";
    this.figures = [];
    this.mode = 0;
    this.editObject = []; //stores bezier and a Point that the user is changing
  }

  svg() {
    return this.svgObject;
  }

  click(point) {
    try {
      this.figures.slice(-1)[0].addPoint(point);
    }
    catch(err)
    {
      // if addPoint method fails, create a new Bezier and repeat
      let type = document.querySelector('#degree').value;
      this.figures.push(new Bezier(this, type));
      this.click(point);
    }
  }

  add(node) {
    return this.svgObject.appendChild(node);
  }

  remove(node) {
    try {
      this.svgObject.removeChild(node);
    }
    catch(x) {}
  }

  clear() {
    this.svgObject.innerHTML = '';
    this.figures = [];
  }
}

class Bezier {
  // composite "pretty" bezier
  constructor(svg, type) {
    this.type = type;
    this.svg = svg;
    this.points = [];
    this.nodes = {};
  }

  complete() {
    if ( (this.type === 'cubic' && this.points.length === 4)
         || (this.type !== 'cubic' && this.points.length === 3) ) {
      return true;
    }

    return false;
  }

  drawP0(point) {
    this.points[0] = point;

    const p0 = new SVGCircle(point, 4);
    this.nodes.p0 = this.svg.add(p0.generate());
  }

  drawP1(point) {
    this.points[1] = point;

    const p1 = new SVGCircle(point, 4);
    this.nodes.p1 = this.svg.add(p1.generate());
    const line_01 = new SVGLine(new Line(this.points[0], point), 'black');
    this.nodes.line_01 = this.svg.add(line_01.generate());
  }

  drawP2(point) {
    this.points[2] = point;

    this.svg.remove(this.nodes.line_01);

    const p2 = new SVGCircle(point, 2);
    this.nodes.p2 = this.svg.add(p2.generate());

    const line_02 = new SVGLine(new Line(this.points[0], this.points[2]), 'red');
    this.nodes.line_02 = this.svg.add(line_02.generate());
    const line_03 = new SVGLine(new Line(this.points[1], this.points[2]), 'red');
    this.nodes.line_03 = this.svg.add(line_03.generate());

    const qb = new QuadraticBezier(this.points[0], this.points[2], this.points[1]);
    const svg_qbezier = new SVGQuadraticBezier(qb);
    this.nodes.quadro = this.svg.add(svg_qbezier.generate());
  }

  drawP3(point) {
    this.points[3] = point;

    this.svg.remove(this.nodes.quadro);
    this.svg.remove(this.nodes.line_03);

    const p3 = new SVGCircle(point, 2);
    this.nodes.p3 = this.svg.add(p3.generate());
    const line_04 = new SVGLine(new Line(this.points[2], this.points[3]), 'red');
    this.nodes.line_04 = this.svg.add(line_04.generate());
    const line_05 = new SVGLine(new Line(this.points[1], point), 'red');
    this.nodes.line_05 = this.svg.add(line_05.generate());

    const cb = new CubicBezier(
      this.points[0], this.points[1], this.points[2], this.points[3],
    );
    const svg_cbezier = new SVGCubicBezier(cb);
    this.nodes.cubic = this.svg.add(svg_cbezier.generate());
  }

  addPoint(point) {
    switch (this.points.length) {
      case 0:
        this.drawP0(point);
        break;
      case 1:
        this.drawP1(point);
        break;
      case 2:
        this.drawP2(point);
        break;
      case 3:
        if (this.type !== 'cubic') throw 'overflow';
        this.drawP3(point);
        break;
      default:
        throw 'overflow';
    }
  }

  clear() {
    for (let key in this.nodes) {
      this.svg.remove(this.nodes[key]);
    }
  }

  editPoint(old_point, new_point) {
    // takes in old and an edited Point, completely redraws entire figure
    this.points[this.points.indexOf(old_point)] = new_point;
    this.clear();
    this.drawP0(this.points[0]);
    this.drawP1(this.points[1]);
    this.drawP2(this.points[2]);
    if (this.type === 'cubic') this.drawP3(this.points[3]);
  }

  toString() {
    return `${this.type} spline figure`
  }
}

// functions

function closest_point(ref, points) {
  // (ref: Point, points: [Point] -> [Point, float]
  // takes in a reference Point, and an Array of Points, returns one Point
  // closest to the reference and a resulting distance between the two

  function dist(point) {
    // shortest distance calculator
    return Math.sqrt(Math.pow((ref.x - point.x), 2)
         + Math.pow((ref.y - point.y), 2));
  }

  let distances = points.map(dist);
  let smallest = Math.min(...distances);

  return [points[distances.indexOf(smallest)], smallest]
}

function alert_coords(event) {
  // recalculating absolute coordinates into relative SVG ones
  let pt = svg_main.svg().createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;

  let cursorpt = pt.matrixTransform(svg_main.svg().getScreenCTM().inverse());

  let svg_point = new Point(Math.round(cursorpt.x), Math.round(cursorpt.y));
  if (svg_point.x < 0 || svg_point.y < 0 || svg_point.y > svg_main.height
      || svg_point.x > svg_main.width) {
    // making sure that the point clicked is inside SVG bounds, bail otherwise
    return ;
  }

  switch (svg_main.mode) {
    case 0:
      // normal drawing
      svg_main.click(svg_point);
      break;
    case 1:
      // EDITMODE - choosing point to change
      let allpoints = svg_main.figures.reduce((acc, curval) => {
        return acc.concat(curval.points);
      }, []);

      let [clp, cld] = closest_point(svg_point, allpoints);

      // if point clicked is too far away from all existing geometry - bail
      if (cld > 20) return;

      svg_main.editObject[1] = clp;
      for (let i = 0; i < svg_main.figures.length; i++) {
        if (svg_main.figures[i].points.includes(svg_main.editObject[1])) {
          svg_main.editObject[0] = svg_main.figures[i];
        }
      }
      const pr = new SVGCircle(clp, 6, 'red');
     // this.nodes.p2 = this.svg.add(p2.generate());
      svg_main.editObject[2] = svg_main.add(pr.generate());
      svg_main.mode = 2;
      document.getElementById('editstatus').innerHTML = 'Choose a new position for a point';
      break;
    case 2:
      // EDITMODE - choosing a place to move an old point to
      svg_main.remove(svg_main.editObject[2]);
      svg_main.editObject[0].editPoint(svg_main.editObject[1], svg_point);
      document.getElementById('editstatus').innerHTML = 'Choose a point to change';
      svg_main.mode = 1;
      break;
  }
}

const svg_main = new SVGField(800, 600);

document.addEventListener('DOMContentLoaded', () => {

  document.body.appendChild(svg_main.svg());

  document.addEventListener("click", alert_coords);

  document.querySelector('#erase').onclick = () => { svg_main.clear(); };

  document.querySelector('#edit').onclick = () => {
    if (svg_main.figures.length > 0 && !svg_main.figures[svg_main.figures.length - 1].complete()) {
      document.getElementById('editstatus').innerHTML = 'Please, finish drawing first';
      return ;
    }
    if (svg_main.mode === 0) {
      svg_main.mode = 1;
      document.getElementById('editstatus').innerHTML = 'Choose a point to change';
    } else {
      svg_main.mode = 0;
      document.getElementById('editstatus').innerHTML = 'Draw a spline';
    }
  }
});

