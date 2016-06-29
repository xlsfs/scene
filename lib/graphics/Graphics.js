"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Point_1 = require("@awayjs/core/lib/geom/Point");
var Box_1 = require("@awayjs/core/lib/geom/Box");
var Matrix_1 = require("@awayjs/core/lib/geom/Matrix");
var AssetBase_1 = require("@awayjs/core/lib/library/AssetBase");
var Sampler2D_1 = require("@awayjs/core/lib/image/Sampler2D");
var AttributesView_1 = require("@awayjs/core/lib/attributes/AttributesView");
var Byte4Attributes_1 = require("@awayjs/core/lib/attributes/Byte4Attributes");
var Float2Attributes_1 = require("@awayjs/core/lib/attributes/Float2Attributes");
var TriangleElements_1 = require("../graphics/TriangleElements");
var Graphic_1 = require("../graphics/Graphic");
var Style_1 = require("../base/Style");
var ElementsEvent_1 = require("../events/ElementsEvent");
var StyleEvent_1 = require("../events/StyleEvent");
var GraphicsPath_1 = require("../draw/GraphicsPath");
var GraphicsFactoryFills_1 = require("../draw/GraphicsFactoryFills");
var GraphicsFactoryStrokes_1 = require("../draw/GraphicsFactoryStrokes");
var PartialImplementationError_1 = require("@awayjs/core/lib/errors/PartialImplementationError");
var JointStyle_1 = require("../draw/JointStyle");
var CapsStyle_1 = require("../draw/CapsStyle");
var GraphicsStrokeStyle_1 = require("../draw/GraphicsStrokeStyle");
var GraphicsFillStyle_1 = require("../draw/GraphicsFillStyle");
var DefaultMaterialManager_1 = require("../managers/DefaultMaterialManager");
;
/**
 *
 * Graphics is a collection of SubGeometries, each of which contain the actual geometrical data such as vertices,
 * normals, uvs, etc. It also contains a reference to an animation class, which defines how the geometry moves.
 * A Graphics object is assigned to a Sprite, a scene graph occurence of the geometry, which in turn assigns
 * the SubGeometries to its respective TriangleGraphic objects.
 *
 *
 *
 * @see away.core.base.SubGraphics
 * @see away.entities.Sprite
 *
 * @class Graphics
 */
var Graphics = (function (_super) {
    __extends(Graphics, _super);
    /**
     * Creates a new Graphics object.
     */
    function Graphics() {
        var _this = this;
        _super.call(this);
        this._boxBoundsInvalid = true;
        this._sphereBoundsInvalid = true;
        this._graphics = new Array();
        this._current_position = new Point_1.Point();
        this._current_position = new Point_1.Point();
        this._queued_fill_pathes = [];
        this._queued_stroke_pathes = [];
        this._active_fill_path = null;
        this._active_stroke_path = null;
        this._onInvalidatePropertiesDelegate = function (event) { return _this._onInvalidateProperties(event); };
        this._onInvalidateVerticesDelegate = function (event) { return _this._onInvalidateVertices(event); };
    }
    Object.defineProperty(Graphics.prototype, "assetType", {
        get: function () {
            return Graphics.assetType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graphics.prototype, "count", {
        get: function () {
            return this._graphics.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graphics.prototype, "animator", {
        /**
         * Defines the animator of the graphics object.  Default value is <code>null</code>.
         */
        get: function () {
            return this._animator;
        },
        set: function (value) {
            this._animator = value;
            var len = this._graphics.length;
            var graphic;
            for (var i = 0; i < len; ++i) {
                graphic = this._graphics[i];
                // cause material to be unregistered and registered again to work with the new animation type (if possible)
                if (graphic.material) {
                    graphic.material.iRemoveOwner(graphic);
                    graphic.material.iAddOwner(graphic);
                }
                //invalidate any existing graphic objects in case they need to pull new elements
                graphic.invalidateElements();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graphics.prototype, "style", {
        /**
         *
         */
        get: function () {
            return this._style;
        },
        set: function (value) {
            if (this._style == value)
                return;
            if (this._style)
                this._style.removeEventListener(StyleEvent_1.StyleEvent.INVALIDATE_PROPERTIES, this._onInvalidatePropertiesDelegate);
            this._style = value;
            if (this._style)
                this._style.addEventListener(StyleEvent_1.StyleEvent.INVALIDATE_PROPERTIES, this._onInvalidatePropertiesDelegate);
            this._iInvalidateSurfaces();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graphics.prototype, "queued_stroke_pathes", {
        get: function () {
            return this._queued_stroke_pathes;
        },
        set: function (value) {
            this._queued_stroke_pathes = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graphics.prototype, "queued_fill_pathes", {
        get: function () {
            return this._queued_fill_pathes;
        },
        set: function (value) {
            this._queued_fill_pathes = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Graphics.prototype, "material", {
        /**
         * The material with which to render the Graphics.
         */
        get: function () {
            return this._material;
        },
        set: function (value) {
            if (value == this._material)
                return;
            var i;
            var len = this._graphics.length;
            var graphic;
            if (this._material)
                for (i = 0; i < len; i++)
                    if (!(graphic = this._graphics[i])._iGetExplicitMaterial())
                        this._material.iRemoveOwner(graphic);
            this._material = value;
            if (this._material)
                for (i = 0; i < len; i++)
                    if (!(graphic = this._graphics[i])._iGetExplicitMaterial())
                        this._material.iAddOwner(graphic);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a GraphicBase wrapping a Elements.
     *
     * @param elements
     */
    Graphics.prototype.addGraphic = function (elements, material, style, count, offset) {
        if (material === void 0) { material = null; }
        if (style === void 0) { style = null; }
        if (count === void 0) { count = 0; }
        if (offset === void 0) { offset = 0; }
        var graphic;
        if (Graphic_1.Graphic._available.length) {
            graphic = Graphic_1.Graphic._available.pop();
            graphic._iIndex = this._graphics.length;
            graphic.parent = this;
            graphic.elements = elements;
            graphic.material = material;
            graphic.style = style;
            graphic.count = count;
            graphic.offset = offset;
        }
        else {
            graphic = new Graphic_1.Graphic(this._graphics.length, this, elements, material, style, count, offset);
        }
        this._graphics.push(graphic);
        graphic.addEventListener(ElementsEvent_1.ElementsEvent.INVALIDATE_VERTICES, this._onInvalidateVerticesDelegate);
        this.invalidate();
        return graphic;
    };
    Graphics.prototype.removeGraphic = function (graphic) {
        this._graphics.splice(this._graphics.indexOf(graphic), 1);
        graphic.removeEventListener(ElementsEvent_1.ElementsEvent.INVALIDATE_VERTICES, this._onInvalidateVerticesDelegate);
        graphic.elements = null;
        graphic.material = null;
        graphic.style = null;
        graphic.clear();
        this.invalidate();
    };
    Graphics.prototype.getGraphicAt = function (index) {
        return this._graphics[index];
    };
    Graphics.prototype.applyTransformation = function (transform) {
        var len = this._graphics.length;
        for (var i = 0; i < len; ++i)
            this._graphics[i].applyTransformation(transform);
    };
    Graphics.prototype.copyTo = function (graphics) {
        graphics.material = this._material;
        graphics.style = this.style;
        graphics.particles = this.particles;
        graphics.numParticles = this.numParticles;
        var graphic;
        var len = this._graphics.length;
        for (var i = 0; i < len; ++i) {
            graphic = this._graphics[i];
            graphics.addGraphic(graphic.elements, graphic._iGetExplicitMaterial(), graphic._iGetExplicitStyle(), graphic.count, graphic.offset);
        }
        if (this._animator)
            graphics.animator = this._animator.clone();
    };
    Graphics.prototype.clone = function () {
        var newInstance = new Graphics();
        this.copyTo(newInstance);
        return newInstance;
    };
    /**
     * Scales the geometry.
     * @param scale The amount by which to scale.
     */
    Graphics.prototype.scale = function (scale) {
        var len = this._graphics.length;
        for (var i = 0; i < len; ++i)
            this._graphics[i].scale(scale);
    };
    Graphics.prototype.clear = function () {
        for (var i = this._graphics.length - 1; i >= 0; i--) {
            this._graphics[i].clear();
        }
    };
    /**
     * Clears all resources used by the Graphics object, including SubGeometries.
     */
    Graphics.prototype.dispose = function () {
        this.material = null;
        for (var i = this._graphics.length - 1; i >= 0; i--)
            this._graphics[i].dispose();
        if (this._animator)
            this._animator.dispose();
    };
    /**
     * Scales the uv coordinates (tiling)
     * @param scaleU The amount by which to scale on the u axis. Default is 1;
     * @param scaleV The amount by which to scale on the v axis. Default is 1;
     */
    Graphics.prototype.scaleUV = function (scaleU, scaleV) {
        if (scaleU === void 0) { scaleU = 1; }
        if (scaleV === void 0) { scaleV = 1; }
        var len = this._graphics.length;
        for (var i = 0; i < len; ++i)
            this._graphics[i].scaleUV(scaleU, scaleV);
    };
    Graphics.prototype.getBoxBounds = function () {
        if (this._boxBoundsInvalid) {
            this._boxBoundsInvalid = false;
            if (!this._boxBounds)
                this._boxBounds = new Box_1.Box();
            if (this._graphics.length) {
                this._boxBounds.setBoundIdentity();
                var len = this._graphics.length;
                for (var i = 0; i < len; i++)
                    this._boxBounds = this._boxBounds.union(this._graphics[i].getBoxBounds(), this._boxBounds);
            }
            else {
                this._boxBounds.setEmpty();
            }
        }
        return this._boxBounds;
    };
    Graphics.prototype.getSphereBounds = function (center, target) {
        if (target === void 0) { target = null; }
        var len = this._graphics.length;
        for (var i = 0; i < len; i++)
            target = this._graphics[i].getSphereBounds(center, target);
        return target;
    };
    Graphics.prototype.invalidate = function () {
        _super.prototype.invalidate.call(this);
        this._boxBoundsInvalid = true;
        this._sphereBoundsInvalid = true;
    };
    Graphics.prototype._iInvalidateSurfaces = function () {
        var len = this._graphics.length;
        for (var i = 0; i < len; ++i)
            this._graphics[i].invalidateSurface();
    };
    Graphics.prototype.invalidateElements = function () {
        var len = this._graphics.length;
        for (var i = 0; i < len; ++i)
            this._graphics[i].invalidateElements();
    };
    Graphics.prototype._hitTestPointInternal = function (x, y) {
        //TODO: handle lines as well
        var len = this._graphics.length;
        for (var i = 0; i < len; i++)
            if (this._graphics[i].hitTestPoint(x, y, 0))
                return true;
        return false;
    };
    Graphics.prototype.acceptTraverser = function (traverser) {
        var len = this._graphics.length;
        for (var i = 0; i < len; i++)
            traverser.applyRenderable(this._graphics[i]);
    };
    Graphics.prototype._onInvalidateProperties = function (event) {
        this._iInvalidateSurfaces();
    };
    Graphics.prototype._onInvalidateVertices = function (event) {
        if (event.attributesView != event.target.positions)
            return;
        this.invalidate();
    };
    Graphics.prototype.draw_fills = function () {
        GraphicsFactoryFills_1.GraphicsFactoryFills.draw_pathes(this);
    };
    Graphics.prototype.draw_strokes = function () {
        var final_vert_list = [];
        GraphicsFactoryStrokes_1.GraphicsFactoryStrokes.draw_pathes(this.queued_stroke_pathes, final_vert_list);
        this.queued_stroke_pathes.length = 0;
        var attributesView = new AttributesView_1.AttributesView(Float32Array, 3);
        attributesView.set(final_vert_list);
        var attributesBuffer = attributesView.attributesBuffer;
        attributesView.dispose();
        var elements = new TriangleElements_1.TriangleElements(attributesBuffer);
        elements.setPositions(new Float2Attributes_1.Float2Attributes(attributesBuffer));
        elements.setCustomAttributes("curves", new Byte4Attributes_1.Byte4Attributes(attributesBuffer, false));
        //elements.setUVs(new Float2Attributes(attributesBuffer));
        //curve_sub_geom.setUVs(new Float2Attributes(attributesBuffer));
        var material = DefaultMaterialManager_1.DefaultMaterialManager.getDefaultMaterial();
        material.bothSides = true;
        material.useColorTransform = true;
        material.curves = true;
        var sampler = new Sampler2D_1.Sampler2D();
        var graphic = this.addGraphic(elements, material);
        if (graphic) {
            graphic.style = new Style_1.Style();
            graphic.style.addSamplerAt(sampler, graphic.material.getTextureAt(0));
            //sampler.imageRect = new Rectangle(0, 0, 0.5, 0.5);
            graphic.style.uvMatrix = new Matrix_1.Matrix(0, 0, 0, 0, 0.126, 0);
            graphic.material.animateUVs = true;
        }
    };
    /**
     * Fills a drawing area with a bitmap image. The bitmap can be repeated or
     * tiled to fill the area. The fill remains in effect until you call the
     * <code>beginFill()</code>, <code>beginBitmapFill()</code>,
     * <code>beginGradientFill()</code>, or <code>beginShaderFill()</code>
     * method. Calling the <code>clear()</code> method clears the fill.
     *
     * <p>The application renders the fill whenever three or more points are
     * drawn, or when the <code>endFill()</code> method is called. </p>
     *
     * @param bitmap A transparent or opaque bitmap image that contains the bits
     *               to be displayed.
     * @param matrix A matrix object(of the flash.geom.Matrix class), which you
     *               can use to define transformations on the bitmap. For
     *               example, you can use the following matrix to rotate a bitmap
     *               by 45 degrees(pi/4 radians):
     * @param repeat If <code>true</code>, the bitmap image repeats in a tiled
     *               pattern. If <code>false</code>, the bitmap image does not
     *               repeat, and the edges of the bitmap are used for any fill
     *               area that extends beyond the bitmap.
     *
     *               <p>For example, consider the following bitmap(a 20 x
     *               20-pixel checkerboard pattern):</p>
     *
     *               <p>When <code>repeat</code> is set to <code>true</code>(as
     *               in the following example), the bitmap fill repeats the
     *               bitmap:</p>
     *
     *               <p>When <code>repeat</code> is set to <code>false</code>,
     *               the bitmap fill uses the edge pixels for the fill area
     *               outside the bitmap:</p>
     * @param smooth If <code>false</code>, upscaled bitmap images are rendered
     *               by using a nearest-neighbor algorithm and look pixelated. If
     *               <code>true</code>, upscaled bitmap images are rendered by
     *               using a bilinear algorithm. Rendering by using the nearest
     *               neighbor algorithm is faster.
     */
    Graphics.prototype.beginBitmapFill = function (bitmap, matrix, repeat, smooth) {
        if (matrix === void 0) { matrix = null; }
        if (repeat === void 0) { repeat = true; }
        if (smooth === void 0) { smooth = false; }
        this.draw_fills();
        // start a new fill path
        this._active_fill_path = new GraphicsPath_1.GraphicsPath();
        // todo: create bitmap fill style
        this._active_fill_path.style = new GraphicsFillStyle_1.GraphicsFillStyle(0xffffff, 1);
        if (this._current_position.x != 0 || this._current_position.y != 0)
            this._active_fill_path.moveTo(this._current_position.x, this._current_position.y);
        this._queued_fill_pathes.push(this._active_fill_path);
    };
    /**
     * Specifies a simple one-color fill that subsequent calls to other Graphics
     * methods(such as <code>lineTo()</code> or <code>drawCircle()</code>) use
     * when drawing. The fill remains in effect until you call the
     * <code>beginFill()</code>, <code>beginBitmapFill()</code>,
     * <code>beginGradientFill()</code>, or <code>beginShaderFill()</code>
     * method. Calling the <code>clear()</code> method clears the fill.
     *
     * <p>The application renders the fill whenever three or more points are
     * drawn, or when the <code>endFill()</code> method is called.</p>
     *
     * @param color The color of the fill(0xRRGGBB).
     * @param alpha The alpha value of the fill(0.0 to 1.0).
     */
    Graphics.prototype.beginFill = function (color /*int*/, alpha) {
        if (alpha === void 0) { alpha = 1; }
        this.draw_fills();
        // start a new fill path
        this._active_fill_path = new GraphicsPath_1.GraphicsPath();
        this._active_fill_path.style = new GraphicsFillStyle_1.GraphicsFillStyle(color, alpha);
        if (this._current_position.x != 0 || this._current_position.y != 0)
            this._active_fill_path.moveTo(this._current_position.x, this._current_position.y);
        this._queued_fill_pathes.push(this._active_fill_path);
    };
    /**
     * Specifies a gradient fill used by subsequent calls to other Graphics
     * methods(such as <code>lineTo()</code> or <code>drawCircle()</code>) for
     * the object. The fill remains in effect until you call the
     * <code>beginFill()</code>, <code>beginBitmapFill()</code>,
     * <code>beginGradientFill()</code>, or <code>beginShaderFill()</code>
     * method. Calling the <code>clear()</code> method clears the fill.
     *
     * <p>The application renders the fill whenever three or more points are
     * drawn, or when the <code>endFill()</code> method is called. </p>
     *
     * @param type                A value from the GradientType class that
     *                            specifies which gradient type to use:
     *                            <code>GradientType.LINEAR</code> or
     *                            <code>GradientType.RADIAL</code>.
     * @param colors              An array of RGB hexadecimal color values used
     *                            in the gradient; for example, red is 0xFF0000,
     *                            blue is 0x0000FF, and so on. You can specify
     *                            up to 15 colors. For each color, specify a
     *                            corresponding value in the alphas and ratios
     *                            parameters.
     * @param alphas              An array of alpha values for the corresponding
     *                            colors in the colors array; valid values are 0
     *                            to 1. If the value is less than 0, the default
     *                            is 0. If the value is greater than 1, the
     *                            default is 1.
     * @param ratios              An array of color distribution ratios; valid
     *                            values are 0-255. This value defines the
     *                            percentage of the width where the color is
     *                            sampled at 100%. The value 0 represents the
     *                            left position in the gradient box, and 255
     *                            represents the right position in the gradient
     *                            box.
     * @param matrix              A transformation matrix as defined by the
     *                            flash.geom.Matrix class. The flash.geom.Matrix
     *                            class includes a
     *                            <code>createGradientBox()</code> method, which
     *                            lets you conveniently set up the matrix for use
     *                            with the <code>beginGradientFill()</code>
     *                            method.
     * @param spreadMethod        A value from the SpreadMethod class that
     *                            specifies which spread method to use, either:
     *                            <code>SpreadMethod.PAD</code>,
     *                            <code>SpreadMethod.REFLECT</code>, or
     *                            <code>SpreadMethod.REPEAT</code>.
     *
     *                            <p>For example, consider a simple linear
     *                            gradient between two colors:</p>
     *
     *                            <p>This example uses
     *                            <code>SpreadMethod.PAD</code> for the spread
     *                            method, and the gradient fill looks like the
     *                            following:</p>
     *
     *                            <p>If you use <code>SpreadMethod.REFLECT</code>
     *                            for the spread method, the gradient fill looks
     *                            like the following:</p>
     *
     *                            <p>If you use <code>SpreadMethod.REPEAT</code>
     *                            for the spread method, the gradient fill looks
     *                            like the following:</p>
     * @param interpolationMethod A value from the InterpolationMethod class that
     *                            specifies which value to use:
     *                            <code>InterpolationMethod.LINEAR_RGB</code> or
     *                            <code>InterpolationMethod.RGB</code>
     *
     *                            <p>For example, consider a simple linear
     *                            gradient between two colors(with the
     *                            <code>spreadMethod</code> parameter set to
     *                            <code>SpreadMethod.REFLECT</code>). The
     *                            different interpolation methods affect the
     *                            appearance as follows: </p>
     * @param focalPointRatio     A number that controls the location of the
     *                            focal point of the gradient. 0 means that the
     *                            focal point is in the center. 1 means that the
     *                            focal point is at one border of the gradient
     *                            circle. -1 means that the focal point is at the
     *                            other border of the gradient circle. A value
     *                            less than -1 or greater than 1 is rounded to -1
     *                            or 1. For example, the following example shows
     *                            a <code>focalPointRatio</code> set to 0.75:
     * @throws ArgumentError If the <code>type</code> parameter is not valid.
     */
    Graphics.prototype.beginGradientFill = function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
        if (matrix === void 0) { matrix = null; }
        if (spreadMethod === void 0) { spreadMethod = "pad"; }
        if (interpolationMethod === void 0) { interpolationMethod = "rgb"; }
        if (focalPointRatio === void 0) { focalPointRatio = 0; }
        this.draw_fills();
        // start a new fill path
        this._active_fill_path = new GraphicsPath_1.GraphicsPath();
        // todo: create gradient fill style
        this._active_fill_path.style = new GraphicsFillStyle_1.GraphicsFillStyle(colors[0], alphas[0]);
        if (this._current_position.x != 0 || this._current_position.y != 0)
            this._active_fill_path.moveTo(this._current_position.x, this._current_position.y);
        this._queued_fill_pathes.push(this._active_fill_path);
    };
    /**
     * Copies all of drawing commands from the source Graphics object into the
     * calling Graphics object.
     *
     * @param sourceGraphics The Graphics object from which to copy the drawing
     *                       commands.
     */
    Graphics.prototype.copyFrom = function (sourceGraphics) {
        sourceGraphics.copyTo(this);
    };
    /**
     * Draws a cubic Bezier curve from the current drawing position to the
     * specified anchor point. Cubic Bezier curves consist of two anchor points
     * and two control points. The curve interpolates the two anchor points and
     * curves toward the two control points.
     *
     * The four points you use to draw a cubic Bezier curve with the
     * <code>cubicCurveTo()</code> method are as follows:
     *
     * <ul>
     *   <li>The current drawing position is the first anchor point. </li>
     *   <li>The anchorX and anchorY parameters specify the second anchor point.
     *   </li>
     *   <li>The <code>controlX1</code> and <code>controlY1</code> parameters
     *   specify the first control point.</li>
     *   <li>The <code>controlX2</code> and <code>controlY2</code> parameters
     *   specify the second control point.</li>
     * </ul>
     *
     * If you call the <code>cubicCurveTo()</code> method before calling the
     * <code>moveTo()</code> method, your curve starts at position (0, 0).
     *
     * If the <code>cubicCurveTo()</code> method succeeds, the Flash runtime sets
     * the current drawing position to (<code>anchorX</code>,
     * <code>anchorY</code>). If the <code>cubicCurveTo()</code> method fails,
     * the current drawing position remains unchanged.
     *
     * If your movie clip contains content created with the Flash drawing tools,
     * the results of calls to the <code>cubicCurveTo()</code> method are drawn
     * underneath that content.
     *
     * @param controlX1 Specifies the horizontal position of the first control
     *                  point relative to the registration point of the parent
     *                  display object.
     * @param controlY1 Specifies the vertical position of the first control
     *                  point relative to the registration point of the parent
     *                  display object.
     * @param controlX2 Specifies the horizontal position of the second control
     *                  point relative to the registration point of the parent
     *                  display object.
     * @param controlY2 Specifies the vertical position of the second control
     *                  point relative to the registration point of the parent
     *                  display object.
     * @param anchorX   Specifies the horizontal position of the anchor point
     *                  relative to the registration point of the parent display
     *                  object.
     * @param anchorY   Specifies the vertical position of the anchor point
     *                  relative to the registration point of the parent display
     *                  object.
     */
    Graphics.prototype.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
        throw new PartialImplementationError_1.PartialImplementationError("cubicCurveTo");
        /*
         t = 0.5; // given example value
         x = (1 - t) * (1 - t) * p[0].x + 2 * (1 - t) * t * p[1].x + t * t * p[2].x;
         y = (1 - t) * (1 - t) * p[0].y + 2 * (1 - t) * t * p[1].y + t * t * p[2].y;

         this.queued_command_types.push(Graphics.CMD_BEZIER);
         this.queued_command_data.push(controlX1);
         this.queued_command_data.push(controlY1);
         this.queued_command_data.push(controlX2);
         this.queued_command_data.push(controlY2);
         this.queued_command_data.push(anchorX);
         this.queued_command_data.push(anchorY);

         // todo: somehow convert cubic bezier curve into 2 quadric curves...

         this.draw_direction+=0;
         */
    };
    /**
     * Draws a curve using the current line style from the current drawing
     * position to(anchorX, anchorY) and using the control point that
     * (<code>controlX</code>, <code>controlY</code>) specifies. The current
     * drawing position is then set to(<code>anchorX</code>,
     * <code>anchorY</code>). If the movie clip in which you are drawing contains
     * content created with the Flash drawing tools, calls to the
     * <code>curveTo()</code> method are drawn underneath this content. If you
     * call the <code>curveTo()</code> method before any calls to the
     * <code>moveTo()</code> method, the default of the current drawing position
     * is(0, 0). If any of the parameters are missing, this method fails and the
     * current drawing position is not changed.
     *
     * <p>The curve drawn is a quadratic Bezier curve. Quadratic Bezier curves
     * consist of two anchor points and one control point. The curve interpolates
     * the two anchor points and curves toward the control point. </p>
     *
     * @param controlX A number that specifies the horizontal position of the
     *                 control point relative to the registration point of the
     *                 parent display object.
     * @param controlY A number that specifies the vertical position of the
     *                 control point relative to the registration point of the
     *                 parent display object.
     * @param anchorX  A number that specifies the horizontal position of the
     *                 next anchor point relative to the registration point of
     *                 the parent display object.
     * @param anchorY  A number that specifies the vertical position of the next
     *                 anchor point relative to the registration point of the
     *                 parent display object.
     */
    Graphics.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
        if (this._active_fill_path != null) {
            this._active_fill_path.curveTo(controlX, controlY, anchorX, anchorY);
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.curveTo(controlX, controlY, anchorX, anchorY);
        }
        this._current_position.x = anchorX;
        this._current_position.y = anchorY;
    };
    /**
     * Draws a circle. Set the line style, fill, or both before you call the
     * <code>drawCircle()</code> method, by calling the <code>linestyle()</code>,
     * <code>lineGradientStyle()</code>, <code>beginFill()</code>,
     * <code>beginGradientFill()</code>, or <code>beginBitmapFill()</code>
     * method.
     *
     * @param x      The <i>x</i> location of the center of the circle relative
     *               to the registration point of the parent display object(in
     *               pixels).
     * @param y      The <i>y</i> location of the center of the circle relative
     *               to the registration point of the parent display object(in
     *               pixels).
     * @param radius The radius of the circle(in pixels).
     */
    Graphics.prototype.drawCircle = function (x, y, radius) {
        // todo: directly create triangles instead of draw commands ?
        var radius2 = radius * 1.065;
        if (this._active_fill_path != null) {
            this._active_fill_path.moveTo(x - radius, y);
            for (var i = 8; i >= 0; i--) {
                var degree = (i) * (360 / 8) * Math.PI / 180;
                var degree2 = degree + ((360 / 16) * Math.PI / 180);
                this._active_fill_path.curveTo(x - (Math.cos(degree2) * radius2), y + (Math.sin(degree2) * radius2), x - (Math.cos(degree) * radius), y + (Math.sin(degree) * radius));
            }
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.moveTo(x, y + radius);
            var radius2 = radius * 0.93;
            this._active_stroke_path.curveTo(x - (radius2), y + (radius2), x - radius, y);
            this._active_stroke_path.curveTo(x - (radius2), y - (radius2), x, y - radius);
            this._active_stroke_path.curveTo(x + (radius2), y - (radius2), x + radius, y);
            this._active_stroke_path.curveTo(x + (radius2), y + (radius2), x, y + radius);
        }
    };
    /**
     * Draws an ellipse. Set the line style, fill, or both before you call the
     * <code>drawEllipse()</code> method, by calling the
     * <code>linestyle()</code>, <code>lineGradientStyle()</code>,
     * <code>beginFill()</code>, <code>beginGradientFill()</code>, or
     * <code>beginBitmapFill()</code> method.
     *
     * @param x      The <i>x</i> location of the top-left of the bounding-box of
     *               the ellipse relative to the registration point of the parent
     *               display object(in pixels).
     * @param y      The <i>y</i> location of the top left of the bounding-box of
     *               the ellipse relative to the registration point of the parent
     *               display object(in pixels).
     * @param width  The width of the ellipse(in pixels).
     * @param height The height of the ellipse(in pixels).
     */
    Graphics.prototype.drawEllipse = function (x, y, width, height) {
        width /= 2;
        height /= 2;
        if (this._active_fill_path != null) {
            this._active_fill_path.moveTo(x, y + height);
            this._active_fill_path.curveTo(x - (width), y + (height), x - width, y);
            this._active_fill_path.curveTo(x - (width), y - (height), x, y - height);
            this._active_fill_path.curveTo(x + (width), y - (height), x + width, y);
            this._active_fill_path.curveTo(x + (width), y + (height), x, y + height);
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.moveTo(x, y + height);
            this._active_stroke_path.curveTo(x - (width), y + (height), x - width, y);
            this._active_stroke_path.curveTo(x - (width), y - (height), x, y - height);
            this._active_stroke_path.curveTo(x + (width), y - (height), x + width, y);
            this._active_stroke_path.curveTo(x + (width), y + (height), x, y + height);
        }
    };
    /**
     * Submits a series of IGraphicsData instances for drawing. This method
     * accepts a Vector containing objects including paths, fills, and strokes
     * that implement the IGraphicsData interface. A Vector of IGraphicsData
     * instances can refer to a part of a shape, or a complex fully defined set
     * of data for rendering a complete shape.
     *
     * <p> Graphics paths can contain other graphics paths. If the
     * <code>graphicsData</code> Vector includes a path, that path and all its
     * sub-paths are rendered during this operation. </p>
     *
     */
    Graphics.prototype.drawGraphicsData = function (graphicsData) {
        //this.draw_fills();
        /*
         for (var i:number=0; i<graphicsData.length; i++){
         //todo
         if(graphicsData[i].dataType=="beginFill"){

         }
         else if(graphicsData[i].dataType=="endFill"){

         }
         else if(graphicsData[i].dataType=="endFill"){

         }
         else if(graphicsData[i].dataType=="Path"){

         }

         }
         */
    };
    /**
     * Submits a series of commands for drawing. The <code>drawPath()</code>
     * method uses vector arrays to consolidate individual <code>moveTo()</code>,
     * <code>lineTo()</code>, and <code>curveTo()</code> drawing commands into a
     * single call. The <code>drawPath()</code> method parameters combine drawing
     * commands with x- and y-coordinate value pairs and a drawing direction. The
     * drawing commands are values from the GraphicsPathCommand class. The x- and
     * y-coordinate value pairs are Numbers in an array where each pair defines a
     * coordinate location. The drawing direction is a value from the
     * GraphicsPathWinding class.
     *
     * <p> Generally, drawings render faster with <code>drawPath()</code> than
     * with a series of individual <code>lineTo()</code> and
     * <code>curveTo()</code> methods. </p>
     *
     * <p> The <code>drawPath()</code> method uses a uses a floating computation
     * so rotation and scaling of shapes is more accurate and gives better
     * results. However, curves submitted using the <code>drawPath()</code>
     * method can have small sub-pixel alignment errors when used in conjunction
     * with the <code>lineTo()</code> and <code>curveTo()</code> methods. </p>
     *
     * <p> The <code>drawPath()</code> method also uses slightly different rules
     * for filling and drawing lines. They are: </p>
     *
     * <ul>
     *   <li>When a fill is applied to rendering a path:
     * <ul>
     *   <li>A sub-path of less than 3 points is not rendered.(But note that the
     * stroke rendering will still occur, consistent with the rules for strokes
     * below.)</li>
     *   <li>A sub-path that isn't closed(the end point is not equal to the
     * begin point) is implicitly closed.</li>
     * </ul>
     * </li>
     *   <li>When a stroke is applied to rendering a path:
     * <ul>
     *   <li>The sub-paths can be composed of any number of points.</li>
     *   <li>The sub-path is never implicitly closed.</li>
     * </ul>
     * </li>
     * </ul>
     *
     * @param winding Specifies the winding rule using a value defined in the
     *                GraphicsPathWinding class.
     */
    Graphics.prototype.drawPath = function (commands, data, winding) {
        //todo
        /*
         if(this._active_fill_path!=null){
         this._active_fill_path.curveTo(controlX, controlY, anchorX, anchorY);
         }
         if(this._active_stroke_path!=null){
         this._active_stroke_path.curveTo(controlX, controlY, anchorX, anchorY);
         }
         this._current_position.x=anchorX;
         this._current_position.y=anchorY;
         */
    };
    /**
     * Draws a rectangle. Set the line style, fill, or both before you call the
     * <code>drawRect()</code> method, by calling the <code>linestyle()</code>,
     * <code>lineGradientStyle()</code>, <code>beginFill()</code>,
     * <code>beginGradientFill()</code>, or <code>beginBitmapFill()</code>
     * method.
     *
     * @param x      A number indicating the horizontal position relative to the
     *               registration point of the parent display object(in pixels).
     * @param y      A number indicating the vertical position relative to the
     *               registration point of the parent display object(in pixels).
     * @param width  The width of the rectangle(in pixels).
     * @param height The height of the rectangle(in pixels).
     * @throws ArgumentError If the <code>width</code> or <code>height</code>
     *                       parameters are not a number
     *                      (<code>Number.NaN</code>).
     */
    Graphics.prototype.drawRect = function (x, y, width, height) {
        //todo: directly create triangles instead of drawing commands ?
        if (this._active_fill_path != null) {
            this._active_fill_path.moveTo(x, y);
            this._active_fill_path.lineTo(x + width, y);
            this._active_fill_path.lineTo(x + width, y + height);
            this._active_fill_path.lineTo(x, y + height);
            this._active_fill_path.lineTo(x, y);
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.moveTo(x, y);
            this._active_stroke_path.lineTo(x + width, y);
            this._active_stroke_path.lineTo(x + width, y + height);
            this._active_stroke_path.lineTo(x, y + height);
            this._active_stroke_path.lineTo(x, y);
        }
    };
    /**
     * Draws a rounded rectangle. Set the line style, fill, or both before you
     * call the <code>drawRoundRect()</code> method, by calling the
     * <code>linestyle()</code>, <code>lineGradientStyle()</code>,
     * <code>beginFill()</code>, <code>beginGradientFill()</code>, or
     * <code>beginBitmapFill()</code> method.
     *
     * @param x             A number indicating the horizontal position relative
     *                      to the registration point of the parent display
     *                      object(in pixels).
     * @param y             A number indicating the vertical position relative to
     *                      the registration point of the parent display object
     *                     (in pixels).
     * @param width         The width of the round rectangle(in pixels).
     * @param height        The height of the round rectangle(in pixels).
     * @param ellipseWidth  The width of the ellipse used to draw the rounded
     *                      corners(in pixels).
     * @param ellipseHeight The height of the ellipse used to draw the rounded
     *                      corners(in pixels). Optional; if no value is
     *                      specified, the default value matches that provided
     *                      for the <code>ellipseWidth</code> parameter.
     * @throws ArgumentError If the <code>width</code>, <code>height</code>,
     *                       <code>ellipseWidth</code> or
     *                       <code>ellipseHeight</code> parameters are not a
     *                       number(<code>Number.NaN</code>).
     */
    Graphics.prototype.drawRoundRect = function (x, y, width, height, ellipseWidth, ellipseHeight) {
        if (ellipseHeight === void 0) { ellipseHeight = NaN; }
        //todo: directly create triangles instead of drawing commands ?
        if (!ellipseHeight) {
            ellipseHeight = ellipseWidth;
        }
        if (this._active_fill_path != null) {
            this._active_fill_path.moveTo(x + ellipseWidth, y);
            this._active_fill_path.lineTo(x + width - ellipseWidth, y);
            this._active_fill_path.curveTo(x + width, y, x + width, y + ellipseHeight);
            this._active_fill_path.lineTo(x + width, y + height - ellipseHeight);
            this._active_fill_path.curveTo(x + width, y + height, x + width - ellipseWidth, y + height);
            this._active_fill_path.lineTo(x + ellipseWidth, y + height);
            this._active_fill_path.curveTo(x, y + height, x, y + height - ellipseHeight);
            this._active_fill_path.lineTo(x, y + ellipseHeight);
            this._active_fill_path.curveTo(x, y, x + ellipseWidth, y);
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.moveTo(x + ellipseWidth, y);
            this._active_stroke_path.lineTo(x + width - ellipseWidth, y);
            this._active_stroke_path.curveTo(x + width, y, x + width, y + ellipseHeight);
            this._active_stroke_path.lineTo(x + width, y + height - ellipseHeight);
            this._active_stroke_path.curveTo(x + width, y + height, x + width - ellipseWidth, y + height);
            this._active_stroke_path.lineTo(x + ellipseWidth, y + height);
            this._active_stroke_path.curveTo(x, y + height, x, y + height - ellipseHeight);
            this._active_stroke_path.lineTo(x, y + ellipseHeight);
            this._active_stroke_path.curveTo(x, y, x + ellipseWidth, y);
        }
    };
    //public drawRoundRectComplex(x:Float, y:Float, width:Float, height:Float, topLeftRadius:Float, topRightRadius:Float, bottomLeftRadius:Float, bottomRightRadius:Float):Void;
    /**
     * Renders a set of triangles, typically to distort bitmaps and give them a
     * three-dimensional appearance. The <code>drawTriangles()</code> method maps
     * either the current fill, or a bitmap fill, to the triangle faces using a
     * set of(u,v) coordinates.
     *
     * <p> Any type of fill can be used, but if the fill has a transform matrix
     * that transform matrix is ignored. </p>
     *
     * <p> A <code>uvtData</code> parameter improves texture mapping when a
     * bitmap fill is used. </p>
     *
     * @param culling Specifies whether to render triangles that face in a
     *                specified direction. This parameter prevents the rendering
     *                of triangles that cannot be seen in the current view. This
     *                parameter can be set to any value defined by the
     *                TriangleCulling class.
     */
    Graphics.prototype.drawTriangles = function (vertices, indices, uvtData, culling) {
        if (indices === void 0) { indices = null; }
        if (uvtData === void 0) { uvtData = null; }
        if (culling === void 0) { culling = null; }
        if (this._active_fill_path != null) {
        }
        if (this._active_stroke_path != null) {
        }
    };
    /**
     * Applies a fill to the lines and curves that were added since the last call
     * to the <code>beginFill()</code>, <code>beginGradientFill()</code>, or
     * <code>beginBitmapFill()</code> method. Flash uses the fill that was
     * specified in the previous call to the <code>beginFill()</code>,
     * <code>beginGradientFill()</code>, or <code>beginBitmapFill()</code>
     * method. If the current drawing position does not equal the previous
     * position specified in a <code>moveTo()</code> method and a fill is
     * defined, the path is closed with a line and then filled.
     *
     */
    Graphics.prototype.endFill = function () {
        this.draw_strokes();
        this.draw_fills();
        this._active_fill_path = null;
        this._active_stroke_path = null;
    };
    /**
     * Specifies a bitmap to use for the line stroke when drawing lines.
     *
     * <p>The bitmap line style is used for subsequent calls to Graphics methods
     * such as the <code>lineTo()</code> method or the <code>drawCircle()</code>
     * method. The line style remains in effect until you call the
     * <code>lineStyle()</code> or <code>lineGradientStyle()</code> methods, or
     * the <code>lineBitmapStyle()</code> method again with different parameters.
     * </p>
     *
     * <p>You can call the <code>lineBitmapStyle()</code> method in the middle of
     * drawing a path to specify different styles for different line segments
     * within a path. </p>
     *
     * <p>Call the <code>lineStyle()</code> method before you call the
     * <code>lineBitmapStyle()</code> method to enable a stroke, or else the
     * value of the line style is <code>undefined</code>.</p>
     *
     * <p>Calls to the <code>clear()</code> method set the line style back to
     * <code>undefined</code>. </p>
     *
     * @param bitmap The bitmap to use for the line stroke.
     * @param matrix An optional transformation matrix as defined by the
     *               flash.geom.Matrix class. The matrix can be used to scale or
     *               otherwise manipulate the bitmap before applying it to the
     *               line style.
     * @param repeat Whether to repeat the bitmap in a tiled fashion.
     * @param smooth Whether smoothing should be applied to the bitmap.
     */
    Graphics.prototype.lineBitmapStyle = function (bitmap, matrix, repeat, smooth) {
        if (matrix === void 0) { matrix = null; }
        if (repeat === void 0) { repeat = true; }
        if (smooth === void 0) { smooth = false; }
        // start a new stroke path
        this._active_stroke_path = new GraphicsPath_1.GraphicsPath();
        if (this._current_position.x != 0 || this._current_position.y != 0)
            this._active_stroke_path.moveTo(this._current_position.x, this._current_position.y);
        this._queued_stroke_pathes.push(this._active_stroke_path);
    };
    /**
     * Specifies a gradient to use for the stroke when drawing lines.
     *
     * <p>The gradient line style is used for subsequent calls to Graphics
     * methods such as the <code>lineTo()</code> methods or the
     * <code>drawCircle()</code> method. The line style remains in effect until
     * you call the <code>lineStyle()</code> or <code>lineBitmapStyle()</code>
     * methods, or the <code>lineGradientStyle()</code> method again with
     * different parameters. </p>
     *
     * <p>You can call the <code>lineGradientStyle()</code> method in the middle
     * of drawing a path to specify different styles for different line segments
     * within a path. </p>
     *
     * <p>Call the <code>lineStyle()</code> method before you call the
     * <code>lineGradientStyle()</code> method to enable a stroke, or else the
     * value of the line style is <code>undefined</code>.</p>
     *
     * <p>Calls to the <code>clear()</code> method set the line style back to
     * <code>undefined</code>. </p>
     *
     * @param type                A value from the GradientType class that
     *                            specifies which gradient type to use, either
     *                            GradientType.LINEAR or GradientType.RADIAL.
     * @param colors              An array of RGB hexadecimal color values used
     *                            in the gradient; for example, red is 0xFF0000,
     *                            blue is 0x0000FF, and so on. You can specify
     *                            up to 15 colors. For each color, specify a
     *                            corresponding value in the alphas and ratios
     *                            parameters.
     * @param alphas              An array of alpha values for the corresponding
     *                            colors in the colors array; valid values are 0
     *                            to 1. If the value is less than 0, the default
     *                            is 0. If the value is greater than 1, the
     *                            default is 1.
     * @param ratios              An array of color distribution ratios; valid
     *                            values are 0-255. This value defines the
     *                            percentage of the width where the color is
     *                            sampled at 100%. The value 0 represents the
     *                            left position in the gradient box, and 255
     *                            represents the right position in the gradient
     *                            box.
     * @param matrix              A transformation matrix as defined by the
     *                            flash.geom.Matrix class. The flash.geom.Matrix
     *                            class includes a
     *                            <code>createGradientBox()</code> method, which
     *                            lets you conveniently set up the matrix for use
     *                            with the <code>lineGradientStyle()</code>
     *                            method.
     * @param spreadMethod        A value from the SpreadMethod class that
     *                            specifies which spread method to use:
     * @param interpolationMethod A value from the InterpolationMethod class that
     *                            specifies which value to use. For example,
     *                            consider a simple linear gradient between two
     *                            colors(with the <code>spreadMethod</code>
     *                            parameter set to
     *                            <code>SpreadMethod.REFLECT</code>). The
     *                            different interpolation methods affect the
     *                            appearance as follows:
     * @param focalPointRatio     A number that controls the location of the
     *                            focal point of the gradient. The value 0 means
     *                            the focal point is in the center. The value 1
     *                            means the focal point is at one border of the
     *                            gradient circle. The value -1 means that the
     *                            focal point is at the other border of the
     *                            gradient circle. Values less than -1 or greater
     *                            than 1 are rounded to -1 or 1. The following
     *                            image shows a gradient with a
     *                            <code>focalPointRatio</code> of -0.75:
     */
    Graphics.prototype.lineGradientStyle = function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
        if (matrix === void 0) { matrix = null; }
        if (spreadMethod === void 0) { spreadMethod = null; }
        if (interpolationMethod === void 0) { interpolationMethod = null; }
        if (focalPointRatio === void 0) { focalPointRatio = 0; }
        // start a new stroke path
        this._active_stroke_path = new GraphicsPath_1.GraphicsPath();
        if (this._current_position.x != 0 || this._current_position.y != 0)
            this._active_stroke_path.moveTo(this._current_position.x, this._current_position.y);
        this._queued_stroke_pathes.push(this._active_stroke_path);
    };
    /**
     * Specifies a shader to use for the line stroke when drawing lines.
     *
     * <p>The shader line style is used for subsequent calls to Graphics methods
     * such as the <code>lineTo()</code> method or the <code>drawCircle()</code>
     * method. The line style remains in effect until you call the
     * <code>lineStyle()</code> or <code>lineGradientStyle()</code> methods, or
     * the <code>lineBitmapStyle()</code> method again with different parameters.
     * </p>
     *
     * <p>You can call the <code>lineShaderStyle()</code> method in the middle of
     * drawing a path to specify different styles for different line segments
     * within a path. </p>
     *
     * <p>Call the <code>lineStyle()</code> method before you call the
     * <code>lineShaderStyle()</code> method to enable a stroke, or else the
     * value of the line style is <code>undefined</code>.</p>
     *
     * <p>Calls to the <code>clear()</code> method set the line style back to
     * <code>undefined</code>. </p>
     *
     * @param shader The shader to use for the line stroke.
     * @param matrix An optional transformation matrix as defined by the
     *               flash.geom.Matrix class. The matrix can be used to scale or
     *               otherwise manipulate the bitmap before applying it to the
     *               line style.
     */
    //		public lineShaderStyle(shader:Shader, matrix:Matrix = null)
    //		{
    //
    //		}
    /**
     * Specifies a line style used for subsequent calls to Graphics methods such
     * as the <code>lineTo()</code> method or the <code>drawCircle()</code>
     * method. The line style remains in effect until you call the
     * <code>lineGradientStyle()</code> method, the
     * <code>lineBitmapStyle()</code> method, or the <code>lineStyle()</code>
     * method with different parameters.
     *
     * <p>You can call the <code>lineStyle()</code> method in the middle of
     * drawing a path to specify different styles for different line segments
     * within the path.</p>
     *
     * <p><b>Note: </b>Calls to the <code>clear()</code> method set the line
     * style back to <code>undefined</code>.</p>
     *
     * <p><b>Note: </b>Flash Lite 4 supports only the first three parameters
     * (<code>thickness</code>, <code>color</code>, and <code>alpha</code>).</p>
     *
     * @param thickness    An integer that indicates the thickness of the line in
     *                     points; valid values are 0-255. If a number is not
     *                     specified, or if the parameter is undefined, a line is
     *                     not drawn. If a value of less than 0 is passed, the
     *                     default is 0. The value 0 indicates hairline
     *                     thickness; the maximum thickness is 255. If a value
     *                     greater than 255 is passed, the default is 255.
     * @param color        A hexadecimal color value of the line; for example,
     *                     red is 0xFF0000, blue is 0x0000FF, and so on. If a
     *                     value is not indicated, the default is 0x000000
     *                    (black). Optional.
     * @param alpha        A number that indicates the alpha value of the color
     *                     of the line; valid values are 0 to 1. If a value is
     *                     not indicated, the default is 1(solid). If the value
     *                     is less than 0, the default is 0. If the value is
     *                     greater than 1, the default is 1.
     * @param pixelHinting(Not supported in Flash Lite 4) A Boolean value that
     *                     specifies whether to hint strokes to full pixels. This
     *                     affects both the position of anchors of a curve and
     *                     the line stroke size itself. With
     *                     <code>pixelHinting</code> set to <code>true</code>,
     *                     line widths are adjusted to full pixel widths. With
     *                     <code>pixelHinting</code> set to <code>false</code>,
     *                     disjoints can appear for curves and straight lines.
     *                     For example, the following illustrations show how
     *                     Flash Player or Adobe AIR renders two rounded
     *                     rectangles that are identical, except that the
     *                     <code>pixelHinting</code> parameter used in the
     *                     <code>lineStyle()</code> method is set differently
     *                    (the images are scaled by 200%, to emphasize the
     *                     difference):
     *
     *                     <p>If a value is not supplied, the line does not use
     *                     pixel hinting.</p>
     * @param scaleMode   (Not supported in Flash Lite 4) A value from the
     *                     LineScaleMode class that specifies which scale mode to
     *                     use:
     *                     <ul>
     *                       <li> <code>LineScaleMode.NORMAL</code> - Always
     *                     scale the line thickness when the object is scaled
     *                    (the default). </li>
     *                       <li> <code>LineScaleMode.NONE</code> - Never scale
     *                     the line thickness. </li>
     *                       <li> <code>LineScaleMode.VERTICAL</code> - Do not
     *                     scale the line thickness if the object is scaled
     *                     vertically <i>only</i>. For example, consider the
     *                     following circles, drawn with a one-pixel line, and
     *                     each with the <code>scaleMode</code> parameter set to
     *                     <code>LineScaleMode.VERTICAL</code>. The circle on the
     *                     left is scaled vertically only, and the circle on the
     *                     right is scaled both vertically and horizontally:
     *                     </li>
     *                       <li> <code>LineScaleMode.HORIZONTAL</code> - Do not
     *                     scale the line thickness if the object is scaled
     *                     horizontally <i>only</i>. For example, consider the
     *                     following circles, drawn with a one-pixel line, and
     *                     each with the <code>scaleMode</code> parameter set to
     *                     <code>LineScaleMode.HORIZONTAL</code>. The circle on
     *                     the left is scaled horizontally only, and the circle
     *                     on the right is scaled both vertically and
     *                     horizontally:   </li>
     *                     </ul>
     * @param caps        (Not supported in Flash Lite 4) A value from the
     *                     CapsStyle class that specifies the type of caps at the
     *                     end of lines. Valid values are:
     *                     <code>CapsStyle.NONE</code>,
     *                     <code>CapsStyle.ROUND</code>, and
     *                     <code>CapsStyle.SQUARE</code>. If a value is not
     *                     indicated, Flash uses round caps.
     *
     *                     <p>For example, the following illustrations show the
     *                     different <code>capsStyle</code> settings. For each
     *                     setting, the illustration shows a blue line with a
     *                     thickness of 30(for which the <code>capsStyle</code>
     *                     applies), and a superimposed black line with a
     *                     thickness of 1(for which no <code>capsStyle</code>
     *                     applies): </p>
     * @param joints      (Not supported in Flash Lite 4) A value from the
     *                     JointStyle class that specifies the type of joint
     *                     appearance used at angles. Valid values are:
     *                     <code>JointStyle.BEVEL</code>,
     *                     <code>JointStyle.MITER</code>, and
     *                     <code>JointStyle.ROUND</code>. If a value is not
     *                     indicated, Flash uses round joints.
     *
     *                     <p>For example, the following illustrations show the
     *                     different <code>joints</code> settings. For each
     *                     setting, the illustration shows an angled blue line
     *                     with a thickness of 30(for which the
     *                     <code>jointStyle</code> applies), and a superimposed
     *                     angled black line with a thickness of 1(for which no
     *                     <code>jointStyle</code> applies): </p>
     *
     *                     <p><b>Note:</b> For <code>joints</code> set to
     *                     <code>JointStyle.MITER</code>, you can use the
     *                     <code>miterLimit</code> parameter to limit the length
     *                     of the miter.</p>
     * @param miterLimit  (Not supported in Flash Lite 4) A number that
     *                     indicates the limit at which a miter is cut off. Valid
     *                     values range from 1 to 255(and values outside that
     *                     range are rounded to 1 or 255). This value is only
     *                     used if the <code>jointStyle</code> is set to
     *                     <code>"miter"</code>. The <code>miterLimit</code>
     *                     value represents the length that a miter can extend
     *                     beyond the point at which the lines meet to form a
     *                     joint. The value expresses a factor of the line
     *                     <code>thickness</code>. For example, with a
     *                     <code>miterLimit</code> factor of 2.5 and a
     *                     <code>thickness</code> of 10 pixels, the miter is cut
     *                     off at 25 pixels.
     *
     *                     <p>For example, consider the following angled lines,
     *                     each drawn with a <code>thickness</code> of 20, but
     *                     with <code>miterLimit</code> set to 1, 2, and 4.
     *                     Superimposed are black reference lines showing the
     *                     meeting points of the joints:</p>
     *
     *                     <p>Notice that a given <code>miterLimit</code> value
     *                     has a specific maximum angle for which the miter is
     *                     cut off. The following table lists some examples:</p>
     */
    Graphics.prototype.lineStyle = function (thickness, color, alpha, pixelHinting, scaleMode, capstyle, jointstyle, miterLimit) {
        if (thickness === void 0) { thickness = 0; }
        if (color === void 0) { color = 0; }
        if (alpha === void 0) { alpha = 1; }
        if (pixelHinting === void 0) { pixelHinting = false; }
        if (scaleMode === void 0) { scaleMode = null; }
        if (capstyle === void 0) { capstyle = CapsStyle_1.CapsStyle.NONE; }
        if (jointstyle === void 0) { jointstyle = JointStyle_1.JointStyle.MITER; }
        if (miterLimit === void 0) { miterLimit = 100; }
        // start a new stroke path
        this._active_stroke_path = new GraphicsPath_1.GraphicsPath();
        this._active_stroke_path.style = new GraphicsStrokeStyle_1.GraphicsStrokeStyle(color, alpha, thickness, jointstyle, capstyle, miterLimit);
        if (this._current_position.x != 0 || this._current_position.y != 0)
            this._active_stroke_path.moveTo(this._current_position.x, this._current_position.y);
        this._queued_stroke_pathes.push(this._active_stroke_path);
    };
    /**
     * Draws a line using the current line style from the current drawing
     * position to(<code>x</code>, <code>y</code>); the current drawing position
     * is then set to(<code>x</code>, <code>y</code>). If the display object in
     * which you are drawing contains content that was created with the Flash
     * drawing tools, calls to the <code>lineTo()</code> method are drawn
     * underneath the content. If you call <code>lineTo()</code> before any calls
     * to the <code>moveTo()</code> method, the default position for the current
     * drawing is(<i>0, 0</i>). If any of the parameters are missing, this
     * method fails and the current drawing position is not changed.
     *
     * @param x A number that indicates the horizontal position relative to the
     *          registration point of the parent display object(in pixels).
     * @param y A number that indicates the vertical position relative to the
     *          registration point of the parent display object(in pixels).
     */
    Graphics.prototype.lineTo = function (x, y) {
        if (this._active_fill_path != null) {
            this._active_fill_path.lineTo(x, y);
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.lineTo(x, y);
        }
        this._current_position.x = x;
        this._current_position.y = y;
    };
    /**
     * Moves the current drawing position to(<code>x</code>, <code>y</code>). If
     * any of the parameters are missing, this method fails and the current
     * drawing position is not changed.
     *
     * @param x A number that indicates the horizontal position relative to the
     *          registration point of the parent display object(in pixels).
     * @param y A number that indicates the vertical position relative to the
     *          registration point of the parent display object(in pixels).
     */
    Graphics.prototype.moveTo = function (x, y) {
        if (this._active_fill_path != null) {
            this._active_fill_path.moveTo(x, y);
        }
        if (this._active_stroke_path != null) {
            this._active_stroke_path.moveTo(x, y);
        }
        this._current_position.x = x;
        this._current_position.y = y;
    };
    Graphics.assetType = "[asset Graphics]";
    return Graphics;
}(AssetBase_1.AssetBase));
exports.Graphics = Graphics;