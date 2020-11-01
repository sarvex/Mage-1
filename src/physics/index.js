import {
    EventDispatcher
} from 'three';
import Universe from '../core/Universe';
import Config from '../core/config';
import worker from './worker';

import {
    TERMINATE_EVENT,
    LOAD_EVENT,
    UPDATE_BODY_EVENT,
    READY_EVENT,
    ADD_BOX_EVENT,
    ADD_VEHICLE_EVENT,
    DISPATCH_EVENT,
    PHYSICS_EVENTS
} from './messages';
import { getDescriptionForElement } from './utils';

export const TYPES = {
    BOX: 'BOX',
    VEHICLE: 'VEHICLE'
};

const mapTypeToAddEvent = (type) => ({
    [TYPES.BOX]: ADD_BOX_EVENT,
    [TYPES.VEHICLE]: ADD_VEHICLE_EVENT
})[type] || ADD_BOX_EVENT;

const WORKER_READY_TIMEOUT = 200;

export class Physics extends EventDispatcher {

    constructor() {
        super();
        this.worker = worker;
        this.elements = [];
        this.workerReady = false;
        this.worker.onmessage = this.handleWorkerMessages;
    };

    dispose() {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: TERMINATE_EVENT
            });
        }
    }

    init() {
        if (Config.physics().enabled) {
            this.worker.postMessage({
                type: LOAD_EVENT,
                path: Config.physics().path,
            });

            return new Promise(resolve => {
                const isWorkerReady = () => this.workerReady;
                const check = () => {
                    setTimeout(() => {
                        if (isWorkerReady()) {
                            resolve();
                        } else {
                            check();
                        }
                    }, WORKER_READY_TIMEOUT)
                };

                check();
            });
        }
        
        return Promise.resolve();
    }

    handleWorkerMessages = ({ data }) => {
        switch (data.type) {
            case READY_EVENT:
                this.workerReady = true;
                break;
            case UPDATE_BODY_EVENT:
                this.handleBodyUpdate(data);
                break;
            case TERMINATE_EVENT:
                this.handleTerminateEvent();
                break;
            case DISPATCH_EVENT:
                this.handleDispatchEvent(data);
            default:
                break;
        }
    }

    handleTerminateEvent = () => {
        this.worker.terminate();
    };

    handleBodyUpdate = ({ quaternion, position, uuid }) => {
        const element = Universe.getByUUID(uuid);
        element.handlePhysicsUpdate(position, quaternion);
    };

    handleDispatchEvent = ({ uuid, eventData, eventName }) => {
        const element = Universe.getByUUID(uuid);
        element.dispatchEvent({
            type: eventName,
            data: eventData
        });
    }

    add(element, description) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();
            this.worker.postMessage({
                type: mapTypeToAddEvent(description.type),
                ...description,
                uuid
            })
        }
    }

    addVehicle(element, options) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();
            const description = getDescriptionForElement(element);

            this.worker.postMessage({
                type: ADD_VEHICLE_EVENT,
                uuid,
                ...description,
                ...options
            })
        }
    }

    updateBodyState(element, state) {
        if (Config.physics().enabled) {
            const uuid = element.uuid();

            this.worker.postMessage({
                type: UPDATE_BODY_EVENT,
                uuid,
                state
            });
        }
    }
}

export { 
    PHYSICS_EVENTS
};

export default new Physics();