// import Assets from './core/Assets';
import {
    Element,
    Entity,
    ENTITY_TYPES,
    ENTITY_EVENTS,
    Camera,
    Line,
    CurveLine,
    Plane,
    Box,
    Cube,
    Sphere,
    Cylinder,
    Grid,
    Sprite
} from './entities';

import Proton from 'three.proton.js';

import Audio, { AUDIO_RAMPS } from './audio/Audio';
import AmbientSound from './audio/AmbientSound';
import BackgroundSound from './audio/BackgroundSound';
import DirectionalSound from './audio/DirectionalSound';
import Sound from './audio/Sound';

import * as THREE from 'three';
import {
    Vector3,
    EventDispatcher
} from 'three';
import Level, { author } from './core/Level';

import Universe from './core/Universe';

import Color from './lib/Color';
import PALETTES from './lib/palettes';

import Features, { FEATURES } from './lib/features';
import * as math from './lib/math';
import * as strings from './lib/strings';
import * as uuid from './lib/uuid';
import * as workers from './lib/workers';

import Stats from './core/Stats';
import Config from './core/config';
import GameRunner from './runner/GameRunner';
import Router from './router/Router';
import Scene from './core/Scene';
import Scripts, { BUILTIN } from './scripts/Scripts';
import Controls from './controls/Controls';
import Physics, {
    PHYSICS_EVENTS,
    PHYSICS_CONSTANTS,
    physicsUtils
} from './physics';

import * as store from './store';
import { Provider, connect } from 'inferno-redux';

import * as lib_constants from './lib/constants';
import * as functions from './lib/functions';

import BaseScript from './scripts/BaseScript';

import Input, { INPUT_EVENTS } from './core/input/Input';

import AmbientLight from './lights/AmbientLight';
import SunLight from './lights/SunLight';
import PointLight from './lights/PointLight';
import SpotLight from './lights/SpotLight';
import HemisphereLight from './lights/HemisphereLight';
import Lights from './lights/Lights';
import * as light_contants from './lights/constants';

import LightLoader from './loaders/LightLoader';
import MeshLoader from './loaders/MeshLoader';

import Atmosphere from './fx/materials/Atmosphere';
import Mirror from './fx/materials/Mirror';
import Ocean from './fx/materials/Ocean';
import Water from './fx/materials/Water';

import * as Partykals from 'mage-engine.particles';

import Sky from './fx/scenery/Sky';
import Skybox from './fx/scenery/Skybox';

import Shader from './fx/shaders/Shader';

import Particles, { PARTICLES } from './fx/particles/Particles';

import ParticleEmitter from './fx/particles/ParticleEmitter';
import ProtonParticleEmitter from './fx/particles/ProtonParticleEmitter';

import Images from './images/Images';
import Models from './models/Models';
//import Shaders from './fx/shaders/Shaders';
import PostProcessing from './fx/postprocessing/PostProcessing';

const constants = {
    ...lib_constants,
    ...light_contants
};

export {
    author,
    Entity,
    Element,
    ENTITY_TYPES,
    ENTITY_EVENTS,
    Level,

    FEATURES,
    Features,
    Config,
    Scene,
    Universe,
    Scripts,
    BUILTIN,
    Router,
    GameRunner,

    store,
    Provider,
    connect,

    Controls,

    Images,
    Models,
    // Shaders,
    Audio,
    PostProcessing,
    Particles,
    PARTICLES,
    ParticleEmitter,
    ProtonParticleEmitter,
    Proton,
    Partykals,

    Physics,
    PHYSICS_EVENTS,
    PHYSICS_CONSTANTS,
    physicsUtils,

    MeshLoader,
    LightLoader,

    BaseScript,

    Input,
    INPUT_EVENTS,

    Line,
    CurveLine,
    Plane,
    Box,
    Cube,
    Cylinder,
    Sphere,
    Grid,
    Sprite,
    //AnimatedMesh,
    //ShaderMesh,
    Camera,

    Sound,
    AUDIO_RAMPS,
    // AmbientSound,
    BackgroundSound,
    DirectionalSound,

    AmbientLight,
    SunLight,
    PointLight,
    SpotLight,
    HemisphereLight,
    Lights,

    Atmosphere,
    Mirror,
    Ocean,
    Water,

    Skybox,
    Sky,

    Shader,

    Color,
    PALETTES,

    Vector3,
    EventDispatcher,
    math,
    strings,
    uuid,
    workers,
    constants,
    functions,
    Stats,

    THREE
};
