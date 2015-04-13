class LockController extends Wage.Controller
    constructor: ->
        {camera} = Wage
        camera.rotation.set 0, 0, 0
        @pitch = new THREE.Object3D()
        @yaw = new THREE.Object3D()
        @velocity = new THREE.Vector3()
        @yaw.position.y = @config.height
        @pitch.add camera
        @yaw.add @pitch
        @move =
            forward: false
            backward: false
            left: false
            right: false
            velocity: @config.velocity
        @isOnObject = false
        @canJump = false
        @shiftClicked = false
        @enabled = false
        super

    keydown: (e) ->
        if e.altKey
            return
        switch e.keyCode
            # shift
            when 16
                @move.velocity = @config.crouch
                @yaw.position.y = @config.height/2
                @canJump = false
                @shiftClicked = true
            # w
            when 87 or 38 then @move.forward = true
            # s
            when 83 or 40 then @move.backward = true
            # a
            when 65 or 37 then @move.left = true
            # d
            when 68 or 39 then @move.right = true
            # space
            when 32
                if canJump
                    @velocity.y += @config.jumpHeight
                canJump = false
        return

    keyup: (e) ->
        switch e.keyCode
            # shift
            when 16
                @move.velocity = @config.velocity
                @yaw.position.y = @config.height
                @canJump = true
                @shiftClicked = false
            # w
            when 87 or 38 then @move.forward = false
            # s
            when 83 or 40 then @move.backward = false
            # a
            when 65 or 37 then @move.left = false
            # d
            when 68 or 39 then @move.right = false
        return

    mousemove: (e) ->
        if not @enabled
            return
        moveX = e.movementX or e.mozMovementX or e.webkitMovementX or 0
        moveY = e.movementY or e.mozMovementY or e.webkitMovementY or 0
        @yaw.rotation.y -= moveX * @config.mouseFactor
        @pitch.rotation.x = moveY * @config.mouseFactor
        @pitch.rotation.x = Math.max -Math.PI/2, Math.min(Math.PI/2, @pitch.rotation.x)
        return

    update: (dt) ->
        alpha = dt * @config.delta
        @velocity.y -= @config.fallFactor * alpha
        v = @config.velocity
        if @move.forward
            velocity.z = -v
        if @move.backward
            velocity.z = v
        if not @move.forward and not @move.backward
            velocity.z = 0
        if @move.left
            velocity.x = -v
        if @move.right
            @velocity.x = v
        if not @move.left and not @move.right
            @velocity.x = 0
        if @isOnObject
            velocity.y = Math.max 0, @velocity.y
        @yaw.translateX @velocity.x
        @yaw.translateY @velocity.y
        @yaw.translateZ @velocity.z
        if @yaw.position.y < @config.height
            @velocity.y = 0
            @yaw.position.y = if @shiftClicked then @config.height / 2 else @config.height
            @canJump = true
        return

env = self.Wage ?= {}
env.LockController = LockController
