import NodeBase						= require("awayjs-display/lib/partition/NodeBase");
import CollectorBase				= require("awayjs-display/lib/traverse/CollectorBase");

/**
 * @class away.traverse.ShadowCasterCollector
 */
class ShadowCasterCollector extends CollectorBase
{
	constructor()
	{
		super();
	}

	/**
	 *
	 */
	public enterNode(node:NodeBase):boolean
	{
		var enter:boolean = this.scene._iCollectionMark != node._iCollectionMark && node.isCastingShadow();

		if (!enter) {
			node._iCollectionMark = this.scene._iCollectionMark;

			return false;
		}

		return super.enterNode(node);
	}
}

export = ShadowCasterCollector;