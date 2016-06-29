import { MovieClip } from "../display/MovieClip";
import { DisplayObject } from "../display/DisplayObject";
export declare class Timeline {
    private _functions;
    private _blocked;
    _update_indices: Array<number>;
    _labels: Object;
    _framescripts: Object;
    _framescripts_translated: Object;
    keyframe_indices: Array<number>;
    keyframe_firstframes: Array<number>;
    keyframe_constructframes: Array<number>;
    keyframe_durations: ArrayBufferView;
    frame_command_indices: ArrayBufferView;
    frame_recipe: ArrayBufferView;
    command_index_stream: ArrayBufferView;
    command_length_stream: ArrayBufferView;
    add_child_stream: ArrayBufferView;
    remove_child_stream: ArrayBufferView;
    update_child_stream: ArrayBufferView;
    update_child_props_length_stream: ArrayBufferView;
    update_child_props_indices_stream: ArrayBufferView;
    property_index_stream: ArrayBufferView;
    property_type_stream: ArrayBufferView;
    properties_stream_int: ArrayBufferView;
    properties_stream_f32_mtx_all: ArrayBufferView;
    properties_stream_f32_mtx_scale_rot: ArrayBufferView;
    properties_stream_f32_mtx_pos: ArrayBufferView;
    properties_stream_f32_ct: ArrayBufferView;
    properties_stream_strings: Array<string>;
    private _potentialPrototypes;
    numKeyFrames: number;
    constructor();
    init(): void;
    get_framescript(keyframe_index: number): string;
    add_framescript(value: string, keyframe_index: number): void;
    private regexIndexOf(str, regex, startpos);
    add_script_for_postcontruct(target_mc: MovieClip, keyframe_idx: number, scriptPass1?: Boolean): void;
    readonly numFrames: number;
    getPotentialChildPrototype(id: number): DisplayObject;
    getKeyframeIndexForFrameIndex(frame_index: number): number;
    getPotentialChildInstance(id: number): DisplayObject;
    registerPotentialChild(prototype: DisplayObject): void;
    jumpToLabel(target_mc: MovieClip, label: string): void;
    gotoFrame(target_mc: MovieClip, value: number, skip_script?: boolean): void;
    pass1(start_construct_idx: number, target_keyframe_idx: number, depth_sessionIDs: Object): void;
    pass2(target_mc: MovieClip): void;
    constructNextFrame(target_mc: MovieClip, queueScript?: Boolean, scriptPass1?: Boolean): void;
    remove_childs_continous(sourceMovieClip: MovieClip, frame_command_idx: number): void;
    add_childs_continous(sourceMovieClip: MovieClip, frame_command_idx: number): void;
    update_childs(target_mc: MovieClip, frame_command_idx: number): void;
    update_mtx_all(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_colortransform(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_masks(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_name(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_button_name(target: DisplayObject, sourceMovieClip: MovieClip, i: number): void;
    update_visibility(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_mtx_scale_rot(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_mtx_pos(child: DisplayObject, target_mc: MovieClip, i: number): void;
    enable_maskmode(child: DisplayObject, target_mc: MovieClip, i: number): void;
    remove_masks(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_blendmode(child: DisplayObject, target_mc: MovieClip, i: number): void;
    update_rendermode(child: DisplayObject, target_mc: MovieClip, i: number): void;
}