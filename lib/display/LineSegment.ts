﻿import {Vector3D}						from "@awayjs/core/lib/geom/Vector3D";

import {IAnimator}					from "@awayjs/graphics/lib/animators/IAnimator";
import {TraverserBase}				from "@awayjs/graphics/lib/base/TraverserBase";
import {IEntity}						from "@awayjs/graphics/lib/base/IEntity";
import {IRenderable}					from "@awayjs/graphics/lib/base/IRenderable";
import {Style}						from "@awayjs/graphics/lib/base/Style";
import {StyleEvent}					from "@awayjs/graphics/lib/events/StyleEvent";
import {RenderableEvent}				from "@awayjs/graphics/lib/events/RenderableEvent";
import {MaterialBase}					from "@awayjs/graphics/lib/materials/MaterialBase";

import {DisplayObject}				from "../display/DisplayObject";
import {BoundsType}					from "../bounds/BoundsType";

/**
 * A Line Segment primitive.
 */
export class LineSegment extends DisplayObject implements IEntity, IRenderable
{
	public static traverseName:string = TraverserBase.addRenderableName("applyLineSegment");
	
	private _style:Style;
	private _onInvalidatePropertiesDelegate:(event:StyleEvent) => void;

	public static assetType:string = "[asset LineSegment]";

	private _animator:IAnimator;
	private _material:MaterialBase;

	public _startPosition:Vector3D;
	public _endPosition:Vector3D;
	public _halfThickness:number;

	/**
	 * Defines the animator of the line segment. Act on the line segment's geometry. Defaults to null
	 */
	public get animator():IAnimator
	{
		return this._animator;
	}
	
	/**
	 *
	 */
	public get assetType():string
	{
		return LineSegment.assetType;
	}

	/**
	 *
	 */
	public get startPostion():Vector3D
	{
		return this._startPosition;
	}

	public set startPosition(value:Vector3D)
	{
		if (this._startPosition == value)
			return;

		this._startPosition = value;

		this.invalidateElements();
	}

	/**
	 *
	 */
	public get endPosition():Vector3D
	{
		return this._endPosition;
	}

	public set endPosition(value:Vector3D)
	{
		if (this._endPosition == value)
			return;

		this._endPosition = value;

		this.invalidateElements();
	}

	/**
	 *
	 */
	public get material():MaterialBase
	{
		return this._material;
	}

	public set material(value:MaterialBase)
	{
		if (this.material)
			this.material.iRemoveOwner(this);

		this._material = value;

		if (this.material)
			this.material.iAddOwner(this);
	}

	/**
	 *
	 */
	public get thickness():number
	{
		return this._halfThickness*2;
	}

	public set thickness(value:number)
	{
		if (this._halfThickness == value)
			return;

		this._halfThickness = value*0.5;

		this.invalidateElements();
	}

	/**
	 * Create a line segment
	 *
	 * @param startPosition Start position of the line segment
	 * @param endPosition Ending position of the line segment
	 * @param thickness Thickness of the line
	 */
	constructor(material:MaterialBase, startPosition:Vector3D, endPosition:Vector3D, thickness:number = 1)
	{
		super();

		this._onInvalidatePropertiesDelegate = (event:StyleEvent) => this._onInvalidateProperties(event);

		this._pIsEntity = true;

		this.material = material;

		this._startPosition = startPosition;
		this._endPosition = endPosition;
		this._halfThickness = thickness*0.5;

		//default bounds type
		this._boundsType = BoundsType.AXIS_ALIGNED_BOX;
	}

	/**
	 * The style used to render the current LineSegment. If set to null, the default style of the material will be used instead.
	 */
	public get style():Style
	{
		return this._style;
	}

	public set style(value:Style)
	{
		if (this._style == value)
			return;

		if (this._style)
			this._style.removeEventListener(StyleEvent.INVALIDATE_PROPERTIES, this._onInvalidatePropertiesDelegate);

		this._style = value;

		if (this._style)
			this._style.addEventListener(StyleEvent.INVALIDATE_PROPERTIES, this._onInvalidatePropertiesDelegate);

		this.invalidateSurface();
	}


	/**
	 * @protected
	 */
	public _pUpdateBoxBounds():void
	{
		super._pUpdateBoxBounds();

		this._pBoxBounds.x = Math.min(this._startPosition.x, this._endPosition.x);
		this._pBoxBounds.y = Math.min(this._startPosition.y, this._endPosition.y);
		this._pBoxBounds.z = Math.min(this._startPosition.z, this._endPosition.z);
		this._pBoxBounds.width = Math.abs(this._startPosition.x - this._endPosition.x);
		this._pBoxBounds.height = Math.abs(this._startPosition.y - this._endPosition.y);
		this._pBoxBounds.depth = Math.abs(this._startPosition.z - this._endPosition.z);
	}

	public _pUpdateSphereBounds():void
	{
		super._pUpdateSphereBounds();

		this._pUpdateBoxBounds();

		var halfWidth:number = (this._endPosition.x - this._startPosition.x)/2;
		var halfHeight:number = (this._endPosition.y - this._startPosition.y)/2;
		var halfDepth:number = (this._endPosition.z - this._startPosition.z)/2;
		this._pSphereBounds.x = this._startPosition.x + halfWidth;
		this._pSphereBounds.y = this._startPosition.y + halfHeight;
		this._pSphereBounds.z = this._startPosition.z + halfDepth;
		this._pSphereBounds.radius = Math.sqrt(halfWidth*halfWidth + halfHeight*halfHeight + halfDepth*halfDepth);
	}

	/**
	 * @private
	 */
	public invalidateElements():void
	{
		this.dispatchEvent(new RenderableEvent(RenderableEvent.INVALIDATE_ELEMENTS, this));//TODO improve performance by only using one geometry for all line segments
	}

	public invalidateSurface():void
	{
		this.dispatchEvent(new RenderableEvent(RenderableEvent.INVALIDATE_SURFACE, this));
	}

	private _onInvalidateProperties(event:StyleEvent):void
	{
		this.invalidateSurface();
	}

	public _acceptTraverser(traverser:TraverserBase):void
	{
		traverser[LineSegment.traverseName](this);
	}
}