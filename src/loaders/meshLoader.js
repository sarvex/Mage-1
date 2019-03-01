import Mesh from '../entities/Mesh';
import ShaderMesh from '../entities/ShaderMesh';
import ImagesEngine from '../images/ImagesEngine'
import Loader from './Loader';
import {
    RepeatWrapping
} from 'three';

export class MeshLoader extends Loader {

    constructor() {
        super();
    }

    load(meshes = []) {
        /*
        for (var i=0; i<meshes.length; i++) {
			var current = meshes[i],
                shader = this._parseShader(current),
                script = this._parseScript(current),
                parsedMesh = this._parseMesh(current);

			if (parsedMesh.name.indexOf('_camera') > -1) {
				this._loadCamera(parsedMesh, script);
			} else {
                this._loadMesh(current, parsedMesh, script, shader);
			}
        }
        */
        meshes.forEach((object) => {
            const { mesh, script, texture } = object;
            const parsed = this.parseMesh(mesh);

            MeshLoader.loadMesh(parsed, script, texture);
        });
    }

    parseMesh(mesh) {
        return this.loader.parse(mesh);
    }

    static loadMesh(parsedMesh, script, texture) {
        //if (shader && shader.name && shader.options) {
        //    var mesh = new ShaderMesh({}, shader.name, {}, {}, shader.options);
        //} else {
            //parsedMesh.castShadow = true;
            //parsedMesh.receiveShadow = true;
        const mesh = new Mesh(parsedMesh.geometry, parsedMesh.material);
        mesh.position({ ...parsedMesh.position });
        mesh.rotation({ ...parsedMesh.rotation });
        mesh.scale({ ...parsedMesh.scale });

        //mesh.mesh.castShadow = true;
        //mesh.mesh.receiveShadow = true;
            // setting texture
            //if (current.textureKey) {
            //    var texture = imagesEngine.get(current.textureKey);
            //    texture.wrapS = RepeatWrapping;
            //    texture.wrapT = RepeatWrapping;
            //    texture.repeat.set(1, 1);
            //    mesh.mesh.material.map = texture;
            //}
        //}

        //this._attachScript(mesh, script);
    }

    _parseScript(mesh) {
        var script = (mesh.object && mesh.object.userData) ? mesh.object.userData['script'] : false,
            dir = false,
            file = false;
        if (script) {
            script = script.slice(script.lastIndexOf('scripts/') + 8);
            dir = script.slice(0, script.indexOf('/'));
            file = script.slice(script.indexOf('/') + 1);
        }

        return {
            script: script,
            dir: dir,
            file: file
        };
    }

    _parseShader(mesh) {
        var name = (mesh.object && mesh.object.userData) ? mesh.object.userData['shader_name'] : false,
            options = (mesh.object && mesh.object.userData) ? JSON.parse(mesh.object.userData['shader_options']) : false;

        if (name) {
            var opts = {};
            for (var i in options) {
                Object.assign(opts, options[i]);
            }
        }

        return {
            name: name,
            options: opts
        };
    }

    _loadCamera(mesh, script) {
        var camType = mesh.name.replace('_', '').toLowerCase();
        if (app.camera.object.type.toLowerCase() === camType) {
            app.camera.object.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
            app.camera.object.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
            app.camera.object.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);

            this._attachScript(app.camera, script);
        }
    }

    _attachScript(mesh, script) {
        if (script.dir && script.file) {
            mesh.addScript(script.file.replace('.js', ''), script.dir);
        }
    }
}

export default new MeshLoader();
