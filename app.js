const svgns = "http://www.w3.org/2000/svg";
let svg = document.createElementNS(svgns, "svg");
let svg_figures = [];
let point_array = [];
const width = 640;
const height = 480;

// Base geometry primitives

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `Point (${this.x}, ${this.y})`
  }
}

class Line {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  toString() {
    return `Line (${this.p1}, ${this.p2})`
  }
}

class QuadraticBezier {
  constructor(origin_point=new Point(0,0), end_point, cp1) {
    this.origin = origin_point;
    this.end = end_point;
    this.cp1 = cp1;
  }

  toString() {
    return `Quadratic Bezier Curve ${this.cp1}`
  }
}

class CubicBezier extends QuadraticBezier {
  constructor(origin_point=new Point(0,0), end_point, cp1, cp2) {
    super(origin_point, end_point, cp1);
    this.cp2 = cp2;
  }

  toString() {
    return `Cubic Bezier Curve ${this.cp1} ${this.cp2}`
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
    return `Style (${this.stroke}, ${this.stroke_width})`
  }
}

class SVGLine extends SVGElement {
  constructor(line, stroke='black', stroke_width='1', fill='none') {
    super(stroke, stroke_width, fill);
    this.line = line;
  }

  toString() {
    return `Line at (${this.line},${this.line})`
  }

  generate() {
    let line = document.createElementNS(svgns, 'line');

    line.setAttribute('x1', this.line.p1.x);
    line.setAttribute('x2', this.line.p2.x);
    line.setAttribute('y1', this.line.p1.y);
    line.setAttribute('y2', this.line.p2.y);
    this.setStyle(line);

    return line
  }
}
class SVGCircle extends SVGElement {
  constructor(point, r='1', stroke='black', stroke_width='1', fill='none') {
    super(stroke, stroke_width, fill);
    this.point = point;
    this.r = r;
  }

  toString() {
    return `Circle R${this.r} with origin at (${this.point.x},${this.point.y})`
  }

  generate() {
    let circle = document.createElementNS(svgns, 'circle');

    circle.setAttribute('cx', this.point.x);
    circle.setAttribute('cy', this.point.y);
    circle.setAttribute('r', this.r);
    this.setStyle(circle);

    return circle
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
           + `${this.bezier.cp1.y}`
  }

  toString() {
    return `Quadratic Bezier Curve ${this.d}`
  }

  generate() {
    let path = document.createElementNS(svgns, 'path');

    path.setAttribute('d', this.d);
    this.setStyle(path);

    return path
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
           + `${this.bezier.cp2.y} ${this.bezier.end.x} ${this.bezier.end.y}`
  }

  toString() {
    return `Quadratic Bezier Curve ${this.d}`
  }

  generate() {
    let path = document.createElementNS(svgns, 'path');

    path.setAttribute('d', this.d);
    this.setStyle(path);

    return path
  }
}

// Composite SVG objects

class PrettyQuadro {
  constructor(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.parts = [];
  }

  draw(svg_object) {
    const bezier = new QuadraticBezier(this.p1, this.p2, this.p3);

    const svg_bezier = new SVGQuadraticBezier(bezier);
    const svg_start = new SVGCircle(this.p1, 4);
    const svg_end = new SVGCircle(this.p2, 2);
    const svg_control_01 = new SVGCircle(this.p3, 4);
    const svg_line_01 = new SVGLine(new Line(this.p1, this.p2), 'red');
    const svg_line_02 = new SVGLine(new Line(this.p2, this.p3), 'red');

    let elements = [
      svg_bezier.generate(),
      svg_start.generate(),
      svg_end.generate(),
      svg_control_01.generate(),
      svg_line_01.generate(),
      svg_line_02.generate(),
    ];

    for (let i = 0; i < elements.length; i++) {
      this.parts.push(svg_object.appendChild(elements[i]))
    }
  }

   erase(svg_object) {
    for (let i = 0; i < this.parts.length; i++) {
      svg_object.removeChild(this.parts[i]);
    }
    this.parts = [];
   }

}

class PrettyCubic extends PrettyQuadro {
  constructor(p1, p2, p3, p4) {
    super(p1, p2, p3);
    this.p4 = p4;
  }

  draw(svg_object) {
    const bezier = new CubicBezier(this.p1, this.p2, this.p3, this.p4);

    const svg_bezier = new SVGCubicBezier(bezier);
    const svg_start = new SVGCircle(this.p1, 4);
    const svg_end = new SVGCircle(this.p2, 4);
    const svg_control_01 = new SVGCircle(this.p3, 2);
    const svg_control_02 = new SVGCircle(this.p4, 2);
    const svg_line_01 = new SVGLine(new Line(this.p1, this.p3), 'red');
    const svg_line_02 = new SVGLine(new Line(this.p3, this.p4), 'red');
    const svg_line_03 = new SVGLine(new Line(this.p4, this.p2), 'red');

    let elements = [
      svg_bezier.generate(),
      svg_start.generate(),
      svg_end.generate(),
      svg_control_01.generate(),
      svg_control_02.generate(),
      svg_line_01.generate(),
      svg_line_02.generate(),
      svg_line_03.generate(),
    ];

    for (let i = 0; i < elements.length; i++) {
      svg_object.appendChild(elements[i]);
    }

  }
}

function alert_coords(event) {
  let pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;

  let cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());

  let svg_point = new Point(Math.round(cursorpt.x), Math.round(cursorpt.y));
  if (svg_point.x < 0 || svg_point.y < 0 || svg_point.y > height || svg_point.x > width) {
    return ;
  }

  point_array.push(svg_point);
  const type = document.querySelector('#degree').value;

  if (type ==='cubic') {
    if (point_array.length === 4) {
      let fig = new PrettyCubic(point_array[0], point_array[1], point_array[2], point_array[3]);
      fig.draw(svg);
      svg_figures.pop().erase(svg);
      svg_figures.push(fig);
      point_array = [];
    }
    if (point_array.length === 3) {
      let fig = new PrettyQuadro(point_array[0], point_array[2], point_array[1]);
      fig.draw(svg);
      svg_figures.push(fig);

    }
  } else {
    if (point_array.length === 3) {
      let fig = new PrettyQuadro(point_array[0], point_array[2], point_array[1]);
      fig.draw(svg);
      svg_figures.push(fig);
      point_array = [];
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  document.body.appendChild(svg);
  document.addEventListener("click", alert_coords);

  document.querySelector('#erase').onclick = () => {
    svg.innerHTML = '';
    point_array = [];
    svg_figures = [];
  }
});
