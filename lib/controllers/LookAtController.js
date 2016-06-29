"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Vector3D_1 = require("@awayjs/core/lib/geom/Vector3D");
var ControllerBase_1 = require("../controllers/ControllerBase");
var DisplayObjectEvent_1 = require("../events/DisplayObjectEvent");
var LookAtController = (function (_super) {
    __extends(LookAtController, _super);
    function LookAtController(targetObject, lookAtObject) {
        var _this = this;
        if (targetObject === void 0) { targetObject = null; }
        if (lookAtObject === void 0) { lookAtObject = null; }
        _super.call(this, targetObject);
        this._pOrigin = new Vector3D_1.Vector3D(0.0, 0.0, 0.0);
        this._onLookAtObjectChangedDelegate = function (event) { return _this.onLookAtObjectChanged(event); };
        if (lookAtObject)
            this.lookAtObject = lookAtObject;
        else
            this.lookAtPosition = new Vector3D_1.Vector3D();
    }
    Object.defineProperty(LookAtController.prototype, "lookAtPosition", {
        get: function () {
            return this._pLookAtPosition;
        },
        set: function (val) {
            if (this._pLookAtObject) {
                this._pLookAtObject.removeEventListener(DisplayObjectEvent_1.DisplayObjectEvent.SCENETRANSFORM_CHANGED, this._onLookAtObjectChangedDelegate);
                this._pLookAtObject = null;
            }
            this._pLookAtPosition = val;
            this.pNotifyUpdate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LookAtController.prototype, "lookAtObject", {
        get: function () {
            return this._pLookAtObject;
        },
        set: function (val) {
            if (this._pLookAtPosition)
                this._pLookAtPosition = null;
            if (this._pLookAtObject == val)
                return;
            if (this._pLookAtObject)
                this._pLookAtObject.removeEventListener(DisplayObjectEvent_1.DisplayObjectEvent.SCENETRANSFORM_CHANGED, this._onLookAtObjectChangedDelegate);
            this._pLookAtObject = val;
            if (this._pLookAtObject)
                this._pLookAtObject.addEventListener(DisplayObjectEvent_1.DisplayObjectEvent.SCENETRANSFORM_CHANGED, this._onLookAtObjectChangedDelegate);
            this.pNotifyUpdate();
        },
        enumerable: true,
        configurable: true
    });
    //@override
    LookAtController.prototype.update = function (interpolate) {
        if (interpolate === void 0) { interpolate = true; }
        if (this._pTargetObject) {
            if (this._pLookAtPosition)
                this._pTargetObject.lookAt(this._pLookAtPosition);
            else if (this._pLookAtObject)
                this._pTargetObject.lookAt(this._pLookAtObject.scene ? this._pLookAtObject.scenePosition : this._pLookAtObject.transform.position);
        }
    };
    LookAtController.prototype.onLookAtObjectChanged = function (event) {
        this.pNotifyUpdate();
    };
    return LookAtController;
}(ControllerBase_1.ControllerBase));
exports.LookAtController = LookAtController;