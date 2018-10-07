'use strict';

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
  // contains SVG style specifics, common to all SVG elements
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

    return path;
  }
}

// Composite SVG objects

class PrettyQuadro {
  // composite 'pretty' bezier.
  constructor(svg) {
    this.svg = svg;
    this.points = [];
    this.nodes = {};
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

    const line_02 =
        new SVGLine(new Line(this.points[0], this.points[2]), 'red');
    this.nodes.line_02 = this.svg.add(line_02.generate());
    const line_03 =
        new SVGLine(new Line(this.points[1], this.points[2]), 'red');
    this.nodes.line_03 = this.svg.add(line_03.generate());

    const qb =
        new QuadraticBezier(this.points[0], this.points[2], this.points[1]);
    const svg_qbezier = new SVGQuadraticBezier(qb);
    this.nodes.quadro = this.svg.add(svg_qbezier.generate());
  }

  addPoint(point) {
    switch (this.points.length) {
      case 0:
        this.drawP0(point);
        document.querySelector('#edit').disabled = true;
        break;
      case 1:
        this.drawP1(point);
        break;
      case 2:
        this.drawP2(point);
        document.querySelector('#edit').disabled = false;
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
  }

  toString() {
    return `Quadratic bezier figure`
  }
}

class PrettyCubic extends PrettyQuadro {
  // composite 'pretty' bezier.
  constructor(svg) {
    super(svg);
  }

  drawP3(point) {
    this.points[3] = point;

    this.svg.remove(this.nodes.quadro);
    this.svg.remove(this.nodes.line_03);

    const p3 = new SVGCircle(point, 2);
    this.nodes.p3 = this.svg.add(p3.generate());
    const line_04 =
        new SVGLine(new Line(this.points[2], this.points[3]), 'red');
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
        document.querySelector('#edit').disabled = true;
        break;
      case 1:
        this.drawP1(point);
        break;
      case 2:
        this.drawP2(point);
        break;
      case 3:
        this.drawP3(point);
        document.querySelector('#edit').disabled = false;
        break;
      default:
        throw 'overflow';
    }
  }

  editPoint(old_point, new_point) {
    // takes in old and an edited Point, completely redraws entire figure
    super.editPoint(old_point, new_point);
    this.drawP3(this.points[3]);
  }

  toString() {
    return `Cubic bezier figure`
  }
}

class SVGArea {
  // stores svg object, info about all figures already drawn, mode and so on
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.svgObject = document.createElementNS(SVGNS, 'svg');
    this.svgObject.setAttribute('width', this.width);
    this.svgObject.setAttribute('height', this.height);
    this.svgObject.style.border = 'thin solid #000000';
    this.figures = [];
    this.mode = 0;
    this.editObject = {}; //stores edit information
    this.bezier;
  }

  setBezierType(type) {
    this.bezier = type;
  }

  drawBezier() {
    let type = document.querySelector('#degree').value;

    if (type === 'cubic') {
      this.setBezierType(new PrettyCubic(this));
    } else {
      this.setBezierType(new PrettyQuadro(this));
    }
    this.figures.push(this.bezier);
  }

  svg() {
    return this.svgObject;
  }

  click(point) {
    if (this.figures.length === 0) {
      // empty canvas - create bezier
      this.drawBezier();
      this.figures.slice(-1)[0].addPoint(point);
      return ;
    }

    try {
      this.figures.slice(-1)[0].addPoint(point);
    } catch(err) {
      if (err !== 'overflow') console.log(err);
      // if addPoint method fails with overflow, create a new Bezier and repeat
      // output error info if unexpected error occurs
      this.drawBezier();
      this.click(point);
    }
  }

  add(node) {
    return this.svgObject.appendChild(node);
  }

  remove(node) {
    try {
      this.svgObject.removeChild(node);
    } catch(x) {}
  }

  clear() {
    this.svgObject.innerHTML = '';
    this.figures = [];
  }
}

// globals

const SVGNS = 'http://www.w3.org/2000/svg';
const SVG_MAIN = new SVGArea(800, 600);

// functions

function closestPoint(ref, points) {
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

function clickHandler(event) {
  // recalculating absolute coordinates into relative SVG ones
  let pt = SVG_MAIN.svg().createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;

  let cursorpt = pt.matrixTransform(SVG_MAIN.svg().getScreenCTM().inverse());

  let svg_point = new Point(Math.round(cursorpt.x), Math.round(cursorpt.y));
  if (svg_point.x < 0 || svg_point.y < 0 || svg_point.y > SVG_MAIN.height
      || svg_point.x > SVG_MAIN.width) {
    // making sure that the point clicked is inside SVG bounds, bail otherwise
    return ;
  }

  switch (SVG_MAIN.mode) {
    case 0:
      // normal drawing
      SVG_MAIN.click(svg_point);
      break;
    case 1:
      // EDITMODE - choosing point to change
      let allpoints = SVG_MAIN.figures.reduce((acc, curval) => {
        return acc.concat(curval.points);
      }, []);

      let [clp, cld] = closestPoint(svg_point, allpoints);

      // if point clicked is too far away from all existing geometry - bail
      if (cld > 20) return;

      SVG_MAIN.editObject.clp = clp;
      for (let i = 0; i < SVG_MAIN.figures.length; i++) {
        if (SVG_MAIN.figures[i].points.includes(SVG_MAIN.editObject.clp)) {
          SVG_MAIN.editObject.fig = SVG_MAIN.figures[i];
        }
      }
      const pr = new SVGCircle(clp, 6, 'red');
      SVG_MAIN.editObject.dot = SVG_MAIN.add(pr.generate());
      SVG_MAIN.mode = 2;
      document.getElementById('editstatus').innerHTML =
          'Choose new position for a point';
      break;
    case 2:
      // EDITMODE - choosing a place to move an old point to
      SVG_MAIN.remove(SVG_MAIN.editObject.dot);
      SVG_MAIN.editObject.fig.editPoint(SVG_MAIN.editObject.clp, svg_point);
      document.getElementById('editstatus').innerHTML =
          'Choose a point to change';
      SVG_MAIN.mode = 1;
      break;
    default:
      throw new Error('UNKNOWN MODE');
  }
}

// Main Loop

document.addEventListener('DOMContentLoaded', () => {

  document.body.appendChild(SVG_MAIN.svg());

  document.addEventListener('click', clickHandler);

  document.querySelector('#erase').onclick = () => { SVG_MAIN.clear(); };

  document.querySelector('#edit').onclick = () => {
    if (SVG_MAIN.mode === 0) {
      SVG_MAIN.mode = 1;
      document.getElementById('editstatus').innerHTML =
          'Choose a point to change';
    } else {
      SVG_MAIN.mode = 0;
      document.getElementById('editstatus').innerHTML = 'Draw a curve';
    }
  }
});

