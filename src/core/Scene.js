import Universe from "./Universe";
import Config from "./config";
import { getWindow } from "./window";
import { Clock, Scene as THREEScene, WebGLRenderer, FogExp2, LinearToneMapping } from "three";

import { generateRandomName, generateUUID } from "../lib/uuid";
import Images from "../images/Images";
import { DEFAULT_SHADOWTYPE, SHADOW_TYPES } from "../lights/constants";
import { mapShadowTypeToShadowMap } from "../lights/utils";
import { DEFAULT_OUTPUT_ENCODING, OUTPUT_ENCODINGS } from "../lib/constants";
import Physics from "../physics";
import { PHYSICS_EVENTS } from "../physics/messages";
import { ENTITY_TYPES } from "../entities/constants";
export class Scene {
    constructor() {
        this.clock = new Clock();
        this.rendererElements = {};
        this.elements = [];
        this.clearColor = 0x000000;
        this.alpha = 1.0;

        this.shadowType = mapShadowTypeToShadowMap(DEFAULT_SHADOWTYPE);
    }

    getEntityType() {
        return ENTITY_TYPES.SCENE;
    }

    createScene(name = generateRandomName("LevelName")) {
        const fog = Config.fog();

        this.scene = new THREEScene();
        this.scene.name = name;

        if (fog.enabled) {
            this.fog(fog.color, fog.density);
        }
    }

    uuid() {
        return this.scene.uuid;
    }

    getName() {
        return this.scene.name;
    }

    getScene() {
        return this.scene;
    }

    getChildren() {
        return this.scene.children;
    }

    updateChildren() {
        for (let i in this.scene.children) {
            if (this.scene.children[i].material) {
                this.scene.children[i].material.needsUpdate = true;
            }
        }
    }

    add(body, element, addUniverse = true) {
        this.scene.add(body);
        if (element) {
            this.elements.push(element);
        }

        if (addUniverse) {
            const name = element.getName();
            Universe.set(name, element);
            Universe.storeUUIDToElementNameReference(body.uuid, name);
        }
    }

    getHierarchy() {
        return [
            {
                element: this.toJSON(),
                children: [
                    this.getCamera().getHierarchy(),
                    ...this.elements
                        .filter(e => !e.hasParent() && !e.isHelper() && e.isSerializable())
                        .map(e => e.getHierarchy()),
                ],
            },
        ];
    }

    remove(body) {
        this.scene.remove(body);
        Universe.remove(body.name);
    }

    setClearColor(value, alpha = 1.0) {
        if (this.renderer) {
            this.clearColor = value;
            this.alpha = alpha;
            this.renderer.setClearColor(value, alpha);
        }
    }

    setShadowType = (type = DEFAULT_SHADOWTYPE) => {
        if (Object.keys(SHADOW_TYPES).includes(type)) {
            this.shadowType = mapShadowTypeToShadowMap(type);
            this.setRendererShadowMap();
        }
    };

    setRendererOutputEncoding = (encoding = DEFAULT_OUTPUT_ENCODING) => {
        if (Object.keys(OUTPUT_ENCODINGS).includes(encoding)) {
            this.renderer.outputEncoding = OUTPUT_ENCODINGS[encoding];
        }
    };

    setBackground = texture => {
        this.scene.background = typeof texture === "string" ? Images.get(texture) : texture;
    };

    create(name) {
        this.createScene(name);
        this.createRenderer();
        this.attachListeners();
    }

    attachListeners() {
        this.listenToResizeEvent();
        this.listenToPhysicsUpdate();
    }

    detachListeners() {
        this.stopResizeListener();
        this.stopPhysicsUpdateListener();
    }

    listenToPhysicsUpdate() {
        Physics.addEventListener(PHYSICS_EVENTS.UPDATE, this.onPhysicsUpdate);
    }

    stopPhysicsUpdateListener() {
        Physics.removeEventListener(PHYSICS_EVENTS.UPDATE, this.onPhysicsUpdate);
    }

    listenToResizeEvent() {
        const win = getWindow();
        if (win) {
            win.addEventListener("resize", this.onResize);
        }
    }

    stopResizeListener() {
        const win = getWindow();
        if (win) {
            win.removeEventListener("resize", this.onResize);
        }
    }

    dispose() {
        // destroy renderer
        this.renderer.dispose();
        // remove listener to resize
        this.detachListeners();
    }

    createCamera(camera) {
        this.camera = camera;
    }

    getDOMElement() {
        if (this.renderer) {
            return this.renderer.domElement;
        }
    }

    getCamera() {
        return this.camera;
    }

    getCameraBody() {
        return this.camera.getBody();
    }

    getRenderer() {
        return this.renderer;
    }

    getChildren() {
        return this.scene.children;
    }

    removeExistingRendererElements() {
        Object.keys(this.rendererElements).forEach(k => {
            const element = document.body.querySelector(`#${k}`);

            if (element) {
                element.remove();
            }
        });
    }

    storeRenderer(rendererElement) {
        const id = `renderer_${generateUUID()}`;
        this.rendererElements[id] = rendererElement;

        return id;
    }

    setRendererShadowMap = () => {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.shadowType;
        this.renderer.sortObjects = false;
    };

    createRenderer() {
        const { shadows, shadowType = DEFAULT_SHADOWTYPE } = Config.lights();
        const { alpha = true, antialias = true, w, h } = Config.screen();
        let container = Config.container();

        this.renderer = new WebGLRenderer({
            alpha,
            antialias,
            powerPreference: "high-performance",
        });

        if (shadows) {
            this.setShadowType(shadowType);
            this.setRendererShadowMap();
        }

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h);

        this.renderer.domElement.id = this.storeRenderer(this.renderer.domElement);
        this.removeExistingRendererElements();

        if (!container) {
            document.body.appendChild(this.renderer.domElement);
        } else {
            container.appendChild(this.renderer.domElement);
        }
    }

    setRendererToneMapping(toneMapping = LinearToneMapping, toneMappingExposure = 1) {
        this.renderer.toneMapping = toneMapping;
        this.renderer.toneMappingExposure = toneMappingExposure;
    }

    onResize = () => {
        if (!this.camera || !this.renderer) return;

        const { h, w } = Config.screen();
        this.resize(w, h);
    };

    resize(width, height) {
        if (!width || !height) return;

        const ratio = width / height;

        this.camera.getBody().aspect = ratio;
        this.camera.getBody().updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        this.renderer.setClearColor(this.clearColor, this.alpha);
        this.renderer.clear();
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera.getBody());
    }

    setFog(color, density) {
        this.scene.fog = new FogExp2(color, density);
        Config.setConfig({
            fog: {
                enabled: true,
                color,
                density,
            },
        });
    }

    update(dt) {
        Universe.update(dt);

        this.getCamera().update(dt);
    }

    onPhysicsUpdate = ({ dt }) => {
        Universe.onPhysicsUpdate(dt);
        this.getCamera().onPhysicsUpdate(dt);
    };

    toJSON() {
        return {
            name: this.getName(),
            uuid: this.uuid(),
            entityType: this.getEntityType(),
            background: this.scene.background,
            clearColor: this.clearColor,
            alpha: this.alpha,
            outputEncoding: this.outputEncoding,
            fog: this.scene.fog,
        };
    }
}

export default new Scene();
