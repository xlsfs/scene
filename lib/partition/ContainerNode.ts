import IAssetClass					= require("awayjs-core/lib/library/IAssetClass");

import CollectorBase = require("awayjs-display/lib/traverse/CollectorBase");
import IEntity = require("awayjs-display/lib/entities/IEntity");
import DisplayObject = require("awayjs-display/lib/base/DisplayObject");
import DisplayObjectContainer = require("awayjs-display/lib/containers/DisplayObjectContainer");
import PartitionBase					= require("awayjs-display/lib/partition/PartitionBase");
import NodeBase = require("awayjs-display/lib/partition/NodeBase");
import EntityNode = require("awayjs-display/lib/partition/EntityNode");
import ContainerNodePool = require("awayjs-display/lib/pool/ContainerNodePool");
import INode			= require("awayjs-display/lib/partition/INode");
import IDisplayObjectNode			= require("awayjs-display/lib/partition/IDisplayObjectNode");

/**
 * Maintains scenegraph heirarchy when collecting nodes
 */
class ContainerNode extends NodeBase implements IDisplayObjectNode
{
    public isContainerNode:boolean = true;

    public _iUpdateQueueNext:IDisplayObjectNode;

    private _pool:ContainerNodePool;
    private _container : DisplayObjectContainer;
    private _partition:PartitionBase;
    private _childDepths:Array<number> = new Array<number>();
    private _childMasks:Array<INode> = new Array<INode>();
    private _numChildMasks:number = 0;

    public _pEntityNode:IDisplayObjectNode;

    constructor(pool:ContainerNodePool, container:DisplayObjectContainer, partition:PartitionBase)
    {
        super();

        this._pool = pool;
        this._container = container;
        this._partition = partition;
    }

    public get displayObject():DisplayObject
    {
        return this._container;
    }

    /**
     *
     * @param traverser
     */
    public acceptTraverser(traverser:CollectorBase)
    {
        //containers nodes are for ordering only, no need to check enterNode or debugVisible
        if (this.numEntities == 0)
            return;

        if (this._pEntityNode)
            this._pEntityNode.acceptTraverser(traverser);

        var i:number;
        for (i = 0; i < this._numChildMasks; i++)
            this._childMasks[i].acceptTraverser(traverser);

        for (i = 0; i < this._pNumChildNodes; i++)
            this._pChildNodes[i].acceptTraverser(traverser);
    }

    /**
     *
     * @param node
     * @internal
     */
    public iAddNode(node:IDisplayObjectNode)
    {
        node.parent = this;

        if (!node.isContainerNode && node.displayObject.isContainer) {
            this._pEntityNode = node;
        } else if (node.displayObject.maskMode) {
            this._childMasks.push(node);
            this._numChildMasks = this._childMasks.length;
        } else {
            var depth:number = node.displayObject._depthID;
            var len:number = this._childDepths.length;
            var index:number = len;

            while (index--)
                if (this._childDepths[index] < depth)
                    break;

            index++;

            if (index < len) {
                this._pChildNodes.splice(index, 0, node);
                this._childDepths.splice(index, 0, depth);
            } else {
                this._pChildNodes.push(node);
                this._childDepths.push(depth);
            }
            this._pNumChildNodes = this._childDepths.length;
        }

        node._iUpdateImplicitDebugVisible(this.debugChildrenVisible);

        var numEntities:number = node.numEntities;
        node = this;

        do {
            node.numEntities += numEntities;
        } while ((node = <EntityNode> node.parent) != null);
    }

    public dispose()
    {
        super.dispose();

        this._childDepths = null;
        this._childMasks = null;

        this._pool.disposeItem(this._container);
        this._partition.iRemoveEntity(this);

        this._pool = null;
        this._container = null;
        this._partition = null;
    }

    /**
     *
     * @param node
     * @internal
     */
    public iRemoveNode(node:IDisplayObjectNode)
    {
        if (!node.isContainerNode && node.displayObject.isContainer) {
            this._pEntityNode = null;
        } else if (node.displayObject.maskMode) {
            this._childMasks.splice(this._childMasks.indexOf(node), 1);
            this._numChildMasks = this._childMasks.length;
        } else {
            var index:number = this._pChildNodes.indexOf(node);

            this._pChildNodes.splice(index, 1);
            this._childDepths.splice(index, 1);

            this._pNumChildNodes = this._childDepths.length;
        }

        node._iUpdateImplicitDebugVisible(false);

        var numEntities:number = node.numEntities;
        node = this;

        do {
            node.numEntities -= numEntities;
        } while ((node = <IDisplayObjectNode> node.parent) != null);
    }
}
export = ContainerNode;