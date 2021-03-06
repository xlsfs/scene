import IAssetClass				= require("awayjs-core/lib/library/IAssetClass");

import LineSubGeometry			= require("awayjs-display/lib/base/LineSubGeometry");
import ISubMesh					= require("awayjs-display/lib/base/ISubMesh");
import SubMeshBase				= require("awayjs-display/lib/base/SubMeshBase");
import Mesh						= require("awayjs-display/lib/entities/Mesh");
import MaterialBase				= require("awayjs-display/lib/materials/MaterialBase");

/**
 * LineSubMesh wraps a LineSubGeometry as a scene graph instantiation. A LineSubMesh is owned by a Mesh object.
 *
 *
 * @see away.base.LineSubGeometry
 * @see away.entities.Mesh
 *
 * @class away.base.LineSubMesh
 */
class LineSubMesh extends SubMeshBase implements ISubMesh
{
	public static _available:Array<LineSubMesh> = new Array<LineSubMesh>();

	public static assetType:string = "[asset LineSubMesh]";

	public static assetClass:IAssetClass = LineSubGeometry;

	/**
	 *
	 */
	public get assetType():string
	{
		return LineSubMesh.assetType;
	}

	/**
	 * The LineSubGeometry object which provides the geometry data for this LineSubMesh.
	 */
	public subGeometry:LineSubGeometry;

	/**
	 * Creates a new LineSubMesh object
	 * @param subGeometry The LineSubGeometry object which provides the geometry data for this LineSubMesh.
	 * @param parentMesh The Mesh object to which this LineSubMesh belongs.
	 * @param material An optional material used to render this LineSubMesh.
	 */
	constructor(subGeometry:LineSubGeometry, parentMesh:Mesh, material:MaterialBase = null)
	{
		super(parentMesh, material);

		this.subGeometry = subGeometry;
	}

	/**
	 *
	 */
	public dispose()
	{
		super.dispose();

		this.subGeometry = null;

		LineSubMesh._available.push(this);
	}
}

export = LineSubMesh;