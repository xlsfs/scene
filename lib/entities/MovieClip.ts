import Event                        = require("awayjs-core/lib/events/Event");
import AssetEvent                   = require("awayjs-core/lib/events/AssetEvent");
import ColorTransform               = require("awayjs-core/lib/geom/ColorTransform");
import IAsset                       = require("awayjs-core/lib/library/IAsset");

import DisplayObjectContainer       = require("awayjs-display/lib/containers/DisplayObjectContainer");
import DisplayObject                = require("awayjs-display/lib/base/DisplayObject");
import Mesh                         = require("awayjs-display/lib/entities/Mesh");
import Billboard                    = require("awayjs-display/lib/entities/Billboard");
import TextField                    = require("awayjs-display/lib/entities/TextField");
import MouseEvent                   = require("awayjs-display/lib/events/MouseEvent");
import IMovieClipAdapter	    	= require("awayjs-display/lib/adapters/IMovieClipAdapter");
import Timeline                     = require("awayjs-display/lib/base/Timeline");
import FrameScriptManager           = require("awayjs-display/lib/managers/FrameScriptManager");

class MovieClip extends DisplayObjectContainer
{
    private static _skipAdvance:boolean;

    private static _movieClips:Array<MovieClip> = new Array<MovieClip>();

    public static assetType:string = "[asset MovieClip]";

    private _timeline:Timeline;

    private _isButton:boolean = false;
    private _onMouseOver:(event:MouseEvent) => void;
    private _onMouseOut:(event:MouseEvent) => void;
    private _onMouseDown:(event:MouseEvent) => void;
    private _onMouseUp:(event:MouseEvent) => void;

    private _time:number = 0;// the current time inside the animation
    private _currentFrameIndex:number = -1;// the current frame

    private _isPlaying:boolean = true;// false if paused or stopped

    // not sure if needed
    private _enterFrame:Event;
    private _skipAdvance : boolean;
    private _isInit:boolean = true;

    private _potentialInstances:Object = {};
    private _depth_sessionIDs:Object = {};
    private _sessionID_childs:Object = {};

	/**
	 * adapter is used to provide MovieClip to scripts taken from different platforms
	 * setter typically managed by factory
	 */
	public get adapter():IMovieClipAdapter
	{
		return <IMovieClipAdapter> this._adapter;
	}

	public set adapter(value:IMovieClipAdapter)
	{
		this._adapter = value;
	}

    constructor(timeline:Timeline = null)
    {
        super();

        this._enterFrame = new Event(Event.ENTER_FRAME);

        this.inheritColorTransform = true;

        this._onMouseOver = (event:MouseEvent) => this.currentFrameIndex = 1;
        this._onMouseOut = (event:MouseEvent) => this.currentFrameIndex = 0;
        this._onMouseDown = (event:MouseEvent) => this.currentFrameIndex = 2;
        this._onMouseUp = (event:MouseEvent) => this.currentFrameIndex = this.currentFrameIndex == 0? 0 : 1;

        this._timeline = timeline || new Timeline();
    }

    public dispose()
    {
        this.clear();

        MovieClip._movieClips.push(this);
    }

    public clear()
    {
        super.clear();

        this._potentialInstances = {};
        this._depth_sessionIDs = {};
        this._sessionID_childs = {};
    }

    public reset_textclones()
    {
        if(this.timeline) {
            for (var key in this._potentialInstances) {
                if (this._potentialInstances[key] != null) {
                    if (this._potentialInstances[key].isAsset(TextField)) {
                        (<TextField>this._potentialInstances[key]).text = (<TextField>this.timeline.getPotentialChildPrototype(key)).text;
                    }
                    else if (this._potentialInstances[key].isAsset(MovieClip)) {
                        (<MovieClip>this._potentialInstances[key]).reset_textclones();
                    }
                }
            }
        }
    }

    public get isInit():boolean
    {
        return this._isInit;
    }
    public set isInit(value:boolean)
    {
        this._isInit = value;
    }

    public get timeline():Timeline
    {
        return this._timeline;
    }

    public set timeline(value:Timeline)
    {
        this._timeline = value;
    }

    /**
     *
     */
    public loop:boolean = true;

    public get numFrames() : number
    {
        return this._timeline.numFrames;
    }

    public jumpToLabel(label:string)
    {
        // the timeline.jumpTolabel will set currentFrameIndex
        this._timeline.jumpToLabel(this, label);
    }

    /**
     * the current index of the current active frame
     */
    public constructedKeyFrameIndex:number = -1;

    public reset():void
    {
        super.reset();

        // time only is relevant for the root mc, as it is the only one that executes the update function
        this._time = 0;

        if(this.adapter)
            this.adapter.freeFromScript();

        this.constructedKeyFrameIndex = -1;
        for (var i:number = this.numChildren - 1; i >= 0; i--)
            this.removeChildAt(i);

        this._skipAdvance = MovieClip._skipAdvance;

        var numFrames:number = this._timeline.keyframe_indices.length;
        this._isPlaying = Boolean(numFrames > 1);
        if (numFrames) {
            this._currentFrameIndex = 0;
            this._timeline.constructNextFrame(this, true, true);
        } else {
            this._currentFrameIndex = -1;
        }
    }


    public resetSessionIDs()
    {
        this._depth_sessionIDs = {};
    }

    /*
    * Setting the currentFrameIndex will move the playhead for this movieclip to the new position
     */
    public get currentFrameIndex():number
    {
        return this._currentFrameIndex;
    }

    public set currentFrameIndex(value:number)
    {
        //if currentFrame is set greater than the available number of
        //frames, the playhead is moved to the last frame in the timeline.
        //But because the frame specified was not a keyframe, no scripts are
        //executed, even if they exist on the last frame.
        var skip_script:boolean = false;

        var numFrames:number = this._timeline.keyframe_indices.length;

        if (!numFrames)
            return;

        if (value < 0) {
            value = 0;
        } else if (value >= numFrames) {
            value = numFrames - 1;
            skip_script = true;
        }

        if (this._currentFrameIndex == value)
            return;

        this._currentFrameIndex = value;

        //changing current frame will ignore advance command for that
        //update's advanceFrame function, unless advanceFrame has
        //already been executed
        this._skipAdvance = MovieClip._skipAdvance;

        this._timeline.gotoFrame(this, value, skip_script);
    }

    public addButtonListeners()
    {
        this._isButton = true;

        this.stop();

        this.addEventListener(MouseEvent.MOUSE_OVER, this._onMouseOver);
        this.addEventListener(MouseEvent.MOUSE_OUT, this._onMouseOut);
        this.addEventListener(MouseEvent.MOUSE_DOWN, this._onMouseDown);
        this.addEventListener(MouseEvent.MOUSE_UP, this._onMouseUp);
    }

    public removeButtonListeners()
    {
        this.removeEventListener(MouseEvent.MOUSE_OVER, this._onMouseOver);
        this.removeEventListener(MouseEvent.MOUSE_OUT, this._onMouseOut);
        this.removeEventListener(MouseEvent.MOUSE_DOWN, this._onMouseDown);
        this.removeEventListener(MouseEvent.MOUSE_UP, this._onMouseUp);

    }

    public getChildAtSessionID(sessionID:number):DisplayObject
    {
        return this._sessionID_childs[sessionID];
    }

    public getSessionIDDepths():Object
    {
        return this._depth_sessionIDs;
    }

    public addChildAtDepth(child:DisplayObject, depth:number, replace:boolean = true):DisplayObject
    {
        //this should be implemented for all display objects
        child.inheritColorTransform = true;

        child.reset();// this takes care of transform and visibility

        return super.addChildAtDepth(child, depth, replace);
    }

    public _addTimelineChildAt(child:DisplayObject, depth:number, sessionID:number):DisplayObject
    {
        this._depth_sessionIDs[depth] = child._sessionID = sessionID;

        this._sessionID_childs[sessionID] = child;

        return this.addChildAtDepth(child, depth);
    }

    public removeChildAtInternal(index:number):DisplayObject
    {
        var child:DisplayObject = this._children[index];

        if(child.adapter)
            child.adapter.freeFromScript();

        this.adapter.unregisterScriptObject(child);

        //check to make sure _depth_sessionIDs wasn't modified with a new child
        if (this._depth_sessionIDs[child._depthID] == child._sessionID)
            delete this._depth_sessionIDs[child._depthID];

        delete this._sessionID_childs[child._sessionID];

        child._sessionID = -1;

        return super.removeChildAtInternal(index);
    }

    public get assetType():string
    {
        return MovieClip.assetType;
    }

    /**
     * Starts playback of animation from current position
     */
    public play()
    {
        if (this._timeline.keyframe_indices.length > 1)
            this._isPlaying = true;
    }

    /**
     * should be called right before the call to away3d-render.
     */
    public update()
    {
        MovieClip._skipAdvance = true;

        this.advanceFrame();

        MovieClip._skipAdvance = false;

        // after we advanced the scenegraph, we might have some script that needs executing
        FrameScriptManager.execute_queue();

        // now we want to execute the onEnter
        this.dispatchEvent(this._enterFrame);

        // after we executed the onEnter, we might have some script that needs executing
        FrameScriptManager.execute_queue();

        // now we execute any intervals queued
        FrameScriptManager.execute_intervals();

        // finally, we execute any scripts that were added from intervals
        FrameScriptManager.execute_queue();

        //execute any disposes as a result of framescripts
        FrameScriptManager.execute_dispose();
    }

    public getPotentialChildInstance(id:number) : DisplayObject
    {
        if (!this._potentialInstances[id])
            this._potentialInstances[id] = this._timeline.getPotentialChildInstance(id);

        return this._potentialInstances[id];
    }


    /**
     * Stop playback of animation and hold current position
     */
    public stop()
    {
        this._isPlaying = false;
    }

    public clone():MovieClip
    {
        var newInstance:MovieClip = (MovieClip._movieClips.length)? MovieClip._movieClips.pop() : new MovieClip(this._timeline);

        this.copyTo(newInstance);

        return newInstance;
    }

    public copyTo(newInstance:MovieClip)
    {
        super.copyTo(newInstance);

        newInstance.timeline = this._timeline;
        newInstance.loop = this.loop;
    }

    public advanceFrame()
    {
        if (this._isPlaying && !this._skipAdvance) {
            if (this._currentFrameIndex == this._timeline.keyframe_indices.length - 1) {
                if (this.loop) // end of loop - jump to first frame.
                    this.currentFrameIndex = 0;
                else //end of timeline, stop playing
                    this._isPlaying = false;
            } else { // not end - construct next frame
                this._currentFrameIndex++;
                this._timeline.constructNextFrame(this);
            }
        }

        var len:number = this._children.length;
        var child:DisplayObject;
        for (var i:number = 0; i <  len; ++i) {
            child = this._children[i];

            if (child.isAsset(MovieClip))
                (<MovieClip> child).advanceFrame();
        }

        this._skipAdvance = false;
    }

// DEBUG CODE:
    logHierarchy(depth: number = 0):void
    {
        this.printHierarchyName(depth, this);

        var len = this._children.length;
        var child:DisplayObject;
        for (var i:number = 0; i < len; i++) {
            child = this._children[i];

            if (child.isAsset(MovieClip))
                (<MovieClip> child).logHierarchy(depth + 1);
            else
                this.printHierarchyName(depth + 1, child);
        }
    }

    printHierarchyName(depth:number, target:DisplayObject)
    {
        var str = "";
        for (var i = 0; i < depth; ++i)
            str += "--";

        str += " " + target.name + " = " + target.id;
        console.log(str);
    }

    public _clearInterfaces()
    {
        //clear out potential instances
        for (var key in this._potentialInstances) {
            var instance:DisplayObject = this._potentialInstances[key];

            //only dispose instances that are not used in script ie. do not have an instance name
            if (instance.name == "") {
                FrameScriptManager.add_child_to_dispose(instance);
                delete this._potentialInstances[key];
            } else {
                instance._clearInterfaces();
            }
        }

        super._clearInterfaces();
    }
}
export = MovieClip;
