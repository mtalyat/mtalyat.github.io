const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

const vertexSource = `#version 300 es
in vec4 aPosition;
in vec4 aColor;
in vec4 aNormal;
uniform mat4 uObjectMatrix;
uniform mat4 uCameraMatrix;
out vec3 color;
out vec3 normal;

void main() {
    gl_Position = uCameraMatrix * uObjectMatrix * aPosition;
    color = aColor.xyz;
    normal = aNormal.xyz;
}
`;

const fragmentSource = `#version 300 es
precision mediump float;
in vec3 color;
in vec3 normal;
out vec4 outColor;

uniform int uEnableLighting;
uniform vec3 uLightDirection;

void main() {
    if(uEnableLighting == 0)
    {
        outColor = vec4(color, 1.0);
    } else
    {
        vec3 normalizedNormal = normalize(normal);
        float diffuse = max(dot(normalizedNormal, -normalize(uLightDirection)), 0.0);
        vec3 lightColor = vec3(1.0, 1.0, 1.0);
        vec3 objectColor = color;
        vec3 diffuseLight = diffuse * lightColor * objectColor;
        outColor = vec4(diffuseLight, 1.0);
    }
}
`;

// given the instance to webgl, the type, and the source code: compiles a shader and returns it
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

const shaderProgram = createShaderProgram(gl, vertexSource, fragmentSource);

const programInfo = {
    program: shaderProgram,
    attributes: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aPosition'),
        colorPosition: gl.getAttribLocation(shaderProgram, 'aColor'),
        normalPosition: gl.getAttribLocation(shaderProgram, 'aNormal'),
    },
    uniforms: {
        cameraMatrix: gl.getUniformLocation(shaderProgram, 'uCameraMatrix'),
        objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
        enableLighting: gl.getUniformLocation(shaderProgram, 'uEnableLighting'),
        lightDirection: gl.getUniformLocation(shaderProgram, 'uLightDirection'),
    }
};

// resizes the canvas if needed, returns true if it did
function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = Math.floor(canvas.clientWidth * window.devicePixelRatio);
    const displayHeight = Math.floor(canvas.clientHeight * window.devicePixelRatio);

    // if canvas is not the same size as the display, resize it
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }

    return false;
}

function createVertexBuffer(array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    return buffer;
}

function createIndexBuffer(array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(array), gl.STATIC_DRAW);
    return buffer;
}

function setRenderObjectMesh(mesh) {
    renderData.objectMesh = mesh;

    renderData.vertexBuffer = createVertexBuffer(mesh.vertices);
    renderData.indexBuffer = createIndexBuffer(mesh.indices);
}

const renderData = {
    objectMesh: null,
    vertexBuffer: null,
    indexBuffer: null
};

function renderUpdate() {
    // camera
    const fov = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, aspect, near, far);

    // set camera pos based on rotation2 (Rotation X)
    const orbitRotation = sessionData.rotation2 * Math.PI / 180;
    const orbitDistance = 15;
    const cameraPos = vec3.fromValues(0, Math.sin(orbitRotation) * orbitDistance, Math.cos(orbitRotation) * -orbitDistance);
    const targetPos = vec3.fromValues(0.0, 0.0, 0.0);
    const up = vec3.fromValues(0.0, 1.0, 0.0);
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, cameraPos, targetPos, up);

    const cameraMatrix = mat4.create();
    mat4.multiply(cameraMatrix, projectionMatrix, viewMatrix);

    // object
    const objectMatrix = mat4.create();
    // move so object is centered
    mat4.rotateY(objectMatrix, objectMatrix, (sessionData.rotation / 360) * Math.PI * 2);
    // scale it appropriately
    mat4.scale(objectMatrix, objectMatrix, vec3.fromValues(sessionData.scale, sessionData.scale, sessionData.scale));

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniforms.cameraMatrix, false, cameraMatrix);
    gl.uniformMatrix4fv(programInfo.uniforms.objectMatrix, false, objectMatrix);
    gl.uniform3fv(programInfo.uniforms.lightDirection, [0, -1, -0.4]);
    gl.uniform1i(programInfo.uniforms.enableLighting, sessionData.useLighting ? 1 : 0);
}

function updateCanvas() {
    // resize the canvas to the display size (if necessary)
    if (resizeCanvasToDisplaySize(gl.canvas)) {
        // adjust WebGL viewport to new canvas size
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
}

function draw() {
    gl.drawElements(gl.TRIANGLES, renderData.objectMesh.indices.length, gl.UNSIGNED_INT, 0);
}

function render() {
    // clear old data
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // use this program
    gl.useProgram(programInfo.program);

    // bind data to be rendered
    gl.bindBuffer(gl.ARRAY_BUFFER, renderData.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderData.indexBuffer);
    gl.enableVertexAttribArray(programInfo.attributes.vertexPosition);
    gl.vertexAttribPointer(programInfo.attributes.vertexPosition, 3, gl.FLOAT, false, 36, 0);
    gl.enableVertexAttribArray(programInfo.attributes.colorPosition);
    gl.vertexAttribPointer(programInfo.attributes.colorPosition, 3, gl.FLOAT, false, 36, 12);
    gl.enableVertexAttribArray(programInfo.attributes.normalPosition);
    gl.vertexAttribPointer(programInfo.attributes.normalPosition, 3, gl.FLOAT, false, 36, 24);

    // draw it
    renderCopy({ x: 0, y: 0, z: 0 });
}

function renderCopy(position) {
    const objectMatrix = mat4.create();
    mat4.rotateY(objectMatrix, objectMatrix, (sessionData.rotation / 360) * Math.PI * 2);
    mat4.scale(objectMatrix, objectMatrix, vec3.fromValues(sessionData.scale, sessionData.scale, sessionData.scale));
    mat4.translate(objectMatrix, objectMatrix, vec3.fromValues(position.x, position.y, position.z));

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(programInfo.uniforms.objectMatrix, false, objectMatrix);

    draw();
}
