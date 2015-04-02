Class("MeshListener", {
    MeshListener: function() {

    },

    setListeners: function() {
        //setting position change event listener
        app.interface.events.positionChange.add(this.onPositionChange);
        //setting rotation change event listener
        app.interface.events.rotationChange.add(this.onRotationChange);

        //setting material listeners
        app.interface.events.meshColorChange.add(this.onMeshColorChange);
        app.interface.events.meshVisibleChange.add(this.onMeshVisibleChange);
        app.interface.events.meshWireframeChange.add(this.onMeshWireframeChange);
        app.interface.events.meshFogChange.add(this.onMeshFogChange);

        //#TODO we need also shading option
    },

    //position change listener
    onPositionChange: function() {
        if (app.sm.typeClicked != "mesh") return;
        var position = app.mm.map.get(app.sm.uuid).position;
        //writing new position
        $('#position_x').val(position.x);
        $('#position_y').val(position.y);
        $('#position_z').val(position.z);
    },

    //rotation change listener
    onRotationChange: function() {
        if (app.sm.typeClicked != "mesh") return;
        var rotation = app.mm.map.get(app.sm.uuid).rotation;
        //writing new rotation
        $('#rotation_x').val(rotation.x);
        $('#rotation_y').val(rotation.y);
        $('#rotation_z').val(rotation.z);
    },

    //mesh color change event
    onMeshColorChange: function(color) {
        if (app.sm.typeClicked != "mesh") return;
        //changing color with new color
        window.test = app.mm.map.get(app.sm.uuid);
        app.mm.map.get(app.sm.uuid).material.color = new THREE.Color(color);
    },

    //mesh visible change
    onMeshVisibleChange: function(flag) {
        if (app.sm.typeClicked != "mesh") return;
        //changing mesh visibility
        app.mm.map.get(app.sm.uuid).visible = flag;
    },

    //mesh wireframe change event
    onMeshWireframeChange: function(flag) {
        if (app.sm.typeClicked != "mesh") return;
        //changing wireframe with new value
        app.mm.map.get(app.sm.uuid).material.wireframe = flag;
    },

    //mesh fog change
    onMeshFogChange: function(flag) {
        if (app.sm.typeClicked != "mesh") return;
        //changing mesh fog
        app.mm.map.get(app.sm.uuid).fog = flag;
    },

    //texture events listeners
    onLightMapLoaded: function(event) {
        if (app.sm.typeClicked != "mesh") return;
        var path = $(this).val().split("path")[1];
        /*
            #TODO whn using node webkit, we will read the file properly,
            now using $(this).val().spit(C:/)
        */
        var texture = THREE.ImageUtils.loadTexture("textures/"+path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);

        app.mm.map.get(app.sm.uuid).material.lightMap = texture;
    },

    onTextureLoaded: function(event) {
        if (app.sm.typeClicked != "mesh") return;
        var path = event.target.files[0].name;//$(this).val().split("path")[1];
        console.log(path);
        /*
            #TODO whn using node webkit, we will read the file properly,
            now using $(this).val().spit(C:/)
        */
        var texture = THREE.ImageUtils.loadTexture("textures/"+path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        //setting new material
        var o = app.mm.map.get(app.sm.uuid);
        o.material.map = texture;
        o.material.needsUpdate = true;
        //resetting click listener
        app.interface.meshEvents.unbind(app.mm.map.get(app.sm.uuid), "click");
        app.interface.meshEvents.bind(o, "click", function(event) {
            //now only adding this mesh to the transform control
            if (app.sm.lastClicked.uuid == event.target.uuid) return;
            app.sm.deselect();
            //Setting uuid to the scene
            app.sm.uuid = event.target.uuid;
            app.sm.typeClicked = "mesh";
            app.sm.select(event.target, "translate");
        });
    },

    onSpecularMapLoaded: function(event) {
        if (app.sm.typeClicked != "mesh") return;
        var path = event.target.files[0].name;//$(this).val().split("path")[1];
        /*
            #TODO whn using node webkit, we will read the file properly,
            now using $(this).val().spit(C:/)
        */
        var texture = THREE.ImageUtils.loadTexture("textures/"+path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        //setting new material
        var o = app.mm.map.get(app.sm.uuid);
        o.material.specularMap = texture;
        o.material.needsUpdate = true;
        //resetting click listener
        app.interface.meshEvents.unbind(app.mm.map.get(app.sm.uuid), "click");
        app.interface.meshEvents.bind(o, "click", function(event) {
            //now only adding this mesh to the transform control
            if (app.sm.lastClicked.uuid == event.target.uuid) return;
            app.sm.deselect();
            //Setting uuid to the scene
            app.sm.uuid = event.target.uuid;
            app.sm.typeClicked = "mesh";
            app.sm.select(event.target, "translate");
        });
    },

    onAlphaMapLoaded: function(event) {
        if (app.sm.typeClicked != "mesh") return;
        var path = event.target.files[0].name;//$(this).val().split("path")[1];
        /*
            #TODO whn using node webkit, we will read the file properly,
            now using $(this).val().spit(C:/)
        */
        var texture = THREE.ImageUtils.loadTexture("textures/"+path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        //setting new material
        var o = app.mm.map.get(app.sm.uuid);
        o.material.alphaMap = texture;
        o.material.needsUpdate = true;
        //resetting click listener
        app.interface.meshEvents.unbind(app.mm.map.get(app.sm.uuid), "click");
        app.interface.meshEvents.bind(o, "click", function(event) {
            //now only adding this mesh to the transform control
            if (app.sm.lastClicked.uuid == event.target.uuid) return;
            app.sm.deselect();
            //Setting uuid to the scene
            app.sm.uuid = event.target.uuid;
            app.sm.typeClicked = "mesh";
            app.sm.select(event.target, "translate");
        });
    },

    onEnvMapLoaded: function(event) {
        if (app.sm.typeClicked != "mesh") return;
        var path = event.target.files[0].name;//$(this).val().split("path")[1];
        /*
            #TODO whn using node webkit, we will read the file properly,
            now using $(this).val().spit(C:/)
        */
        var texture = THREE.ImageUtils.loadTexture("textures/"+path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        //setting new material
        var o = app.mm.map.get(app.sm.uuid);
        o.material.envMap = texture;
        o.material.needsUpdate = true;
        //resetting click listener
        app.interface.meshEvents.unbind(app.mm.map.get(app.sm.uuid), "click");
        app.interface.meshEvents.bind(o, "click", function(event) {
            //now only adding this mesh to the transform control
            if (app.sm.lastClicked.uuid == event.target.uuid) return;
            app.sm.deselect();
            //Setting uuid to the scene
            app.sm.uuid = event.target.uuid;
            app.sm.typeClicked = "mesh";
            app.sm.select(event.target, "translate");
        });
    }


});