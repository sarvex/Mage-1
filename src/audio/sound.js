import { Object3D } from 'three';
import { ENTITY_EVENTS, ENTITY_TYPES } from '../entities/constants';
import Entity from '../entities/Entity';
import { ALMOST_ZERO } from '../lib/constants';
import { AUDIO_UNABLE_TO_LOAD_SOUND } from '../lib/messages';
import { generateRandomName } from '../lib/uuid';
import Audio, {
    AUDIO_RAMPS,
    DEFAULT_AUDIO_NODE_RAMP_TIME,
    DEFAULT_AUDIO_NODE_VOLUME,
} from './Audio';

export default class Sound extends Entity {
    constructor(options = {}) {
        const {
            source,
            loop = false,
            loopStart,
            loopEnd,
            autoplay,
            reconnectOnReset,
            name = generateRandomName('sound'),
        } = options;

        super({
            ...options,
            source,
            loop,
            loopStart,
            loopEnd,
            autoplay,
            reconnectOnReset,
            name,
        });

        this.source = source;
        this.loop = loop;
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        this.autoplay = autoplay;
        this.reconnectOnReset = reconnectOnReset;
        this.name = name;

        this.connected = false;
        this.playing = false;
        this.hasPlayed = false;

        this.buffer = null;
        this.audioNode = null;
        this.volumeNode = null;

        this.setupAudio();
        this.setName(name);
        this.setBody({ body: new Object3D() });
        this.setEntityType(ENTITY_TYPES.AUDIO.DEFAULT);

        Audio.add(this);
    }

    setupAudio() {
        this.createAudioNode();
        this.createVolumeNode();
        this.setBuffer();
        this.setupAudioNodeLoop();

        this.audioNode.removeEventListener(
            ENTITY_EVENTS.AUDIO.ENDED,
            this.onSoundEnded.bind(this)
        );
        this.audioNode.addEventListener(
            ENTITY_EVENTS.AUDIO.ENDED,
            this.onSoundEnded.bind(this)
        );
    }

    get sampleRate() {
        return this.buffer.sampleRate;
    }

    get duration() {
        return this.buffer.duration * 1000;
    }

    get numberOfChannels() {
        return this.buffer.numberOfChannels;
    }

    createAudioNode() {
        this.audioNode = Audio.context.createBufferSource();
    }

    setupAudioNodeLoop() {
        this.audioNode.loop = this.loop;
        this.audioNode.loopEnd =
            this.loopEnd === undefined ? this.duration : this.loopEnd;
        this.audioNode.loopStart =
            this.loopStart === undefined ? this.duration : this.loopStart;
    }

    createVolumeNode() {
        this.volumeNode = Audio.context.createGain();
        this.volumeNode.gain.value = DEFAULT_AUDIO_NODE_VOLUME;
    }

    tryAutoplay() {
        if (this.autoplay && !this.hasPlayed) {
            this.play();
        }
    }

    connect() {
        if (this.connected) {
            this.disconnect();
        }

        this.volumeNode.connect(Audio.getMasterVolumeNode());
        this.audioNode.connect(this.volumeNode);
        this.connected = true;

        this.tryAutoplay();
    }

    disconnect() {
        if (this.connected) {
            this.volumeNode.disconnect();
            this.audioNode.disconnect();
            this.connected = false;
        }
    }

    reset = () => {
        this.playing = false;

        this.disconnect();

        this.setupAudio();
        this.connect();
    };

    dispose() {
        super.dispose();
        this.stop();
        this.disconnect();
    }

    getVolume() {
        return this.volumeNode.gain.value;
    }

    setVolume(value = DEFAULT_AUDIO_NODE_VOLUME) {
        this.volumeNode.gain.setValueAtTime(value, Audio.context.currentTime);
    }

    hasBuffer() {
        return !!this.buffer;
    }

    setBuffer() {
        const buffer = Audio.get(this.source);

        if (!buffer) {
            console.error(AUDIO_UNABLE_TO_LOAD_SOUND);
            return;
        }

        this.buffer = buffer;
        this.audioNode.buffer = buffer;
    }

    play(
        volume = this.getVolume(),
        delay = DEFAULT_AUDIO_NODE_RAMP_TIME,
        ramp = AUDIO_RAMPS.LINEAR
    ) {
        if (this.playing) return Promise.resolve();

        this.setVolume(0);
        this.audioNode.start();

        this.hasPlayed = true;
        this.playing = true;

        const audioDelay = delay / 1000; // linearRampToValueAtTime/exponentialRampToValueAtTime requires time to be expressed in seconds

        if (ramp === AUDIO_RAMPS.LINEAR) {
            this.volumeNode.gain.linearRampToValueAtTime(
                volume,
                Audio.context.currentTime + audioDelay
            );
        } else {
            this.volumeNode.gain.exponentialRampToValueAtTime(
                volume,
                Audio.context.currentTime + audioDelay
            );
        }

        return this;
    }

    onSoundEnded() {
        this.reset();
        this.dispatchEvent({ type: ENTITY_EVENTS.AUDIO.ENDED });
    }

    stop(delay = DEFAULT_AUDIO_NODE_RAMP_TIME, ramp = AUDIO_RAMPS.LINEAR) {
        const audioDelay = delay / 1000; // linearRampToValueAtTime/exponentialRampToValueAtTime requires time to be expressed in seconds

        if (ramp === AUDIO_RAMPS.LINEAR) {
            this.volumeNode.gain.linearRampToValueAtTime(
                ALMOST_ZERO,
                Audio.context.currentTime + audioDelay
            );
        } else {
            this.volumeNode.gain.exponentialRampToValueAtTime(
                ALMOST_ZERO,
                Audio.context.currentTime + audioDelay
            );
        }

        setTimeout(this.reset, delay);

        return this;
    }

    detune(value) {
        if (this.audioNode) {
            this.audioNode.detune.value = value;
        }
    }

    addEffect(effect) {
        if (!this.hasEffect() && effect) {
            this.convolverNode = Audio.context.createConvolver();
            this.mixerNode = Audio.createGain();

            if (this.hasPannerNode()) {
                this.pannerNode.disconnect();
                this.pannerNode.connect(this.mixerNode);
            } else {
                this.volumeNode.disconnect();
                this.volumeNode.connect(this.mixerNode);
            }

            //creating gains
            this.plainGainNode = Audio.context.createGain();
            this.convolverGainNode = Audio.context.createGain();

            //connect mixer to new gains
            this.mixerNode.connect(this.plainGainNode);
            this.mixerNode.connect(this.convolverGainNode);

            this.plainGainNode.connect(Audio.getMasterVolumeNode());
            this.convolverGainNode.connect(Audio.getMasterVolumeNode());

            this.convolverNode.buffer = Audio.get(effect);

            this.convolverGainNode.gain.setValueAtTime(
                0.7,
                Audio.context.currentTime
            );
            this.plainGainNode.gain.setValueAtTime(
                0.3,
                Audio.context.currentTime
            );
        }
    }
}
