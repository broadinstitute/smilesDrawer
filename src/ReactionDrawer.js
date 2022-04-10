const SvgDrawer = require('./SvgDrawer')
const Options = require('./Options');
const ThemeManager = require('./ThemeManager');

class ReactionDrawer {
    /**
     * The constructor for the class ReactionDrawer.
     *
     * @param {Object} options An object containing reaction drawing specitic options.
     * @param {Object} moleculeOptions An object containing molecule drawing specific options.
     */
    constructor(options, moleculeOptions) {
        this.defaultOptions = {
            scale: 2.0,
            spacing: 15,
            plus: {},
            arrow: {
                length: 50
            }
        }

        this.opts = Options.extend(true, this.defaultOptions, options);

        moleculeOptions.scale = this.opts.scale;
        this.drawer = new SvgDrawer(moleculeOptions);
        this.molOpts = this.drawer.opts;
    }

    /**
   * Draws the parsed reaction smiles data to a canvas element.
   *
   * @param {Object} reaction The reaction object returned by the reaction smiles parser.
   * @param {(String|HTMLElement)} target The id of the HTML canvas element the structure is drawn to - or the element itself.
   * @param {String} themeName='dark' The name of the theme to use. Built-in themes are 'light' and 'dark'.
   * @param {Boolean} infoOnly=false Only output info on the molecule without drawing anything to the canvas.
   */
    draw(reaction, target, textAbove = '{reagents}', textBelow = '', themeName = 'light', infoOnly = false) {
        this.themeManager = new ThemeManager(this.molOpts.themes, themeName);
        let svg = null;

        if (target === null || target === 'svg') {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttributeNS(null, 'width', 500 + '');
            svg.setAttributeNS(null, 'height', 500 + '');
        } else if (typeof target === 'string' || target instanceof String) {
            svg = document.getElementById(target);
        } else {
            svg = target;
        }

        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        let elements = [];

        let maxHeight = 0.0

        // Reactants
        for (var i = 0; i < reaction.reactants.length; i++) {
            if (i > 0) {
                elements.push({
                    width: this.molOpts.fontSizeLarge * this.opts.scale,
                    height: this.molOpts.fontSizeLarge * this.opts.scale,
                    svg: this.getPlus()
                });
            }

            let reactantSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            this.drawer.draw(reaction.reactants[i], reactantSvg, themeName, infoOnly);

            let element = {
                width: reactantSvg.viewBox.baseVal.width * this.opts.scale,
                height: reactantSvg.viewBox.baseVal.height * this.opts.scale,
                svg: reactantSvg
            };

            elements.push(element);

            if (element.height > maxHeight) {
                maxHeight = element.height;
            }
        }

        elements.push({
            width: this.opts.arrow.length * this.opts.scale,
            height: this.molOpts.fontSizeLarge * 0.9 * this.opts.scale,
            svg: this.getArrow()
        });

        // Products
        for (var i = 0; i < reaction.products.length; i++) {
            if (i > 0) {
                elements.push({
                    width: this.molOpts.fontSizeLarge * this.opts.scale,
                    height: this.molOpts.fontSizeLarge * this.opts.scale,
                    svg: this.getPlus()
                });
            }

            let productSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            this.drawer.draw(reaction.products[i], productSvg, themeName, infoOnly);

            let element = {
                width: productSvg.viewBox.baseVal.width * this.opts.scale,
                height: productSvg.viewBox.baseVal.height * this.opts.scale,
                svg: productSvg
            };

            elements.push(element);

            if (element.height > maxHeight) {
                maxHeight = element.height;
            }
        }

        let totalWidth = 0.0;

        elements.forEach(element => {
            element.svg.setAttributeNS(null, 'x', totalWidth);
            element.svg.setAttributeNS(null, 'y', (maxHeight - element.height) / 2.0);
            element.svg.setAttributeNS(null, 'width', element.width);
            element.svg.setAttributeNS(null, 'height', element.height);
            svg.appendChild(element.svg);

            totalWidth += element.width + this.opts.spacing;
        });

        svg.setAttributeNS(null, 'viewBox', `0 0 ${totalWidth} ${maxHeight}`);

        return svg;
    }

    getPlus() {
        let s = this.molOpts.fontSizeLarge * 0.9;
        let w = s / 10.0;
        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let rect_h = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        let rect_v = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        svg.setAttributeNS(null, 'id', 'plus');

        rect_h.setAttributeNS(null, 'x', 0);
        rect_h.setAttributeNS(null, 'y', s / 2.0 - w / 2.0);
        rect_h.setAttributeNS(null, 'width', s);
        rect_h.setAttributeNS(null, 'height', w);
        rect_h.setAttributeNS(null, 'fill', this.themeManager.getColor("C"));

        rect_v.setAttributeNS(null, 'x', s / 2.0 - w / 2.0);
        rect_v.setAttributeNS(null, 'y', 0);
        rect_v.setAttributeNS(null, 'width', w);
        rect_v.setAttributeNS(null, 'height', s);
        rect_v.setAttributeNS(null, 'fill', this.themeManager.getColor("C"));

        svg.appendChild(rect_h);
        svg.appendChild(rect_v);
        svg.setAttributeNS(null, 'viewBox', `0 0 ${s} ${s}`);

        return svg;
    }

    getArrowhead() {
        let s = this.molOpts.fontSizeLarge * 0.9;
        let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

        marker.setAttributeNS(null, 'id', 'arrowhead');
        marker.setAttributeNS(null, 'viewBox', `0 0 ${s} ${s}`);
        marker.setAttributeNS(null, 'markerUnits', 'userSpaceOnUse');
        marker.setAttributeNS(null, 'markerWidth', s);
        marker.setAttributeNS(null, 'markerHeight', s);
        marker.setAttributeNS(null, 'refX', 0);
        marker.setAttributeNS(null, 'refY', s / 2);
        marker.setAttributeNS(null, 'orient', 'auto');
        marker.setAttributeNS(null, 'fill', this.themeManager.getColor("C"));

        polygon.setAttributeNS(null, 'points', `0 0, ${s} ${s / 2}, 0 ${s}`)

        marker.appendChild(polygon);

        return marker;
    }

    getArrow() {
        let s = this.molOpts.fontSizeLarge * 0.9;
        let w = s / 10.0;
        let l = this.opts.arrow.length;

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        defs.appendChild(this.getArrowhead());
        svg.appendChild(defs);

        svg.setAttributeNS(null, 'id', 'arrow');

        line.setAttributeNS(null, 'x1', 0);
        line.setAttributeNS(null, 'y1', w / 2.0);
        line.setAttributeNS(null, 'x2', l);
        line.setAttributeNS(null, 'y2', w / 2.0);
        line.setAttributeNS(null, 'stroke-width', w);
        line.setAttributeNS(null, 'stroke', this.themeManager.getColor("C"));
        line.setAttributeNS(null, 'marker-end', 'url(#arrowhead)');

        svg.appendChild(line);
        svg.setAttributeNS(null, 'viewBox', `0 ${-s / 2.0} ${l + s} ${s}`);

        return svg;
    }
}

module.exports = ReactionDrawer;
