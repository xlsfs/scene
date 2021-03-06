import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");

import NodeBase						= require("awayjs-display/lib/partition/NodeBase");
import EntityNode					= require("awayjs-display/lib/partition/EntityNode");
import PartitionBase				= require("awayjs-display/lib/partition/PartitionBase");
import CollectorBase				= require("awayjs-display/lib/traverse/CollectorBase");
import PointLight					= require("awayjs-display/lib/entities/PointLight");
import EntityNodePool				= require("awayjs-display/lib/pool/EntityNodePool");

/**
 * @class away.partition.PointLightNode
 */
class PointLightNode extends EntityNode
{
	public static id:string = "pointLightNode";

	private _pointLight:PointLight;

	/**
	 *
	 * @param pointLight
	 */
	constructor(pool:EntityNodePool, pointLight:PointLight, partition:PartitionBase)
	{
		super(pool, pointLight, partition);

		this._pointLight = pointLight;
	}

	/**
	 * @inheritDoc
	 */
	public acceptTraverser(traverser:CollectorBase)
	{
		if (traverser.enterNode(this))
			traverser.applyPointLight(this._pointLight);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	public isCastingShadow():boolean
	{
		return false;
	}
}

export = PointLightNode;