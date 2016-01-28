import AttributesBuffer				= require("awayjs-core/lib/attributes/AttributesBuffer");
import AttributesView				= require("awayjs-core/lib/attributes/AttributesView");
import Float3Attributes				= require("awayjs-core/lib/attributes/Float3Attributes");
import Float2Attributes				= require("awayjs-core/lib/attributes/Float2Attributes");
import Short3Attributes				= require("awayjs-core/lib/attributes/Short3Attributes");
import Box							= require("awayjs-core/lib/geom/Box");
import Sphere						= require("awayjs-core/lib/geom/Sphere");
import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");

import SubGeometryBase				= require("awayjs-display/lib/base/SubGeometryBase");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");
import SubGeometryUtils				= require("awayjs-display/lib/utils/SubGeometryUtils");
import IPickingCollider				= require("awayjs-display/lib/pick/IPickingCollider");
import PickingCollisionVO			= require("awayjs-display/lib/pick/PickingCollisionVO");

/**
 * @class away.base.CurveSubGeometry
 */
class CurveSubGeometry extends SubGeometryBase
{
	public static assetType:string = "[asset CurveSubGeometry]";

	private _numVertices:number = 0;

	private _positions:Float3Attributes;
	private _curves:Float2Attributes;
	private _uvs:AttributesView;

	//used for hittesting geometry
	public cells:Array<Array<number>> = new Array<Array<number>>();
	public lastCollisionIndex:number = -1;
	public divisions:number;

	public get assetType():string
	{
		return CurveSubGeometry.assetType;
	}

	public get numVertices():number
	{
		return this._numVertices;
	}

	/**
	 *
	 */
	public get positions():Float3Attributes
	{
		return this._positions;
	}

	/**
	 *
	 */
	public get curves():Float2Attributes
	{
		return this._curves;
	}



	/**
	 *
	 */
	public get uvs():AttributesView
	{
		if (!this._uvs || this._verticesDirty[this._uvs.id])
			this.setUVs(this._uvs || this._positions);

		return this._uvs;
	}

	/**
	 *
	 */
	constructor(concatenatedBuffer:AttributesBuffer = null)
	{
		super(concatenatedBuffer);

		this._positions = this._concatenatedBuffer? <Float3Attributes> this._concatenatedBuffer.getView(0) || new Float3Attributes(this._concatenatedBuffer) : new Float3Attributes();

		this._curves = this._concatenatedBuffer? <Float2Attributes> this._concatenatedBuffer.getView(1) || new Float2Attributes(this._concatenatedBuffer) : new Float2Attributes();

		this._numVertices = this._positions.count;
	}

	public getBoxBounds(target:Box = null):Box
	{
		return SubGeometryUtils.getCurveGeometryBoxBounds(this._positions, target, this._numVertices);
	}

	public getSphereBounds(center:Vector3D, target:Sphere = null):Sphere
	{
		//TODO bounding calculations for triangles
		return target;
	}

	/**
	 *
	 */
	public setPositions(array:Array<number>, offset?:number);
	public setPositions(float32Array:Float32Array, offset?:number);
	public setPositions(float3Attributes:Float3Attributes, offset?:number);
	public setPositions(values:any, offset:number = 0)
	{
		if (values == this._positions)
			return;

		if (values instanceof Float3Attributes) {
			this.clearVertices(this._positions);
			this._positions = <Float3Attributes> values;
		} else if (values) {
			this._positions.set(values, offset);
		} else {
			this.clearVertices(this._positions);
			this._positions = new Float3Attributes(this._concatenatedBuffer);
		}

		this._numVertices = this._positions.count;

		this.pInvalidateBounds();

		this.invalidateVertices(this._positions);

		this._verticesDirty[this._positions.id] = false;
	}

	/**
	 * Updates the vertex normals based on the geometry.
	 */
	public setCurves(array:Array<number>, offset?:number);
	public setCurves(float32Array:Float32Array, offset?:number);
	public setCurves(float2Attributes:Float2Attributes, offset?:number);
	public setCurves(values:any, offset:number = 0)
	{
		if (values == this._curves)
			return;

		if (values instanceof Float2Attributes) {
			this.clearVertices(this._curves);
			this._curves = <Float2Attributes> values;
		} else if (values) {
			this._curves.set(values, offset);
		} else {
			this.clearVertices(this._curves);
			this._curves = new Float2Attributes(this._concatenatedBuffer);
		}

		this.invalidateVertices(this._curves);

		this._verticesDirty[this._curves.id] = false;
	}


	/**
	 * Updates the uvs based on the geometry.
	 */
	public setUVs(array:Array<number>, offset?:number);
	public setUVs(float32Array:Float32Array, offset?:number);
	public setUVs(attributesView:AttributesView, offset?:number);
	public setUVs(values:any, offset:number = 0)
	{
		if (values == this._uvs)
			return;

		if (values instanceof Float2Attributes || values instanceof Float3Attributes) {
			this.clearVertices(this._uvs);
			this._uvs = values;
		} else if (values) {
			if (!this._uvs || this._uvs == this._positions)
				this._uvs = new Float2Attributes(this._concatenatedBuffer);

			this._uvs.set(values, offset);
		} else if (this._uvs && this._uvs != this._positions) {
			this.clearVertices(this._uvs);
			this._uvs = this._positions;
			return;
		}

		this.invalidateVertices(this._uvs);

		this._verticesDirty[this._uvs.id] = false;
	}


	/**
	 *
	 */
	public dispose()
	{
		super.dispose();

		this._positions.dispose();
		this._positions = null;

		this._curves.dispose();
		this._curves = null;

		if (this._uvs) {
			this._uvs.dispose();
			this._uvs = null;
		}

	}

	/**
	 * Clones the current object
	 * @return An exact duplicate of the current object.
	 */
	public clone():CurveSubGeometry
	{
		var clone:CurveSubGeometry = new CurveSubGeometry(this._concatenatedBuffer? this._concatenatedBuffer.clone() : null);

		if (this.indices)
			clone.setIndices(this.indices.clone());

		if (this.uvs)
			clone.setUVs(this.uvs.clone());

		return clone;
	}

	public scaleUV(scaleU:number = 1, scaleV:number = 1)
	{
		SubGeometryUtils.scaleUVs(scaleU, scaleV, this.uvs, this.uvs.count);
	}

	/**
	 * Scales the geometry.
	 * @param scale The amount by which to scale.
	 */

	/**
	 * Scales the geometry.
	 * @param scale The amount by which to scale.
	 */
	public scale(scale:number)
	{
		SubGeometryUtils.scale(scale, this.positions, this._numVertices);
	}

	public applyTransformation(transform:Matrix3D)
	{
		SubGeometryUtils.applyTransformation(transform, this.positions, null, null, this.positions.count);
	}

	public _iTestCollision(pickingCollider:IPickingCollider, material:MaterialBase, pickingCollisionVO:PickingCollisionVO, shortestCollisionDistance:number):boolean
	{
		return pickingCollider.testCurveCollision(this, material, pickingCollisionVO, shortestCollisionDistance);
	}
}

export = CurveSubGeometry;