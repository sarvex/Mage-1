import {
    Vector3
} from 'three';
import Scene from '../core/Scene';
import { buildAssetId } from '../lib/utils/assets';
import { ROOT } from '../lib/constants';
import { ASSETS_AUDIO_LOAD_FAIL, AUDIO_CONTEXT_NOT_AVAILABLE } from '../lib/messages';

export const TIME_FOR_UPDATE = 5;
export const DELAY_FACTOR = 0.02;
export const DELAY_STEP = 1;
export const DELAY_MIN_VALUE = 0.2;
export const DELAY_NORMAL_VALUE = 40;
export const VOLUME = 2;
export const DEFAULT_AUDIO_NODE_VOLUME = 5;
export const DEFAULT_AUDIO_NODE_RAMP_TIME = 100; // value in ms

export const AUDIO_RAMPS = {
    LINEAR: 'LINEAR',
    EXPONENTIAL: 'EXPONENTIAL'
};

export class Audio {

    constructor() {
        this.masterVolumeNode = null;
        this.context = null;

        this.sounds = [];
        this.map = {};

        this.currentLevel = ROOT;
    }

    reset() {
        this.sounds = [];
    }

    setCurrentLevel = level => {
        this.currentLevel = level;
    }

    hasContext() {
        return !!this.context;
    }

    hasSounds() {
        return this.sounds.length > 0;
    }

    createAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext || null;

        if (!this.hasContext()) {
            if (AudioContext) {
                this.context = new AudioContext();
                this.createMasterVolumeNode();
            } else {
                console.error(AUDIO_CONTEXT_NOT_AVAILABLE);
            }
        }
    }

    createMasterVolumeNode() {
        this.masterVolumeNode = this.context.createGain();
        this.setVolume(VOLUME);

        this.masterVolumeNode.connect(this.getDestination());
    }

    getDestination() {
        if (this.context) {
            return this.context.destination;
        }
        console.log(AUDIO_CONTEXT_NOT_AVAILABLE);
    }

    getVolume() {
        if (this.masterVolumeNode) {
            return this.masterVolumeNode.gain.value;
        }
        console.log(AUDIO_CONTEXT_NOT_AVAILABLE);
    }

    getMasterVolumeNode() {
        return this.masterVolumeNode;
    }

    setVolume(value) {
        this.masterVolumeNode.gain.setValueAtTime(value, this.context.currentTime);
    }

    load = (audio = {}, level) => {
        this.audio = audio;
        this.createAudioContext();

        if (Object.keys(this.audio).length === 0) {
            return Promise.resolve();
        }

        return Promise
            .all(Object
                .keys(this.audio)
                .map(id => this.loadSingleFile(id, level))
            )
            .catch(e => {
                console.log(ASSETS_AUDIO_LOAD_FAIL);
                console.log(e);

                return Promise.resolve();
            });
    }

    get(id) {
        return this.map[id] || this.map[buildAssetId(id, this.currentLevel)] || false;
    }

    loadSingleFile = (name, level) => {
        const path = this.audio[name];
        const request = new XMLHttpRequest();
        const id = buildAssetId(name, level);

        return new Promise(resolve => {
            request.open("GET", path, true);
            request.responseType = "arraybuffer";
            request.onreadystatechange = (e) => {
                if (request.readyState === 4 && request.status === 200) {
                    this.context.decodeAudioData(request.response,
                        buffer => {
                            this.map[id] = buffer;
                            resolve();
                        },
                        () => {
                            this.map[id] = null;
                            resolve();
                        });
                }
            };
            request.send();
        })
    }

    add(sound) {
        this.sounds.push(sound);
    }

    updateListenerPosition() {
        Scene.getCameraBody().updateMatrixWorld();
        const p = new Vector3();
        p.setFromMatrixPosition(Scene.getCameraBody().matrixWorld);

        this.context.listener.positionX.setValueAtTime(p.x, this.context.currentTime);
        this.context.listener.positionY.setValueAtTime(p.y, this.context.currentTime);
        this.context.listener.positionZ.setValueAtTime(p.z, this.context.currentTime);
    }

    updatelistenerOrientation() {
        const m = Scene.getCameraBody().matrix;
        const mx = m.elements[12], my = m.elements[13], mz = m.elements[14];
        m.elements[12] = m.elements[13] = m.elements[14] = 0;

        const vec = new Vector3(0,0,1);
        vec.applyMatrix4(m);
        vec.normalize();

        const up = new Vector3(0,-1,0);
        up.applyMatrix4(m);
        up.normalize();

        this.context.listener.forwardX.setValueAtTime(vec.x, this.context.currentTime);
        this.context.listener.forwardY.setValueAtTime(vec.y, this.context.currentTime);
        this.context.listener.forwardZ.setValueAtTime(vec.z, this.context.currentTime);
        this.context.listener.upX.setValueAtTime(up.x, this.context.currentTime);
        this.context.listener.upY.setValueAtTime(up.y, this.context.currentTime);
        this.context.listener.upZ.setValueAtTime(up.z, this.context.currentTime);

        m.elements[12] = mx;
        m.elements[13] = my;
        m.elements[14] = mz;
    }

    dispose() {
        for (var index in this.sounds) {
            const sound = this.sounds[index];
            sound.dispose();
        }

        this.reset();
    }

    update(dt) {
        if (!this.hasContext()) return;

        if (this.hasSounds()) {
            this.updateListenerPosition();
            this.updatelistenerOrientation();
        }

        const start = new Date();
        for (var index in this.sounds) {
            const sound = this.sounds[index];
            sound.update(dt);

            if ((+new Date() - start) > TIME_FOR_UPDATE) break;
        }
    }
}

export default new Audio();
