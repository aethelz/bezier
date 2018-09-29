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
  // stores html svg object + info about all figures already drawn
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.svgObject = document.createElementNS(SVGNS, "svg");
    this.graphics = [];
    this.svgObject.setAttribute("width", this.width);
    this.svgObject.setAttribute("height", this.height);
    this.state = 0;
    this.figures = [];
  }

  svg() {
    return this.svgObject;
  }

  click(point) {
    try {
      this.figures.slice(-1)[0].addPoint(this, point);
    }
    catch(x)
    {
      // if addPoint method fails, create a new Bezier and repeat
      let type = document.querySelector('#degree').value;
      this.figures.push(new Bezier(type));
      this.click(point);
    }
  }

  edit(point) {
    /*
    for object in this.graphics {
      if object.isPoint() {
        let distance = sqrt(abs(point.x - object.x) +...)
        if distance < 4 {

          return
        }
      }
    }
    */
    throw 'Not Implemented'
  }

  add(node) {
    let fig = this.svgObject.appendChild(node);
    this.graphics.push(fig);
    return fig;
  }

  remove(node) {
    this.svgObject.removeChild(node);
  }

  clear() {
    this.svgObject.innerHTML = '';
    this.graphics = [];
    this.figures = [];
  }
}

class Bezier {
  constructor(type) {
    this.type = type;
    this.points = [];
    this.nodes = {};
  }

  addPoint(svg, point) {
    this.points.push(point);
    let state = this.points.length;
    switch (this.points.length) {
      case 1:
        const p0 = new SVGCircle(point, 4);
        this.nodes.p0 = svg.add(p0.generate());
        break;
      case 2:
        const p1 = new SVGCircle(point, 4);
        this.nodes.p1 = svg.add(p1.generate());
        const line_01 = new SVGLine(new Line(this.points[0], point), 'black');
        this.nodes.line_01 = svg.add(line_01.generate());
        break;
      case 3:
        svg.remove(this.nodes.line_01);

        const p2 = new SVGCircle(point, 2);
        svg.add(p2.generate());

        const line_02 = new SVGLine(new Line(this.points[0], this.points[2]), 'red');
        this.nodes.line_02 = svg.add(line_02.generate());
        const line_03 = new SVGLine(new Line(this.points[1], this.points[2]), 'red');
        this.nodes.line_03 = svg.add(line_03.generate());

        const qb = new QuadraticBezier(this.points[0], this.points[2], this.points[1]);
        const svg_qbezier = new SVGQuadraticBezier(qb);
        this.nodes.quadro = svg.add(svg_qbezier.generate());
        break;
      case 4:
        if (this.type !== 'cubic') throw 'overflow';
        svg.remove(this.nodes.quadro);
        svg.remove(this.nodes.line_03);

        const p3 = new SVGCircle(point, 2);
        svg.add(p3.generate());
        const line_04 = new SVGLine(new Line(this.points[2], this.points[3]), 'red');
        this.nodes.line_04 = svg.add(line_04.generate());
        const line_05 = new SVGLine(new Line(this.points[1], point), 'red');
        this.nodes.line_05 = svg.add(line_05.generate());

        const cb = new CubicBezier(this.points[0], this.points[1], this.points[2], this.points[3]);
        const svg_cbezier = new SVGCubicBezier(cb);
        this.nodes.cubic = svg.add(svg_cbezier.generate());
        break;
      default:
        throw 'overflow';
    }
  }

  editPoint(svg, point) {
    //
    throw 'Not Implemented'
  }

  toString() {
    return `${this.type} spline figure`
  }
}

// functions

function alert_coords(event) {
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

  svg_main.click(svg_point);
}

const svg_main = new SVGField(640, 480);


document.addEventListener('DOMContentLoaded', () => {

  document.body.appendChild(svg_main.svg());

  document.addEventListener("click", alert_coords);

  document.querySelector('#erase').onclick = () => { svg_main.clear(); }
});

