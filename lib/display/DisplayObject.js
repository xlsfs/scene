"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Box_1 = require("@awayjs/core/lib/geom/Box");
var ColorTransform_1 = require("@awayjs/core/lib/geom/ColorTransform");
var Sphere_1 = require("@awayjs/core/lib/geom/Sphere");
var MathConsts_1 = require("@awayjs/core/lib/geom/MathConsts");
var Matrix3D_1 = require("@awayjs/core/lib/geom/Matrix3D");
var Matrix3DUtils_1 = require("@awayjs/core/lib/geom/Matrix3DUtils");
var Point_1 = require("@awayjs/core/lib/geom/Point");
var Vector3D_1 = require("@awayjs/core/lib/geom/Vector3D");
var AssetBase_1 = require("@awayjs/core/lib/library/AssetBase");
var HierarchicalProperties_1 = require("../base/HierarchicalProperties");
var BoundsType_1 = require("../bounds/BoundsType");
var AlignmentMode_1 = require("../base/AlignmentMode");
var OrientationMode_1 = require("../base/OrientationMode");
var Transform_1 = require("../base/Transform");
var PickingCollision_1 = require("../pick/PickingCollision");
var DisplayObjectEvent_1 = require("../events/DisplayObjectEvent");
var TransformEvent_1 = require("../events/TransformEvent");
/**
 * The DisplayObject class is the base class for all objects that can be
 * placed on the display list. The display list manages all objects displayed
 * in flash. Use the DisplayObjectContainer class to arrange the
 * display objects in the display list. DisplayObjectContainer objects can
 * have child display objects, while other display objects, such as Shape and
 * TextField objects, are "leaf" nodes that have only parents and siblings, no
 * children.
 *
 * <p>The DisplayObject class supports basic functionality like the <i>x</i>
 * and <i>y</i> position of an object, as well as more advanced properties of
 * the object such as its transformation matrix. </p>
 *
 * <p>DisplayObject is an abstract base class; therefore, you cannot call
 * DisplayObject directly. Invoking <code>new DisplayObject()</code> throws an
 * <code>ArgumentError</code> exception. </p>
 *
 * <p>All display objects inherit from the DisplayObject class.</p>
 *
 * <p>The DisplayObject class itself does not include any APIs for rendering
 * content onscreen. For that reason, if you want create a custom subclass of
 * the DisplayObject class, you will want to extend one of its subclasses that
 * do have APIs for rendering content onscreen, such as the Shape, Sprite,
 * Bitmap, SimpleButton, TextField, or MovieClip class.</p>
 *
 * <p>The DisplayObject class contains several broadcast events. Normally, the
 * target of any particular event is a specific DisplayObject instance. For
 * example, the target of an <code>added</code> event is the specific
 * DisplayObject instance that was added to the display list. Having a single
 * target restricts the placement of event listeners to that target and in
 * some cases the target's ancestors on the display list. With broadcast
 * events, however, the target is not a specific DisplayObject instance, but
 * rather all DisplayObject instances, including those that are not on the
 * display list. This means that you can add a listener to any DisplayObject
 * instance to listen for broadcast events. In addition to the broadcast
 * events listed in the DisplayObject class's Events table, the DisplayObject
 * class also inherits two broadcast events from the EventDispatcher class:
 * <code>activate</code> and <code>deactivate</code>.</p>
 *
 * <p>Some properties previously used in the ActionScript 1.0 and 2.0
 * MovieClip, TextField, and Button classes(such as <code>_alpha</code>,
 * <code>_height</code>, <code>_name</code>, <code>_width</code>,
 * <code>_x</code>, <code>_y</code>, and others) have equivalents in the
 * ActionScript 3.0 DisplayObject class that are renamed so that they no
 * longer begin with the underscore(_) character.</p>
 *
 * <p>For more information, see the "Display Programming" chapter of the
 * <i>ActionScript 3.0 Developer's Guide</i>.</p>
 *
 * @event added            Dispatched when a display object is added to the
 *                         display list. The following methods trigger this
 *                         event:
 *                         <code>DisplayObjectContainer.addChild()</code>,
 *                         <code>DisplayObjectContainer.addChildAt()</code>.
 * @event addedToScene     Dispatched when a display object is added to the on
 *                         scene display list, either directly or through the
 *                         addition of a sub tree in which the display object
 *                         is contained. The following methods trigger this
 *                         event:
 *                         <code>DisplayObjectContainer.addChild()</code>,
 *                         <code>DisplayObjectContainer.addChildAt()</code>.
 * @event enterFrame       [broadcast event] Dispatched when the playhead is
 *                         entering a new frame. If the playhead is not
 *                         moving, or if there is only one frame, this event
 *                         is dispatched continuously in conjunction with the
 *                         frame rate. This event is a broadcast event, which
 *                         means that it is dispatched by all display objects
 *                         with a listener registered for this event.
 * @event exitFrame        [broadcast event] Dispatched when the playhead is
 *                         exiting the current frame. All frame scripts have
 *                         been run. If the playhead is not moving, or if
 *                         there is only one frame, this event is dispatched
 *                         continuously in conjunction with the frame rate.
 *                         This event is a broadcast event, which means that
 *                         it is dispatched by all display objects with a
 *                         listener registered for this event.
 * @event frameConstructed [broadcast event] Dispatched after the constructors
 *                         of frame display objects have run but before frame
 *                         scripts have run. If the playhead is not moving, or
 *                         if there is only one frame, this event is
 *                         dispatched continuously in conjunction with the
 *                         frame rate. This event is a broadcast event, which
 *                         means that it is dispatched by all display objects
 *                         with a listener registered for this event.
 * @event removed          Dispatched when a display object is about to be
 *                         removed from the display list. Two methods of the
 *                         DisplayObjectContainer class generate this event:
 *                         <code>removeChild()</code> and
 *                         <code>removeChildAt()</code>.
 *
 *                         <p>The following methods of a
 *                         DisplayObjectContainer object also generate this
 *                         event if an object must be removed to make room for
 *                         the new object: <code>addChild()</code>,
 *                         <code>addChildAt()</code>, and
 *                         <code>setChildIndex()</code>. </p>
 * @event removedFromScene Dispatched when a display object is about to be
 *                         removed from the display list, either directly or
 *                         through the removal of a sub tree in which the
 *                         display object is contained. Two methods of the
 *                         DisplayObjectContainer class generate this event:
 *                         <code>removeChild()</code> and
 *                         <code>removeChildAt()</code>.
 *
 *                         <p>The following methods of a
 *                         DisplayObjectContainer object also generate this
 *                         event if an object must be removed to make room for
 *                         the new object: <code>addChild()</code>,
 *                         <code>addChildAt()</code>, and
 *                         <code>setChildIndex()</code>. </p>
 * @event render           [broadcast event] Dispatched when the display list
 *                         is about to be updated and rendered. This event
 *                         provides the last opportunity for objects listening
 *                         for this event to make changes before the display
 *                         list is rendered. You must call the
 *                         <code>invalidate()</code> method of the Scene
 *                         object each time you want a <code>render</code>
 *                         event to be dispatched. <code>Render</code> events
 *                         are dispatched to an object only if there is mutual
 *                         trust between it and the object that called
 *                         <code>Scene.invalidate()</code>. This event is a
 *                         broadcast event, which means that it is dispatched
 *                         by all display objects with a listener registered
 *                         for this event.
 *
 *                         <p><b>Note: </b>This event is not dispatched if the
 *                         display is not rendering. This is the case when the
 *                         content is either minimized or obscured. </p>
 */
var DisplayObject = (function (_super) {
    __extends(DisplayObject, _super);
    /**
     * Creates a new <code>DisplayObject</code> instance.
     */
    function DisplayObject() {
        var _this = this;
        _super.call(this);
        this._queuedEvents = new Array();
        this._boxBoundsInvalid = true;
        this._sphereBoundsInvalid = true;
        this._pSceneTransform = new Matrix3D_1.Matrix3D();
        this._pIsEntity = false;
        this._pIsContainer = false;
        this._sessionID = -1;
        this._depthID = -16384;
        this._inverseSceneTransform = new Matrix3D_1.Matrix3D();
        this._scenePosition = new Vector3D_1.Vector3D();
        this._explicitVisibility = true;
        this._explicitMaskId = -1;
        this._pImplicitVisibility = true;
        this._pImplicitMaskId = -1;
        this._pImplicitMaskIds = new Array();
        this._explicitMouseEnabled = true;
        this._pImplicitMouseEnabled = true;
        this._orientationMatrix = new Matrix3D_1.Matrix3D();
        this._inheritColorTransform = false;
        this._maskMode = false;
        //temp vector used in global to local
        this._tempVector3D = new Vector3D_1.Vector3D();
        /**
         *
         */
        this.alignmentMode = AlignmentMode_1.AlignmentMode.REGISTRATION_POINT;
        /**
         *
         */
        this.castsShadows = true;
        /**
         *
         */
        this.orientationMode = OrientationMode_1.OrientationMode.DEFAULT;
        /**
         *
         */
        this.zOffset = 0;
        //creation of associated transform object
        this._transform = new Transform_1.Transform();
        //setup transform listeners
        this._transform.addEventListener(TransformEvent_1.TransformEvent.INVALIDATE_MATRIX3D, function (event) { return _this._onInvalidateMatrix3D(event); });
        this._transform.addEventListener(TransformEvent_1.TransformEvent.INVALIDATE_COLOR_TRANSFORM, function (event) { return _this._onInvalidateColorTransform(event); });
        //default bounds type
        this._boundsType = BoundsType_1.BoundsType.AXIS_ALIGNED_BOX;
    }
    Object.defineProperty(DisplayObject.prototype, "adapter", {
        /**
         * adapter is used to provide MovieClip to scripts taken from different platforms
         * setter typically managed by factory
         */
        get: function () {
            return this._adapter;
        },
        set: function (value) {
            this._adapter = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "inheritColorTransform", {
        get: function () {
            return this._inheritColorTransform;
        },
        set: function (value) {
            if (this._inheritColorTransform == value)
                return;
            this._inheritColorTransform = value;
            this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.COLOR_TRANSFORM);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "alpha", {
        /**
         * Indicates the alpha transparency value of the object specified. Valid
         * values are 0(fully transparent) to 1(fully opaque). The default value is
         * 1. Display objects with <code>alpha</code> set to 0 <i>are</i> active,
         * even though they are invisible.
         */
        get: function () {
            return this._transform.colorTransform ? this._transform.colorTransform.alphaMultiplier : 1;
        },
        set: function (value) {
            if (!this._transform.colorTransform)
                this._transform.colorTransform = new ColorTransform_1.ColorTransform();
            this._transform.colorTransform.alphaMultiplier = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "boundsType", {
        /**
         *
         */
        get: function () {
            return this._boundsType;
        },
        set: function (value) {
            if (this._boundsType == value)
                return;
            this._boundsType = value;
            this.invalidate();
            this._pInvalidateBounds();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "depth", {
        /**
         * Indicates the depth of the display object, in pixels. The depth is
         * calculated based on the bounds of the content of the display object. When
         * you set the <code>depth</code> property, the <code>scaleZ</code> property
         * is adjusted accordingly, as shown in the following code:
         *
         * <p>Except for TextField and Video objects, a display object with no
         * content (such as an empty sprite) has a depth of 0, even if you try to
         * set <code>depth</code> to a different value.</p>
         */
        get: function () {
            return this.getBox().depth * this.scaleZ;
        },
        set: function (val) {
            if (this._depth == val)
                return;
            this._depth = val;
            this._setScaleZ(val / this.getBox().depth);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "eulers", {
        /**
         * Defines the rotation of the 3d object as a <code>Vector3D</code> object containing euler angles for rotation around x, y and z axis.
         */
        get: function () {
            if (!this._eulers)
                this._eulers = new Vector3D_1.Vector3D();
            this._eulers.x = this.rotationX;
            this._eulers.y = this.rotationY;
            this._eulers.z = this.rotationZ;
            return this._eulers;
        },
        set: function (value) {
            // previously this was using the setters for rotationX etc
            // but because this will convert from radians to degree, i changed it to update directly
            this._transform.rotation.x = value.x;
            this._transform.rotation.y = value.y;
            this._transform.rotation.z = value.z;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "height", {
        /**
         * An indexed array that contains each filter object currently associated
         * with the display object. The flash.filters package contains several
         * classes that define specific filters you can use.
         *
         * <p>Filters can be applied in Flash Professional at design time, or at run
         * time by using ActionScript code. To apply a filter by using ActionScript,
         * you must make a temporary copy of the entire <code>filters</code> array,
         * modify the temporary array, then assign the value of the temporary array
         * back to the <code>filters</code> array. You cannot directly add a new
         * filter object to the <code>filters</code> array.</p>
         *
         * <p>To add a filter by using ActionScript, perform the following steps
         * (assume that the target display object is named
         * <code>myDisplayObject</code>):</p>
         *
         * <ol>
         *   <li>Create a new filter object by using the constructor method of your
         * chosen filter class.</li>
         *   <li>Assign the value of the <code>myDisplayObject.filters</code> array
         * to a temporary array, such as one named <code>myFilters</code>.</li>
         *   <li>Add the new filter object to the <code>myFilters</code> temporary
         * array.</li>
         *   <li>Assign the value of the temporary array to the
         * <code>myDisplayObject.filters</code> array.</li>
         * </ol>
         *
         * <p>If the <code>filters</code> array is undefined, you do not need to use
         * a temporary array. Instead, you can directly assign an array literal that
         * contains one or more filter objects that you create. The first example in
         * the Examples section adds a drop shadow filter by using code that handles
         * both defined and undefined <code>filters</code> arrays.</p>
         *
         * <p>To modify an existing filter object, you must use the technique of
         * modifying a copy of the <code>filters</code> array:</p>
         *
         * <ol>
         *   <li>Assign the value of the <code>filters</code> array to a temporary
         * array, such as one named <code>myFilters</code>.</li>
         *   <li>Modify the property by using the temporary array,
         * <code>myFilters</code>. For example, to set the quality property of the
         * first filter in the array, you could use the following code:
         * <code>myFilters[0].quality = 1;</code></li>
         *   <li>Assign the value of the temporary array to the <code>filters</code>
         * array.</li>
         * </ol>
         *
         * <p>At load time, if a display object has an associated filter, it is
         * marked to cache itself as a transparent bitmap. From this point forward,
         * as long as the display object has a valid filter list, the player caches
         * the display object as a bitmap. This source bitmap is used as a source
         * image for the filter effects. Each display object usually has two bitmaps:
         * one with the original unfiltered source display object and another for the
         * final image after filtering. The final image is used when rendering. As
         * long as the display object does not change, the final image does not need
         * updating.</p>
         *
         * <p>The flash.filters package includes classes for filters. For example, to
         * create a DropShadow filter, you would write:</p>
         *
         * @throws ArgumentError When <code>filters</code> includes a ShaderFilter
         *                       and the shader output type is not compatible with
         *                       this operation(the shader must specify a
         *                       <code>pixel4</code> output).
         * @throws ArgumentError When <code>filters</code> includes a ShaderFilter
         *                       and the shader doesn't specify any image input or
         *                       the first input is not an <code>image4</code> input.
         * @throws ArgumentError When <code>filters</code> includes a ShaderFilter
         *                       and the shader specifies an image input that isn't
         *                       provided.
         * @throws ArgumentError When <code>filters</code> includes a ShaderFilter, a
         *                       ByteArray or Vector.<Number> instance as a shader
         *                       input, and the <code>width</code> and
         *                       <code>height</code> properties aren't specified for
         *                       the ShaderInput object, or the specified values
         *                       don't match the amount of data in the input data.
         *                       See the <code>ShaderInput.input</code> property for
         *                       more information.
         */
        //		public filters:Array<Dynamic>;
        /**
         * Indicates the height of the display object, in pixels. The height is
         * calculated based on the bounds of the content of the display object. When
         * you set the <code>height</code> property, the <code>scaleY</code> property
         * is adjusted accordingly, as shown in the following code:
         *
         * <p>Except for TextField and Video objects, a display object with no
         * content (such as an empty sprite) has a height of 0, even if you try to
         * set <code>height</code> to a different value.</p>
         */
        get: function () {
            return this.getBox().height * this.scaleY;
        },
        set: function (val) {
            if (this._height == val)
                return;
            this._height = val;
            this._setScaleY(val / this.getBox().height);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "index", {
        /**
         * Indicates the instance container index of the DisplayObject. The object can be
         * identified in the child list of its parent display object container by
         * calling the <code>getChildByIndex()</code> method of the display object
         * container.
         *
         * <p>If the DisplayObject has no parent container, index defaults to 0.</p>
         */
        get: function () {
            if (this._pParent)
                return this._pParent.getChildIndex(this);
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "inverseSceneTransform", {
        /**
         *
         */
        get: function () {
            if (this._inverseSceneTransformDirty) {
                this._inverseSceneTransform.copyFrom(this.sceneTransform);
                this._inverseSceneTransform.invert();
                this._inverseSceneTransformDirty = false;
            }
            return this._inverseSceneTransform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "isEntity", {
        /**
         *
         */
        get: function () {
            return this._pIsEntity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "isContainer", {
        /**
         *
         */
        get: function () {
            return this._pIsContainer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "loaderInfo", {
        /**
         * Returns a LoaderInfo object containing information about loading the file
         * to which this display object belongs. The <code>loaderInfo</code> property
         * is defined only for the root display object of a SWF file or for a loaded
         * Bitmap(not for a Bitmap that is drawn with ActionScript). To find the
         * <code>loaderInfo</code> object associated with the SWF file that contains
         * a display object named <code>myDisplayObject</code>, use
         * <code>myDisplayObject.root.loaderInfo</code>.
         *
         * <p>A large SWF file can monitor its download by calling
         * <code>this.root.loaderInfo.addEventListener(Event.COMPLETE,
         * func)</code>.</p>
         */
        get: function () {
            return this._loaderInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "maskMode", {
        get: function () {
            return this._maskMode;
        },
        set: function (value) {
            if (this._maskMode == value)
                return;
            this._maskMode = value;
            this._explicitMaskId = value ? this.id : -1;
            this._updateMaskMode();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "mouseEnabled", {
        /**
         * Specifies whether this object receives mouse, or other user input,
         * messages. The default value is <code>true</code>, which means that by
         * default any InteractiveObject instance that is on the display list
         * receives mouse events or other user input events. If
         * <code>mouseEnabled</code> is set to <code>false</code>, the instance does
         * not receive any mouse events(or other user input events like keyboard
         * events). Any children of this instance on the display list are not
         * affected. To change the <code>mouseEnabled</code> behavior for all
         * children of an object on the display list, use
         * <code>flash.display.DisplayObjectContainer.mouseChildren</code>.
         *
         * <p> No event is dispatched by setting this property. You must use the
         * <code>addEventListener()</code> method to create interactive
         * functionality.</p>
         */
        get: function () {
            return this._explicitMouseEnabled;
        },
        set: function (value) {
            if (this._explicitMouseEnabled == value)
                return;
            this._explicitMouseEnabled = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "mouseX", {
        /**
         * Indicates the x coordinate of the mouse or user input device position, in
         * pixels.
         *
         * <p><b>Note</b>: For a DisplayObject that has been rotated, the returned x
         * coordinate will reflect the non-rotated object.</p>
         */
        get: function () {
            return this._mouseX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "mouseY", {
        /**
         * Indicates the y coordinate of the mouse or user input device position, in
         * pixels.
         *
         * <p><b>Note</b>: For a DisplayObject that has been rotated, the returned y
         * coordinate will reflect the non-rotated object.</p>
         */
        get: function () {
            return this._mouseY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "name", {
        /**
         * Indicates the instance name of the DisplayObject. The object can be
         * identified in the child list of its parent display object container by
         * calling the <code>getChildByName()</code> method of the display object
         * container.
         *
         * @throws IllegalOperationError If you are attempting to set this property
         *                               on an object that was placed on the timeline
         *                               in the Flash authoring tool.
         */
        get: function () {
            return this._pName;
        },
        set: function (value) {
            this._pName = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "parent", {
        /**
         * Indicates the DisplayObjectContainer object that contains this display
         * object. Use the <code>parent</code> property to specify a relative path to
         * display objects that are above the current display object in the display
         * list hierarchy.
         *
         * <p>You can use <code>parent</code> to move up multiple levels in the
         * display list as in the following:</p>
         *
         * @throws SecurityError The parent display object belongs to a security
         *                       sandbox to which you do not have access. You can
         *                       avoid this situation by having the parent movie call
         *                       the <code>Security.allowDomain()</code> method.
         */
        get: function () {
            return this._pParent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "partition", {
        /**
         *
         */
        get: function () {
            return this._explicitPartition;
        },
        set: function (value) {
            if (this._explicitPartition == value)
                return;
            this._explicitPartition = value;
            this._iSetScene(this._pScene, this._pParent ? this._pParent._iAssignedPartition : null);
            this.dispatchEvent(new DisplayObjectEvent_1.DisplayObjectEvent(DisplayObjectEvent_1.DisplayObjectEvent.PARTITION_CHANGED, this));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "pivot", {
        /**
         * Defines the local point around which the object rotates.
         */
        get: function () {
            return this._pivot;
        },
        set: function (pivot) {
            if (this._pivot && this._pivot.x == pivot.x && this._pivot.y == pivot.y && this._pivot.z == pivot.z)
                return;
            if (!pivot) {
                this._pivot = null;
                this._pivotScale = null;
            }
            else {
                if (!this._pivot)
                    this._pivot = new Vector3D_1.Vector3D();
                this._pivot.x = pivot.x;
                this._pivot.y = pivot.y;
                this._pivot.z = pivot.z;
            }
            this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.SCENE_TRANSFORM);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "root", {
        /**
         * For a display object in a loaded SWF file, the <code>root</code> property
         * is the top-most display object in the portion of the display list's tree
         * structure represented by that SWF file. For a Bitmap object representing a
         * loaded image file, the <code>root</code> property is the Bitmap object
         * itself. For the instance of the main class of the first SWF file loaded,
         * the <code>root</code> property is the display object itself. The
         * <code>root</code> property of the Scene object is the Scene object itself.
         * The <code>root</code> property is set to <code>null</code> for any display
         * object that has not been added to the display list, unless it has been
         * added to a display object container that is off the display list but that
         * is a child of the top-most display object in a loaded SWF file.
         *
         * <p>For example, if you create a new Sprite object by calling the
         * <code>Sprite()</code> constructor method, its <code>root</code> property
         * is <code>null</code> until you add it to the display list(or to a display
         * object container that is off the display list but that is a child of the
         * top-most display object in a SWF file).</p>
         *
         * <p>For a loaded SWF file, even though the Loader object used to load the
         * file may not be on the display list, the top-most display object in the
         * SWF file has its <code>root</code> property set to itself. The Loader
         * object does not have its <code>root</code> property set until it is added
         * as a child of a display object for which the <code>root</code> property is
         * set.</p>
         */
        get: function () {
            return this._root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "rotationX", {
        /**
         * Indicates the x-axis rotation of the DisplayObject instance, in degrees,
         * from its original orientation relative to the 3D parent container. Values
         * from 0 to 180 represent clockwise rotation; values from 0 to -180
         * represent counterclockwise rotation. Values outside this range are added
         * to or subtracted from 360 to obtain a value within the range.
         */
        get: function () {
            return this._transform.rotation.x * MathConsts_1.MathConsts.RADIANS_TO_DEGREES;
        },
        set: function (val) {
            if (this.rotationX == val)
                return;
            this._transform.rotation.x = val * MathConsts_1.MathConsts.DEGREES_TO_RADIANS;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "rotationY", {
        /**
         * Indicates the y-axis rotation of the DisplayObject instance, in degrees,
         * from its original orientation relative to the 3D parent container. Values
         * from 0 to 180 represent clockwise rotation; values from 0 to -180
         * represent counterclockwise rotation. Values outside this range are added
         * to or subtracted from 360 to obtain a value within the range.
         */
        get: function () {
            return this._transform.rotation.y * MathConsts_1.MathConsts.RADIANS_TO_DEGREES;
        },
        set: function (val) {
            if (this.rotationY == val)
                return;
            this._transform.rotation.y = val * MathConsts_1.MathConsts.DEGREES_TO_RADIANS;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "rotationZ", {
        /**
         * Indicates the z-axis rotation of the DisplayObject instance, in degrees,
         * from its original orientation relative to the 3D parent container. Values
         * from 0 to 180 represent clockwise rotation; values from 0 to -180
         * represent counterclockwise rotation. Values outside this range are added
         * to or subtracted from 360 to obtain a value within the range.
         */
        get: function () {
            return this._transform.rotation.z * MathConsts_1.MathConsts.RADIANS_TO_DEGREES;
        },
        set: function (val) {
            if (this.rotationZ == val)
                return;
            this._transform.rotation.z = val * MathConsts_1.MathConsts.DEGREES_TO_RADIANS;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "scaleX", {
        /**
         * Indicates the horizontal scale(percentage) of the object as applied from
         * the registration point. The default registration point is(0,0). 1.0
         * equals 100% scale.
         *
         * <p>Scaling the local coordinate system changes the <code>x</code> and
         * <code>y</code> property values, which are defined in whole pixels. </p>
         */
        get: function () {
            return this._transform.scale.x;
        },
        set: function (val) {
            //remove absolute width
            this._width = null;
            this._setScaleX(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "scaleY", {
        /**
         * Indicates the vertical scale(percentage) of an object as applied from the
         * registration point of the object. The default registration point is(0,0).
         * 1.0 is 100% scale.
         *
         * <p>Scaling the local coordinate system changes the <code>x</code> and
         * <code>y</code> property values, which are defined in whole pixels. </p>
         */
        get: function () {
            return this._transform.scale.y;
        },
        set: function (val) {
            //remove absolute height
            this._height = null;
            this._setScaleY(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "scaleZ", {
        /**
         * Indicates the depth scale(percentage) of an object as applied from the
         * registration point of the object. The default registration point is(0,0).
         * 1.0 is 100% scale.
         *
         * <p>Scaling the local coordinate system changes the <code>x</code>,
         * <code>y</code> and <code>z</code> property values, which are defined in
         * whole pixels. </p>
         */
        get: function () {
            return this._transform.scale.z;
        },
        set: function (val) {
            //remove absolute depth
            this._depth = null;
            this._setScaleZ(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "skewX", {
        /**
         * Indicates the horizontal skew(angle) of the object as applied from
         * the registration point. The default registration point is(0,0).
         */
        get: function () {
            return this._transform.skew.x;
        },
        set: function (val) {
            if (this.skewX == val)
                return;
            this._transform.skew.x = val;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "skewY", {
        /**
         * Indicates the vertical skew(angle) of an object as applied from the
         * registration point of the object. The default registration point is(0,0).
         */
        get: function () {
            return this._transform.skew.y;
        },
        set: function (val) {
            if (this.skewY == val)
                return;
            this._transform.skew.y = val;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "skewZ", {
        /**
         * Indicates the depth skew(angle) of an object as applied from the
         * registration point of the object. The default registration point is(0,0).
         */
        get: function () {
            return this._transform.skew.z;
        },
        set: function (val) {
            if (this.skewZ == val)
                return;
            this._transform.skew.z = val;
            this._transform.invalidateMatrix3D();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "scene", {
        /**
         *
         */
        get: function () {
            return this._pScene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "scenePosition", {
        /**
         *
         */
        get: function () {
            if (this._scenePositionDirty) {
                if (this._pivot && this.alignmentMode == AlignmentMode_1.AlignmentMode.PIVOT_POINT) {
                    this._scenePosition = this.sceneTransform.transformVector(this._pivotScale);
                }
                else {
                    this.sceneTransform.copyColumnTo(3, this._scenePosition);
                }
                this._scenePositionDirty = false;
            }
            return this._scenePosition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "sceneTransform", {
        get: function () {
            if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.SCENE_TRANSFORM)
                this.pUpdateSceneTransform();
            return this._pSceneTransform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "shaderPickingDetails", {
        /**
         *
         */
        get: function () {
            return this._shaderPickingDetails;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "debugVisible", {
        /**
         *
         */
        get: function () {
            return this._debugVisible;
        },
        set: function (value) {
            if (value == this._debugVisible)
                return;
            this._debugVisible = value;
            this.invalidate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "transform", {
        /**
         * An object with properties pertaining to a display object's matrix, color
         * transform, and pixel bounds. The specific properties  -  matrix,
         * colorTransform, and three read-only properties
         * (<code>concatenatedMatrix</code>, <code>concatenatedColorTransform</code>,
         * and <code>pixelBounds</code>)  -  are described in the entry for the
         * Transform class.
         *
         * <p>Each of the transform object's properties is itself an object. This
         * concept is important because the only way to set new values for the matrix
         * or colorTransform objects is to create a new object and copy that object
         * into the transform.matrix or transform.colorTransform property.</p>
         *
         * <p>For example, to increase the <code>tx</code> value of a display
         * object's matrix, you must make a copy of the entire matrix object, then
         * copy the new object into the matrix property of the transform object:</p>
         * <pre xml:space="preserve"><code> public myMatrix:Matrix =
         * myDisplayObject.transform.matrix; myMatrix.tx += 10;
         * myDisplayObject.transform.matrix = myMatrix; </code></pre>
         *
         * <p>You cannot directly set the <code>tx</code> property. The following
         * code has no effect on <code>myDisplayObject</code>: </p>
         * <pre xml:space="preserve"><code> myDisplayObject.transform.matrix.tx +=
         * 10; </code></pre>
         *
         * <p>You can also copy an entire transform object and assign it to another
         * display object's transform property. For example, the following code
         * copies the entire transform object from <code>myOldDisplayObj</code> to
         * <code>myNewDisplayObj</code>:</p>
         * <code>myNewDisplayObj.transform = myOldDisplayObj.transform;</code>
         *
         * <p>The resulting display object, <code>myNewDisplayObj</code>, now has the
         * same values for its matrix, color transform, and pixel bounds as the old
         * display object, <code>myOldDisplayObj</code>.</p>
         *
         * <p>Note that AIR for TV devices use hardware acceleration, if it is
         * available, for color transforms.</p>
         */
        get: function () {
            return this._transform;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "visible", {
        /**
         * Whether or not the display object is visible. Display objects that are not
         * visible are disabled. For example, if <code>visible=false</code> for an
         * InteractiveObject instance, it cannot be clicked.
         */
        get: function () {
            return this._explicitVisibility;
        },
        set: function (value) {
            if (this._explicitVisibility == value)
                return;
            this._explicitVisibility = value;
            this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.VISIBLE);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "masks", {
        get: function () {
            return this._explicitMasks;
        },
        set: function (value) {
            if (this._explicitMasks == value)
                return;
            this._explicitMasks = value;
            //make sure maskMode is set to true for all masks
            if (value != null && value.length) {
                var len = value.length;
                for (var i = 0; i < len; i++)
                    value[i].maskMode = true;
            }
            this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.MASKS);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "width", {
        /**
         * Indicates the width of the display object, in pixels. The width is
         * calculated based on the bounds of the content of the display object. When
         * you set the <code>width</code> property, the <code>scaleX</code> property
         * is adjusted accordingly, as shown in the following code:
         *
         * <p>Except for TextField and Video objects, a display object with no
         * content(such as an empty sprite) has a width of 0, even if you try to set
         * <code>width</code> to a different value.</p>
         */
        get: function () {
            return this.getBox().width * this.scaleX;
        },
        set: function (val) {
            if (this._width == val)
                return;
            this._width = val;
            this._setScaleX(val / this.getBox().width);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "x", {
        /**
         * Indicates the <i>x</i> coordinate of the DisplayObject instance relative
         * to the local coordinates of the parent DisplayObjectContainer. If the
         * object is inside a DisplayObjectContainer that has transformations, it is
         * in the local coordinate system of the enclosing DisplayObjectContainer.
         * Thus, for a DisplayObjectContainer rotated 90° counterclockwise, the
         * DisplayObjectContainer's children inherit a coordinate system that is
         * rotated 90° counterclockwise. The object's coordinates refer to the
         * registration point position.
         */
        get: function () {
            return this._transform.position.x;
        },
        set: function (val) {
            if (this._transform.position.x == val)
                return;
            this._transform.matrix3D.rawData[12] = val;
            this._transform.invalidatePosition();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "y", {
        /**
         * Indicates the <i>y</i> coordinate of the DisplayObject instance relative
         * to the local coordinates of the parent DisplayObjectContainer. If the
         * object is inside a DisplayObjectContainer that has transformations, it is
         * in the local coordinate system of the enclosing DisplayObjectContainer.
         * Thus, for a DisplayObjectContainer rotated 90° counterclockwise, the
         * DisplayObjectContainer's children inherit a coordinate system that is
         * rotated 90° counterclockwise. The object's coordinates refer to the
         * registration point position.
         */
        get: function () {
            return this._transform.position.y;
        },
        set: function (val) {
            if (this._transform.position.y == val)
                return;
            this._transform.matrix3D.rawData[13] = val;
            this._transform.invalidatePosition();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "z", {
        /**
         * Indicates the z coordinate position along the z-axis of the DisplayObject
         * instance relative to the 3D parent container. The z property is used for
         * 3D coordinates, not screen or pixel coordinates.
         *
         * <p>When you set a <code>z</code> property for a display object to
         * something other than the default value of <code>0</code>, a corresponding
         * Matrix3D object is automatically created. for adjusting a display object's
         * position and orientation in three dimensions. When working with the
         * z-axis, the existing behavior of x and y properties changes from screen or
         * pixel coordinates to positions relative to the 3D parent container.</p>
         *
         * <p>For example, a child of the <code>_root</code> at position x = 100, y =
         * 100, z = 200 is not drawn at pixel location(100,100). The child is drawn
         * wherever the 3D projection calculation puts it. The calculation is:</p>
         *
         * <p><code>(x~~cameraFocalLength/cameraRelativeZPosition,
         * y~~cameraFocalLength/cameraRelativeZPosition)</code></p>
         */
        get: function () {
            return this._transform.position.z;
        },
        set: function (val) {
            if (this._transform.position.z == val)
                return;
            this._transform.matrix3D.rawData[14] = val;
            this._transform.invalidatePosition();
        },
        enumerable: true,
        configurable: true
    });
    /**
     *
     */
    DisplayObject.prototype.addEventListener = function (type, listener) {
        _super.prototype.addEventListener.call(this, type, listener);
        switch (type) {
            case DisplayObjectEvent_1.DisplayObjectEvent.SCENE_CHANGED:
                this._listenToSceneChanged = true;
                break;
            case DisplayObjectEvent_1.DisplayObjectEvent.SCENETRANSFORM_CHANGED:
                this._listenToSceneTransformChanged = true;
                break;
        }
    };
    /**
     *
     */
    DisplayObject.prototype.clone = function () {
        var newInstance = new DisplayObject();
        this.copyTo(newInstance);
        return newInstance;
    };
    DisplayObject.prototype.copyTo = function (newInstance) {
        newInstance.partition = this._explicitPartition;
        newInstance.boundsType = this._boundsType;
        newInstance.pivot = this._pivot;
        newInstance.name = this._pName;
        newInstance.mouseEnabled = this._explicitMouseEnabled;
        newInstance.extra = this.extra;
        newInstance.maskMode = this._maskMode;
        newInstance.castsShadows = this.castsShadows;
        if (this._explicitMasks)
            newInstance.masks = this._explicitMasks;
        if (this._adapter)
            newInstance.adapter = this._adapter.clone(newInstance);
        newInstance._transform.matrix3D = this._transform.matrix3D;
        if (this._transform.colorTransform)
            newInstance.transform.colorTransform = this._transform.colorTransform.clone();
    };
    /**
     *
     */
    DisplayObject.prototype.dispose = function () {
        this.disposeValues();
    };
    DisplayObject.prototype.disposeValues = function () {
        if (this._pParent)
            this._pParent.removeChild(this);
        //if (this._adapter) {
        //	this._adapter.dispose();
        //	this._adapter = null;
        //}
        //this._pos = null;
        //this._rot = null;
        //this._sca = null;
        //this._ske = null;
        //this._transformComponents = null;
        //this._transform.dispose();
        //this._transform = null;
        //
        //this._matrix3D = null;
        //this._pSceneTransform = null;
        //this._inverseSceneTransform = null;
        this._explicitMasks = null;
    };
    /**
     * Returns a rectangle that defines the area of the display object relative
     * to the coordinate system of the <code>targetCoordinateSpace</code> object.
     * Consider the following code, which shows how the rectangle returned can
     * vary depending on the <code>targetCoordinateSpace</code> parameter that
     * you pass to the method:
     *
     * <p><b>Note:</b> Use the <code>localToGlobal()</code> and
     * <code>globalToLocal()</code> methods to convert the display object's local
     * coordinates to display coordinates, or display coordinates to local
     * coordinates, respectively.</p>
     *
     * <p>The <code>getBounds()</code> method is similar to the
     * <code>getRect()</code> method; however, the Rectangle returned by the
     * <code>getBounds()</code> method includes any strokes on shapes, whereas
     * the Rectangle returned by the <code>getRect()</code> method does not. For
     * an example, see the description of the <code>getRect()</code> method.</p>
     *
     * @param targetCoordinateSpace The display object that defines the
     *                              coordinate system to use.
     * @return The rectangle that defines the area of the display object relative
     *         to the <code>targetCoordinateSpace</code> object's coordinate
     *         system.
     */
    DisplayObject.prototype.getBounds = function (targetCoordinateSpace) {
        return this._bounds; //TODO
    };
    /**
     * Returns a rectangle that defines the boundary of the display object, based
     * on the coordinate system defined by the <code>targetCoordinateSpace</code>
     * parameter, excluding any strokes on shapes. The values that the
     * <code>getRect()</code> method returns are the same or smaller than those
     * returned by the <code>getBounds()</code> method.
     *
     * <p><b>Note:</b> Use <code>localToGlobal()</code> and
     * <code>globalToLocal()</code> methods to convert the display object's local
     * coordinates to Scene coordinates, or Scene coordinates to local
     * coordinates, respectively.</p>
     *
     * @param targetCoordinateSpace The display object that defines the
     *                              coordinate system to use.
     * @return The rectangle that defines the area of the display object relative
     *         to the <code>targetCoordinateSpace</code> object's coordinate
     *         system.
     */
    DisplayObject.prototype.getRect = function (targetCoordinateSpace) {
        if (targetCoordinateSpace === void 0) { targetCoordinateSpace = null; }
        return this._bounds; //TODO
    };
    DisplayObject.prototype.getBox = function (targetCoordinateSpace) {
        if (targetCoordinateSpace === void 0) { targetCoordinateSpace = null; }
        if (this._iSourcePrefab)
            this._iSourcePrefab._iValidate();
        //TODO targetCoordinateSpace
        if (this._boxBoundsInvalid) {
            this._pUpdateBoxBounds();
            //scale updates if absolute dimensions are detected
            if (this._width != null)
                this._setScaleX(this._width / this._pBoxBounds.width);
            if (this._height != null)
                this._setScaleY(this._height / this._pBoxBounds.height);
            if (this._depth != null)
                this._setScaleZ(this._depth / this._pBoxBounds.depth);
        }
        if (targetCoordinateSpace == null || targetCoordinateSpace == this)
            return this._pBoxBounds;
        if (targetCoordinateSpace == this._pParent)
            return this._transform.matrix3D.transformBox(this._pBoxBounds);
        else
            return targetCoordinateSpace.inverseSceneTransform.transformBox(this.sceneTransform.transformBox(this._pBoxBounds));
    };
    DisplayObject.prototype.getSphere = function (targetCoordinateSpace) {
        if (targetCoordinateSpace === void 0) { targetCoordinateSpace = null; }
        if (this._iSourcePrefab)
            this._iSourcePrefab._iValidate();
        if (this._sphereBoundsInvalid)
            this._pUpdateSphereBounds();
        return this._pSphereBounds;
    };
    /**
     * Converts the <code>point</code> object from the Scene(global) coordinates
     * to the display object's(local) coordinates.
     *
     * <p>To use this method, first create an instance of the Point class. The
     * <i>x</i> and <i>y</i> values that you assign represent global coordinates
     * because they relate to the origin(0,0) of the main display area. Then
     * pass the Point instance as the parameter to the
     * <code>globalToLocal()</code> method. The method returns a new Point object
     * with <i>x</i> and <i>y</i> values that relate to the origin of the display
     * object instead of the origin of the Scene.</p>
     *
     * @param point An object created with the Point class. The Point object
     *              specifies the <i>x</i> and <i>y</i> coordinates as
     *              properties.
     * @return A Point object with coordinates relative to the display object.
     */
    DisplayObject.prototype.globalToLocal = function (point, target) {
        if (target === void 0) { target = null; }
        this._tempVector3D.setTo(point.x, point.y, 0);
        var pos = this.inverseSceneTransform.transformVector(this._tempVector3D, this._tempVector3D);
        if (!target)
            target = new Point_1.Point();
        target.x = pos.x;
        target.y = pos.y;
        return target;
    };
    /**
     * Converts a two-dimensional point from the Scene(global) coordinates to a
     * three-dimensional display object's(local) coordinates.
     *
     * <p>To use this method, first create an instance of the Vector3D class. The x,
     * y and z values that you assign to the Vector3D object represent global
     * coordinates because they are relative to the origin(0,0,0) of the scene. Then
     * pass the Vector3D object to the <code>globalToLocal3D()</code> method as the
     * <code>position</code> parameter.
     * The method returns three-dimensional coordinates as a Vector3D object
     * containing <code>x</code>, <code>y</code>, and <code>z</code> values that
     * are relative to the origin of the three-dimensional display object.</p>
     *
     * @param point A Vector3D object representing global x, y and z coordinates in
     *              the scene.
     * @return A Vector3D object with coordinates relative to the three-dimensional
     *         display object.
     */
    DisplayObject.prototype.globalToLocal3D = function (position) {
        return this.inverseSceneTransform.transformVector(position);
    };
    /**
     * Evaluates the bounding box of the display object to see if it overlaps or
     * intersects with the bounding box of the <code>obj</code> display object.
     *
     * @param obj The display object to test against.
     * @return <code>true</code> if the bounding boxes of the display objects
     *         intersect; <code>false</code> if not.
     */
    DisplayObject.prototype.hitTestObject = function (obj) {
        var objBox = obj.getBox();
        if (!objBox)
            return false;
        var topLeft = new Point_1.Point(objBox.x, objBox.y);
        var bottomLeft = new Point_1.Point(objBox.x, objBox.y - objBox.height);
        var topRight = new Point_1.Point(objBox.x + objBox.width, objBox.y);
        var bottomRight = new Point_1.Point(objBox.x + objBox.width, objBox.y - objBox.height);
        topLeft = this.globalToLocal(obj.localToGlobal(topLeft));
        bottomLeft = this.globalToLocal(obj.localToGlobal(bottomLeft));
        topRight = this.globalToLocal(obj.localToGlobal(topRight));
        bottomRight = this.globalToLocal(obj.localToGlobal(bottomRight));
        var box = this.getBox();
        if (!box)
            return false;
        //first check all points against targer box
        if (topLeft.x <= box.left && topLeft.x <= box.left && topLeft.y <= box.top && topLeft.y >= box.bottom)
            return true;
        if (bottomLeft.x <= box.left && bottomLeft.x <= box.left && bottomLeft.y <= box.top && bottomLeft.y >= box.bottom)
            return true;
        if (topRight.x <= box.left && topRight.x <= box.left && topRight.y <= box.top && topRight.y >= box.bottom)
            return true;
        if (bottomRight.x <= box.left && bottomRight.x <= box.left && bottomRight.y <= box.top && bottomRight.y >= box.bottom)
            return true;
        //now test against obj box
        var n0x = topRight.y - topLeft.y;
        var n0y = -(topRight.x - topLeft.x);
        var n1x = bottomRight.y - topRight.y;
        var n1y = -(bottomRight.x - topRight.x);
        var n2x = bottomLeft.y - bottomRight.y;
        var n2y = -(bottomLeft.x - bottomRight.x);
        var n3x = topLeft.y - bottomLeft.y;
        var n3y = -(topLeft.x - bottomLeft.x);
        var p0x = box.left - topLeft.x;
        var p0y = box.top - topLeft.y;
        var p1x = box.left - topRight.x;
        var p1y = box.top - topRight.y;
        var p2x = box.left - bottomRight.x;
        var p2y = box.top - bottomRight.y;
        var p3x = box.left - bottomLeft.x;
        var p3y = box.top - bottomLeft.y;
        var dot0 = (n0x * p0x) + (n0y * p0y);
        var dot1 = (n1x * p1x) + (n1y * p1y);
        var dot2 = (n2x * p2x) + (n2y * p2y);
        var dot3 = (n3x * p3x) + (n3y * p3y);
        //check if topLeft is contained
        if (dot0 < 0 && dot1 < 0 && dot2 < 0 && dot3 < 0)
            return true;
        p0x = box.right - topLeft.x;
        p0y = box.top - topLeft.y;
        p1x = box.right - topRight.x;
        p1y = box.top - topRight.y;
        p2x = box.right - bottomRight.x;
        p2y = box.top - bottomRight.y;
        p3x = box.right - bottomLeft.x;
        p3y = box.top - bottomLeft.y;
        dot0 = (n0x * p0x) + (n0y * p0y);
        dot1 = (n1x * p1x) + (n1y * p1y);
        dot2 = (n2x * p2x) + (n2y * p2y);
        dot3 = (n3x * p3x) + (n3y * p3y);
        //check if topRight is contained
        if (dot0 < 0 && dot1 < 0 && dot2 < 0 && dot3 < 0)
            return true;
        p0x = box.left - topLeft.x;
        p0y = box.bottom - topLeft.y;
        p1x = box.left - topRight.x;
        p1y = box.bottom - topRight.y;
        p2x = box.left - bottomRight.x;
        p2y = box.bottom - bottomRight.y;
        p3x = box.left - bottomLeft.x;
        p3y = box.bottom - bottomLeft.y;
        dot0 = (n0x * p0x) + (n0y * p0y);
        dot1 = (n1x * p1x) + (n1y * p1y);
        dot2 = (n2x * p2x) + (n2y * p2y);
        dot3 = (n3x * p3x) + (n3y * p3y);
        //check if bottomLeft is contained
        if (dot0 < 0 && dot1 < 0 && dot2 < 0 && dot3 < 0)
            return true;
        p0x = box.right - topLeft.x;
        p0y = box.bottom - topLeft.y;
        p1x = box.right - topRight.x;
        p1y = box.bottom - topRight.y;
        p2x = box.right - bottomRight.x;
        p2y = box.bottom - bottomRight.y;
        p3x = box.right - bottomLeft.x;
        p3y = box.bottom - bottomLeft.y;
        dot0 = (n0x * p0x) + (n0y * p0y);
        dot1 = (n1x * p1x) + (n1y * p1y);
        dot2 = (n2x * p2x) + (n2y * p2y);
        dot3 = (n3x * p3x) + (n3y * p3y);
        //check if bottomRight is contained
        if (dot0 < 0 && dot1 < 0 && dot2 < 0 && dot3 < 0)
            return true;
        return false; //TODO
    };
    /**
     * Evaluates the display object to see if it overlaps or intersects with the
     * point specified by the <code>x</code> and <code>y</code> parameters. The
     * <code>x</code> and <code>y</code> parameters specify a point in the
     * coordinate space of the Scene, not the display object container that
     * contains the display object(unless that display object container is the
     * Scene).
     *
     * @param x         The <i>x</i> coordinate to test against this object.
     * @param y         The <i>y</i> coordinate to test against this object.
     * @param shapeFlag Whether to check against the actual pixels of the object
     *                 (<code>true</code>) or the bounding box
     *                 (<code>false</code>).
     * @param maskFlag Whether to check against the object when it is used as mask
     *                 (<code>false</code>).
     * @return <code>true</code> if the display object overlaps or intersects
     *         with the specified point; <code>false</code> otherwise.
     */
    DisplayObject.prototype.hitTestPoint = function (x, y, shapeFlag, masksFlag) {
        if (shapeFlag === void 0) { shapeFlag = false; }
        if (masksFlag === void 0) { masksFlag = false; }
        if (!this._pImplicitVisibility)
            return;
        if (this._pImplicitMaskId != -1 && !masksFlag)
            return;
        if (this._explicitMasks) {
            var numMasks = this._explicitMasks.length;
            var maskHit = false;
            for (var i = 0; i < numMasks; i++) {
                if (this._explicitMasks[i].hitTestPoint(x, y, shapeFlag, true)) {
                    maskHit = true;
                    break;
                }
            }
            if (!maskHit)
                return false;
        }
        return this._hitTestPointInternal(x, y, shapeFlag, masksFlag);
    };
    /**
     * Rotates the 3d object around to face a point defined relative to the local coordinates of the parent <code>ObjectContainer3D</code>.
     *
     * @param    target        The vector defining the point to be looked at
     * @param    upAxis        An optional vector used to define the desired up orientation of the 3d object after rotation has occurred
     */
    DisplayObject.prototype.lookAt = function (target, upAxis) {
        if (upAxis === void 0) { upAxis = null; }
        var yAxis;
        var zAxis;
        var xAxis;
        var raw;
        if (upAxis == null)
            upAxis = Vector3D_1.Vector3D.Y_AXIS;
        else
            upAxis.normalize();
        zAxis = target.subtract(this._transform.position);
        zAxis.normalize();
        xAxis = upAxis.crossProduct(zAxis);
        xAxis.normalize();
        if (xAxis.length < 0.05) {
            xAxis.x = upAxis.y;
            xAxis.y = upAxis.x;
            xAxis.z = 0;
            xAxis.normalize();
        }
        yAxis = zAxis.crossProduct(xAxis);
        raw = Matrix3DUtils_1.Matrix3DUtils.RAW_DATA_CONTAINER;
        raw[0] = xAxis.x;
        raw[1] = xAxis.y;
        raw[2] = xAxis.z;
        raw[3] = 0;
        raw[4] = yAxis.x;
        raw[5] = yAxis.y;
        raw[6] = yAxis.z;
        raw[7] = 0;
        raw[8] = zAxis.x;
        raw[9] = zAxis.y;
        raw[10] = zAxis.z;
        raw[11] = 0;
        var m = new Matrix3D_1.Matrix3D();
        m.copyRawDataFrom(raw);
        var vec = m.decompose()[1];
        this.rotationX = vec.x * MathConsts_1.MathConsts.RADIANS_TO_DEGREES;
        this.rotationY = vec.y * MathConsts_1.MathConsts.RADIANS_TO_DEGREES;
        this.rotationZ = vec.z * MathConsts_1.MathConsts.RADIANS_TO_DEGREES;
    };
    /**
     * Converts the <code>point</code> object from the display object's(local)
     * coordinates to the Scene(global) coordinates.
     *
     * <p>This method allows you to convert any given <i>x</i> and <i>y</i>
     * coordinates from values that are relative to the origin(0,0) of a
     * specific display object(local coordinates) to values that are relative to
     * the origin of the Scene(global coordinates).</p>
     *
     * <p>To use this method, first create an instance of the Point class. The
     * <i>x</i> and <i>y</i> values that you assign represent local coordinates
     * because they relate to the origin of the display object.</p>
     *
     * <p>You then pass the Point instance that you created as the parameter to
     * the <code>localToGlobal()</code> method. The method returns a new Point
     * object with <i>x</i> and <i>y</i> values that relate to the origin of the
     * Scene instead of the origin of the display object.</p>
     *
     * @param point The name or identifier of a point created with the Point
     *              class, specifying the <i>x</i> and <i>y</i> coordinates as
     *              properties.
     * @return A Point object with coordinates relative to the Scene.
     */
    DisplayObject.prototype.localToGlobal = function (point, target) {
        if (target === void 0) { target = null; }
        this._tempVector3D.setTo(point.x, point.y, 0);
        var pos = this.sceneTransform.transformVector(this._tempVector3D, this._tempVector3D);
        if (!target)
            target = new Point_1.Point();
        target.x = pos.x;
        target.y = pos.y;
        return target;
    };
    /**
     * Converts a three-dimensional point of the three-dimensional display
     * object's(local) coordinates to a three-dimensional point in the Scene
     * (global) coordinates.
     *
     * <p>This method allows you to convert any given <i>x</i>, <i>y</i> and
     * <i>z</i> coordinates from values that are relative to the origin(0,0,0) of
     * a specific display object(local coordinates) to values that are relative to
     * the origin of the Scene(global coordinates).</p>
     *
     * <p>To use this method, first create an instance of the Point class. The
     * <i>x</i> and <i>y</i> values that you assign represent local coordinates
     * because they relate to the origin of the display object.</p>
     *
     * <p>You then pass the Vector3D instance that you created as the parameter to
     * the <code>localToGlobal3D()</code> method. The method returns a new
     * Vector3D object with <i>x</i>, <i>y</i> and <i>z</i> values that relate to
     * the origin of the Scene instead of the origin of the display object.</p>
     *
     * @param position A Vector3D object containing either a three-dimensional
     *                position or the coordinates of the three-dimensional
     *                display object.
     * @return A Vector3D object representing a three-dimensional position in
     *         the Scene.
     */
    DisplayObject.prototype.localToGlobal3D = function (position) {
        return this.sceneTransform.transformVector(position);
    };
    /**
     * Moves the local point around which the object rotates.
     *
     * @param    dx        The amount of movement along the local x axis.
     * @param    dy        The amount of movement along the local y axis.
     * @param    dz        The amount of movement along the local z axis.
     */
    DisplayObject.prototype.movePivot = function (dx, dy, dz) {
        if (dx == 0 && dy == 0 && dz == 0)
            return;
        this._pivot.x += dx;
        this._pivot.y += dy;
        this._pivot.z += dz;
        this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.SCENE_TRANSFORM);
    };
    DisplayObject.prototype.reset = function () {
        this.visible = true;
        if (this._transform.matrix3D)
            this._transform.clearMatrix3D();
        if (this._transform.colorTransform)
            this._transform.clearColorTransform();
        //this.name="";
        this.masks = null;
        this.maskMode = false;
    };
    /**
     *
     */
    DisplayObject.prototype.getRenderSceneTransform = function (cameraTransform) {
        if (this.orientationMode == OrientationMode_1.OrientationMode.CAMERA_PLANE) {
            var comps = cameraTransform.decompose();
            var scale = comps[3];
            comps[0].copyFrom(this.scenePosition);
            scale.x = this.scaleX;
            scale.y = this.scaleY;
            scale.z = this.scaleZ;
            this._orientationMatrix.recompose(comps);
            //add in case of pivot
            if (this._pivot && this.alignmentMode == AlignmentMode_1.AlignmentMode.PIVOT_POINT)
                this._orientationMatrix.prependTranslation(-this._pivot.x / this.scaleX, -this._pivot.y / this.scaleY, -this._pivot.z / this.scaleZ);
            return this._orientationMatrix;
        }
        return this.sceneTransform;
    };
    /**
     *
     */
    DisplayObject.prototype.removeEventListener = function (type, listener) {
        _super.prototype.removeEventListener.call(this, type, listener);
        if (this.hasEventListener(type))
            return;
        switch (type) {
            case DisplayObjectEvent_1.DisplayObjectEvent.SCENE_CHANGED:
                this._listenToSceneChanged = false;
                break;
            case DisplayObjectEvent_1.DisplayObjectEvent.SCENETRANSFORM_CHANGED:
                this._listenToSceneTransformChanged = true;
                break;
        }
    };
    Object.defineProperty(DisplayObject.prototype, "_iAssignedPartition", {
        /**
         * @internal
         */
        get: function () {
            return this._pImplicitPartition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DisplayObject.prototype, "_iPickingCollision", {
        /**
         * @internal
         */
        get: function () {
            if (!this._pickingCollision)
                this._pickingCollision = new PickingCollision_1.PickingCollision(this);
            return this._pickingCollision;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @internal
     */
    DisplayObject.prototype.iSetParent = function (value) {
        this._pParent = value;
        if (value)
            this._iSetScene(value._pScene, value._iAssignedPartition);
        else
            this._iSetScene(null, null);
        this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.ALL);
    };
    DisplayObject.prototype.pInvalidateHierarchicalProperties = function (propDirty) {
        var newPropDirty = (this._hierarchicalPropsDirty ^ propDirty) & propDirty;
        if (!newPropDirty)
            return true;
        this._hierarchicalPropsDirty |= propDirty;
        if (newPropDirty & HierarchicalProperties_1.HierarchicalProperties.SCENE_TRANSFORM) {
            this._inverseSceneTransformDirty = true;
            this._scenePositionDirty = true;
            if (this.isEntity)
                this.invalidatePartitionBounds();
            if (this._pParent)
                this._pParent._pInvalidateBounds();
            if (this._listenToSceneTransformChanged)
                this.queueDispatch(this._sceneTransformChanged || (this._sceneTransformChanged = new DisplayObjectEvent_1.DisplayObjectEvent(DisplayObjectEvent_1.DisplayObjectEvent.SCENETRANSFORM_CHANGED, this)));
        }
        return false;
    };
    /**
     * @protected
     */
    DisplayObject.prototype._iSetScene = function (scene, partition) {
        var sceneChanged = this._pScene != scene;
        if (this._pScene && this._pImplicitPartition) {
            //unregister partition from current scene
            this._pScene._iUnregisterPartition(this._pImplicitPartition);
            //unregister entity from current partition
            this._pImplicitPartition._iUnregisterEntity(this);
            //gc abstraction objects
            this.clear();
        }
        // assign parent implicit partition if no explicit one is given
        this._pImplicitPartition = this._explicitPartition || partition;
        //assign scene
        if (sceneChanged)
            this._pScene = scene;
        if (this._pScene && this._pImplicitPartition) {
            //register partition with scene
            this._pScene._iRegisterPartition(this._pImplicitPartition);
            //register entity with new partition
            this._pImplicitPartition._iRegisterEntity(this);
        }
        if (sceneChanged && this._listenToSceneChanged)
            this.queueDispatch(this._sceneChanged || (this._sceneChanged = new DisplayObjectEvent_1.DisplayObjectEvent(DisplayObjectEvent_1.DisplayObjectEvent.SCENE_CHANGED, this)));
    };
    /**
     * @protected
     */
    DisplayObject.prototype.pUpdateSceneTransform = function () {
        if (this._iController)
            this._iController.updateController();
        this._pSceneTransform.copyFrom(this._transform.matrix3D);
        if (this._pivot) {
            if (!this._pivotScale)
                this._pivotScale = new Vector3D_1.Vector3D();
            this._pivotScale.x = this._pivot.x / this._transform.scale.x;
            this._pivotScale.y = this._pivot.y / this._transform.scale.y;
            this._pivotScale.z = this._pivot.z / this._transform.scale.z;
            this._pSceneTransform.prependTranslation(-this._pivotScale.x, -this._pivotScale.y, -this._pivotScale.z);
            if (this.alignmentMode != AlignmentMode_1.AlignmentMode.PIVOT_POINT)
                this._pSceneTransform.appendTranslation(this._pivot.x, this._pivot.y, this._pivot.z);
        }
        if (this._pParent && !this._pParent._iIsRoot)
            this._pSceneTransform.append(this._pParent.sceneTransform);
        this._matrix3DDirty = false;
        this._positionDirty = false;
        this._rotationDirty = false;
        this._skewDirty = false;
        this._scaleDirty = false;
        this._hierarchicalPropsDirty ^= HierarchicalProperties_1.HierarchicalProperties.SCENE_TRANSFORM;
    };
    /**
     *
     */
    DisplayObject.prototype._iInternalUpdate = function () {
        if (this._iController)
            this._iController.update();
        // Dispatch all queued events.
        var len = this._queuedEvents.length;
        for (var i = 0; i < len; ++i)
            this.dispatchEvent(this._queuedEvents[i]);
        this._queuedEvents.length = 0;
    };
    /**
     * @internal
     */
    DisplayObject.prototype._iIsVisible = function () {
        if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.VISIBLE)
            this._updateVisible();
        return this._pImplicitVisibility;
    };
    /**
     * @internal
     */
    DisplayObject.prototype._iAssignedMaskId = function () {
        if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.MASK_ID)
            this._updateMaskId();
        return this._pImplicitMaskId;
    };
    /**
     * @internal
     */
    DisplayObject.prototype._iAssignedMasks = function () {
        if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.MASKS)
            this._updateMasks();
        return this._pImplicitMasks;
    };
    DisplayObject.prototype._iMasksConfig = function () {
        if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.MASKS)
            this._updateMasks();
        return this._pImplicitMaskIds;
    };
    DisplayObject.prototype._iAssignedColorTransform = function () {
        if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.COLOR_TRANSFORM)
            this._updateColorTransform();
        return this._pImplicitColorTransform;
    };
    /**
     * @internal
     */
    DisplayObject.prototype._iIsMouseEnabled = function () {
        if (this._hierarchicalPropsDirty & HierarchicalProperties_1.HierarchicalProperties.MOUSE_ENABLED)
            this._updateMouseEnabled();
        return this._pImplicitMouseEnabled && this._explicitMouseEnabled;
    };
    DisplayObject.prototype._acceptTraverser = function (collector) {
        //nothing to do here
    };
    /**
     * Invalidates the 3D transformation matrix, causing it to be updated upon the next request
     *
     * @private
     */
    DisplayObject.prototype._onInvalidateMatrix3D = function (event) {
        if (this._matrix3DDirty)
            return;
        this._matrix3DDirty = true;
        this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.SCENE_TRANSFORM);
    };
    /**
     * @private
     */
    DisplayObject.prototype._onInvalidateColorTransform = function (event) {
        this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.COLOR_TRANSFORM);
    };
    DisplayObject.prototype._pInvalidateBounds = function () {
        this._boxBoundsInvalid = true;
        this._sphereBoundsInvalid = true;
        if (this.isEntity)
            this.invalidatePartitionBounds();
        if (this._pParent)
            this._pParent._pInvalidateBounds();
    };
    DisplayObject.prototype._pUpdateBoxBounds = function () {
        this._boxBoundsInvalid = false;
        if (this._pBoxBounds == null)
            this._pBoxBounds = new Box_1.Box();
    };
    DisplayObject.prototype._pUpdateSphereBounds = function () {
        this._sphereBoundsInvalid = false;
        if (this._pSphereBounds == null)
            this._pSphereBounds = new Sphere_1.Sphere();
    };
    DisplayObject.prototype.queueDispatch = function (event) {
        // Store event to be dispatched later.
        this._queuedEvents.push(event);
    };
    DisplayObject.prototype._setScaleX = function (val) {
        if (this.scaleX == val)
            return;
        this._transform.scale.x = val;
        this._transform.invalidateMatrix3D();
    };
    DisplayObject.prototype._setScaleY = function (val) {
        if (this.scaleY == val)
            return;
        this._transform.scale.y = val;
        this._transform.invalidateMatrix3D();
    };
    DisplayObject.prototype._setScaleZ = function (val) {
        if (this.scaleZ == val)
            return;
        this._transform.scale.z = val;
        this._transform.invalidateMatrix3D();
    };
    DisplayObject.prototype._updateMouseEnabled = function () {
        this._pImplicitMouseEnabled = (this._pParent) ? this._pParent.mouseChildren && this._pParent._pImplicitMouseEnabled : true;
        // If there is a parent and this child does not have a picking collider, use its parent's picking collider.
        if (this._pImplicitMouseEnabled && this._pParent && !this.pickingCollider)
            this.pickingCollider = this._pParent.pickingCollider;
        this._hierarchicalPropsDirty ^= HierarchicalProperties_1.HierarchicalProperties.MOUSE_ENABLED;
    };
    DisplayObject.prototype._updateVisible = function () {
        this._pImplicitVisibility = (this._pParent) ? this._explicitVisibility && this._pParent._iIsVisible() : this._explicitVisibility;
        this._hierarchicalPropsDirty ^= HierarchicalProperties_1.HierarchicalProperties.VISIBLE;
    };
    DisplayObject.prototype._updateMaskId = function () {
        this._pImplicitMaskId = (this._pParent && this._pParent._iAssignedMaskId() != -1) ? this._pParent._iAssignedMaskId() : this._explicitMaskId;
        this._hierarchicalPropsDirty ^= HierarchicalProperties_1.HierarchicalProperties.MASK_ID;
    };
    DisplayObject.prototype._updateMasks = function () {
        this._pImplicitMasks = (this._pParent && this._pParent._iAssignedMasks()) ? (this._explicitMasks != null) ? this._pParent._iAssignedMasks().concat([this._explicitMasks]) : this._pParent._iAssignedMasks().concat() : (this._explicitMasks != null) ? [this._explicitMasks] : null;
        this._pImplicitMaskIds.length = 0;
        if (this._pImplicitMasks && this._pImplicitMasks.length) {
            var numLayers = this._pImplicitMasks.length;
            var numChildren;
            var implicitChildren;
            var implicitChildIds;
            for (var i = 0; i < numLayers; i++) {
                implicitChildren = this._pImplicitMasks[i];
                numChildren = implicitChildren.length;
                implicitChildIds = new Array();
                for (var j = 0; j < numChildren; j++)
                    implicitChildIds.push(implicitChildren[j].id);
                this._pImplicitMaskIds.push(implicitChildIds);
            }
        }
        this._hierarchicalPropsDirty ^= HierarchicalProperties_1.HierarchicalProperties.MASKS;
    };
    DisplayObject.prototype._updateColorTransform = function () {
        if (!this._pImplicitColorTransform)
            this._pImplicitColorTransform = new ColorTransform_1.ColorTransform();
        if (this._inheritColorTransform && this._pParent && this._pParent._iAssignedColorTransform()) {
            this._pImplicitColorTransform.copyFrom(this._pParent._iAssignedColorTransform());
            if (this._transform.colorTransform)
                this._pImplicitColorTransform.prepend(this._transform.colorTransform);
        }
        else {
            if (this._transform.colorTransform)
                this._pImplicitColorTransform.copyFrom(this._transform.colorTransform);
            else
                this._pImplicitColorTransform.clear();
        }
        this._hierarchicalPropsDirty ^= HierarchicalProperties_1.HierarchicalProperties.COLOR_TRANSFORM;
    };
    DisplayObject.prototype._updateMaskMode = function () {
        if (this.maskMode)
            this.mouseEnabled = false;
        this.pInvalidateHierarchicalProperties(HierarchicalProperties_1.HierarchicalProperties.MASK_ID);
    };
    DisplayObject.prototype.clear = function () {
        _super.prototype.clear.call(this);
        var i;
        this._pImplicitColorTransform = null;
        this._pImplicitMasks = null;
    };
    DisplayObject.prototype.invalidatePartitionBounds = function () {
        this.dispatchEvent(new DisplayObjectEvent_1.DisplayObjectEvent(DisplayObjectEvent_1.DisplayObjectEvent.INVALIDATE_PARTITION_BOUNDS, this));
    };
    DisplayObject.prototype._hitTestPointInternal = function (x, y, shapeFlag, masksFlag) {
        return false;
    };
    return DisplayObject;
}(AssetBase_1.AssetBase));
exports.DisplayObject = DisplayObject;