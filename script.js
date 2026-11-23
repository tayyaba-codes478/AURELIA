
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

// ==========================================
// AURELIA — THE ATELIER
// CINEMATIC 3D EYEWEAR ASSEMBLY
// ==========================================

const container = document.getElementById('scene-container');

if (!container) {
    throw new Error('AURELIA: scene-container not found.');
}

// ==========================================
// SCENE
// ==========================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    38,
    1,
    0.1,
    100
);

camera.position.set(0, 0, 9);

// ==========================================
// RENDERER
// ==========================================

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

container.appendChild(renderer.domElement);

// ==========================================
// LIGHTING
// ==========================================

const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffe2b0, 3.5);
keyLight.position.set(-4, 5, 6);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0xffffff, 24, 18);
fillLight.position.set(4, 1, 5);
scene.add(fillLight);

const amberLight = new THREE.PointLight(0xc88642, 20, 16);
amberLight.position.set(-3, -2, 3);
scene.add(amberLight);

const rimLight = new THREE.PointLight(0xe5bd76, 18, 20);
rimLight.position.set(0, 3, -4);
scene.add(rimLight);

// ==========================================
// MATERIALS
// ==========================================

const tortoiseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x6c351c,
    roughness: 0.22,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.12
});

const darkTortoise = new THREE.MeshPhysicalMaterial({
    color: 0x30180e,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.15
});

const amberMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc17a35,
    roughness: 0.23,
    metalness: 0.04,
    clearcoat: 1
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0ad72,
    metalness: 0.88,
    roughness: 0.2
});

const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x96785a,
    roughness: 0.12,
    metalness: 0.08,
    transparent: true,
    opacity: 0.56,
    transmission: 0.35,
    thickness: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false
});

// ==========================================
// MAIN GLASSES
// ==========================================

const glasses = new THREE.Group();
scene.add(glasses);

glasses.scale.set(1.22, 1.22, 1.22);

// ==========================================
// CAT-EYE SHAPE
// ==========================================

function createCatEyeShape(side, inset = 0) {

    const shape = new THREE.Shape();

    const outer = 0.62 - inset;
    const inner = 0.52 - inset;
    const height = 0.39 - inset;

    // Inner corner
    shape.moveTo(-inner, -height * 0.56);

    // Upper edge
    shape.bezierCurveTo(
        -inner * 0.55, height * 1.05,
        outer * 0.45, height * 1.15,
        outer, height * 0.94
    );

    // Raised cat-eye tip
    shape.bezierCurveTo(
        outer * 1.02, height * 1.12,
        outer * 1.05, height * 0.84,
        outer * 0.97, height * 0.38
    );

    // Outer lower edge
    shape.bezierCurveTo(
        outer * 0.87, -height * 0.48,
        outer * 0.40, -height * 1.05,
        -inner * 0.20, -height * 0.92
    );

    // Lower inner edge
    shape.bezierCurveTo(
        -inner * 0.70, -height * 0.85,
        -inner * 1.03, -height * 0.45,
        -inner, -height * 0.56
    );

    shape.closePath();

    return shape;
}

// ==========================================
// FRAME BUILDER
// ==========================================

const frameParts = [];

function createFrame(side) {

    const frameGroup = new THREE.Group();

    // Mirror left and right frame shapes
    frameGroup.scale.x = side;

    const outerShape = createCatEyeShape(side, 0);
    const innerShape = createCatEyeShape(side, 0.055);

    // Frame thickness
    outerShape.holes.push(new THREE.Path());

    const hole = innerShape;

    outerShape.holes[0].copy(hole);

    const frameGeometry = new THREE.ExtrudeGeometry(
        outerShape,
        {
            depth: 0.105,
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: 0.035,
            bevelThickness: 0.025,
            curveSegments: 32
        }
    );

    const frameMesh = new THREE.Mesh(
        frameGeometry,
        tortoiseMaterial
    );

    frameMesh.position.z = 0;
    frameGroup.add(frameMesh);

    // Inner polished rim
    const innerRimShape = createCatEyeShape(side, 0.045);

    const innerRimGeometry = new THREE.ExtrudeGeometry(
        innerRimShape,
        {
            depth: 0.035,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 0.012,
            bevelThickness: 0.012
        }
    );

    const innerRim = new THREE.Mesh(
        innerRimGeometry,
        amberMaterial
    );

    innerRim.position.z = 0.025;
    innerRim.scale.set(0.94, 0.94, 1);
    frameGroup.add(innerRim);

    // Amber accent at outer cat-eye corner
    const accent = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 16, 16),
        amberMaterial
    );

    accent.scale.set(1.35, 0.75, 0.55);
    accent.position.set(0.60, 0.31, 0.12);
    frameGroup.add(accent);

    // Gold hinge decoration
    const hinge = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.075, 0.11),
        goldMaterial
    );

    hinge.position.set(0.59, 0.19, 0.08);
    frameGroup.add(hinge);

    // Hinge screws
    const screw = new THREE.Mesh(
        new THREE.SphereGeometry(0.027, 12, 12),
        darkTortoise
    );

    screw.position.set(0.62, 0.19, 0.14);
    frameGroup.add(screw);

    frameGroup.position.set(side * 0.76, 0, 0);

    glasses.add(frameGroup);

    frameParts.push({
        object: frameGroup,
        finalPosition: frameGroup.position.clone(),
        startPosition: new THREE.Vector3(
            side * 3.5,
            1.8,
            -1.8
        ),
        startRotation: new THREE.Vector3(
            0,
            side * 0.7,
            side * 0.25
        )
    });

    return frameGroup;
}

const leftFrame = createFrame(-1);
const rightFrame = createFrame(1);

// ==========================================
// LENSES
// ==========================================

const lensParts = [];

function createLens(side) {

    const lensGroup = new THREE.Group();

    lensGroup.scale.x = side;

    const lensShape = createCatEyeShape(side, 0.085);

    const lensGeometry = new THREE.ShapeGeometry(
        lensShape,
        40
    );

    const lensMesh = new THREE.Mesh(
        lensGeometry,
        lensMaterial
    );

    lensMesh.position.z = 0.075;
    lensGroup.add(lensMesh);

    // Soft lens reflection strip
    const reflection = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 0.45),
        new THREE.MeshBasicMaterial({
            color: 0xe8d4b5,
            transparent: true,
            opacity: 0.13
        })
    );

    reflection.position.set(-0.20, 0.05, 0.09);
    reflection.rotation.z = -0.18;
    lensGroup.add(reflection);

    lensGroup.position.set(side * 0.76, 0, 0.04);

    glasses.add(lensGroup);

    lensParts.push({
        object: lensGroup,
        finalPosition: lensGroup.position.clone(),
        startPosition: new THREE.Vector3(
            side * 0.76,
            side * 2.6,
            2.2
        ),
        startRotation: new THREE.Vector3(
            side * 0.35,
            side * 0.5,
            side * 0.4
        )
    });

    return lensGroup;
}

createLens(-1);
createLens(1);

// ==========================================
// CENTER BRIDGE
// ==========================================

const bridgeGroup = new THREE.Group();

const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.20, 0.02, 0),
    new THREE.Vector3(-0.12, 0.12, 0.06),
    new THREE.Vector3(0, 0.16, 0.09),
    new THREE.Vector3(0.12, 0.12, 0.06),
    new THREE.Vector3(0.20, 0.02, 0)
]);

const bridge = new THREE.Mesh(
    new THREE.TubeGeometry(bridgeCurve, 32, 0.045, 10, false),
    tortoiseMaterial
);

bridgeGroup.add(bridge);

// Gold bridge accents
const bridgeAccent = new THREE.Mesh(
    new THREE.TubeGeometry(bridgeCurve, 32, 0.018, 8, false),
    goldMaterial
);

bridgeAccent.position.z = 0.035;
bridgeGroup.add(bridgeAccent);

// ==========================================
// NOSE PADS
// ==========================================

[-1, 1].forEach(side => {

    const support = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.016, 10, 24),
        goldMaterial
    );

    support.position.set(side * 0.23, -0.13, 0.12);
    support.rotation.x = 0.35;
    support.scale.set(0.75, 1.1, 1);

    bridgeGroup.add(support);

    const pad = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 16),
        new THREE.MeshPhysicalMaterial({
            color: 0x9b856c,
            roughness: 0.32,
            metalness: 0.1
        })
    );

    pad.scale.set(0.7, 1.0, 0.35);
    pad.position.set(side * 0.25, -0.15, 0.16);

    bridgeGroup.add(pad);
});

bridgeGroup.position.set(0, 0, 0.12);
glasses.add(bridgeGroup);

// ==========================================
// TEMPLE ARMS
// ==========================================

const templeParts = [];

function createTemple(side) {

    const templeGroup = new THREE.Group();

    // Main arm curve
    const armCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(side * 0.25, 0.02, -0.04),
        new THREE.Vector3(side * 0.60, -0.02, -0.12),
        new THREE.Vector3(side * 1.05, -0.12, -0.28),
        new THREE.Vector3(side * 1.35, -0.26, -0.50),
        new THREE.Vector3(side * 1.40, -0.42, -0.65)
    ]);

    const armMesh = new THREE.Mesh(
        new THREE.TubeGeometry(armCurve, 50, 0.065, 12, false),
        darkTortoise
    );

    templeGroup.add(armMesh);

    // Gold line along the arm
    const goldLineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.045, 0.025),
        new THREE.Vector3(side * 0.30, 0.055, -0.025),
        new THREE.Vector3(side * 0.65, 0.025, -0.10),
        new THREE.Vector3(side * 1.02, -0.085, -0.26)
    ]);

    const goldLine = new THREE.Mesh(
        new THREE.TubeGeometry(goldLineCurve, 32, 0.012, 8, false),
        goldMaterial
    );

    templeGroup.add(goldLine);

    // Curved ear tip
    const tipCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 1.30, -0.23, -0.46),
        new THREE.Vector3(side * 1.40, -0.38, -0.60),
        new THREE.Vector3(side * 1.44, -0.55, -0.64)
    ]);

    const earTip = new THREE.Mesh(
        new THREE.TubeGeometry(tipCurve, 20, 0.07, 10, false),
        tortoiseMaterial
    );

    templeGroup.add(earTip);

    // Hinge cylinder
    const hinge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.16, 20),
        goldMaterial
    );

    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(side * 0.08, 0, 0.02);

    templeGroup.add(hinge);

    templeGroup.position.set(side * 0.76, 0.19, -0.08);

    glasses.add(templeGroup);

    templeParts.push({
        object: templeGroup,
        finalPosition: templeGroup.position.clone(),
        startPosition: new THREE.Vector3(
            side * 3.2,
            -2.4,
            -3.2
        ),
        startRotation: new THREE.Vector3(
            side * 0.5,
            side * 0.8,
            side * 0.4
        ),
        side
    });
}

createTemple(-1);
createTemple(1);

// ==========================================
// ASSEMBLY PARTS
// ==========================================

const assemblyParts = [
    ...frameParts,
    ...lensParts,
    {
        object: bridgeGroup,
        finalPosition: new THREE.Vector3(0, 0, 0.12),
        startPosition: new THREE.Vector3(0, -2.8, -2.8),
        startRotation: new THREE.Vector3(-0.6, 0, 0)
    },
    ...templeParts
];

// Initial exploded positions
assemblyParts.forEach(part => {

    part.object.position.copy(part.startPosition);

    if (part.startRotation) {
        part.object.rotation.set(
            part.startRotation.x,
            part.startRotation.y,
            part.startRotation.z
        );
    }
});

// ==========================================
// ASSEMBLY TIMING
// ==========================================

const clock = new THREE.Clock();

const assemblyDuration = 4.2;
let assembled = false;

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function smoothStep(t) {
    return t * t * (3 - 2 * t);
}


 // ==========================================
 // ANIMATION + INTERACTIVE MOUSE ROTATION
 // ==========================================

let mouseX = 0;
let mouseY = 0;

let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (event) => {

    targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = (event.clientY / window.innerHeight) * 2 - 1;

});

window.addEventListener('mouseleave', () => {

    targetMouseX = 0;
    targetMouseY = 0;

});

// ==========================================
// CRAFTSMANSHIP SCROLL REVEAL
// ==========================================

const craftSection = document.querySelector(".craftsmanship");

if (craftSection) {

    const craftObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    craftSection.classList.add("is-visible");

                    craftObserver.unobserve(craftSection);

                }

            });

        },
        {
            threshold: 0.18
        }
    );

    craftObserver.observe(craftSection);
}

// ==========================================
// COLLECTION — STAGGERED REVEAL
// ==========================================

const collectionSection = document.querySelector(".collection");

if (collectionSection) {

    const collectionObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    collectionSection.classList.add("is-visible");

                    collectionObserver.unobserve(collectionSection);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    collectionObserver.observe(collectionSection);
}


/* ==========================================
   ABOUT — BRAND VALUES REVEAL
========================================== */

const aboutSection = document.querySelector(".about");

if (aboutSection) {

    const aboutObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    aboutSection.classList.add("is-visible");

                    aboutObserver.unobserve(aboutSection);

                }

            });

        },
        {
            threshold: 0.2
        }
    );

    aboutObserver.observe(aboutSection);
}

function animate() {

    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    const progress = Math.min(
        elapsed / assemblyDuration,
        1
    );

    // Staggered component merging
    assemblyParts.forEach((part, index) => {

        const delay = index * 0.065;

        const localProgress = THREE.MathUtils.clamp(
            (progress - delay) / (1 - delay),
            0,
            1
        );

        const eased = easeOutCubic(localProgress);

        // Position merging
        part.object.position.lerpVectors(
            part.startPosition,
            part.finalPosition,
            eased
        );

        // Rotation alignment
        if (part.startRotation) {

            part.object.rotation.x = THREE.MathUtils.lerp(
                part.startRotation.x,
                0,
                eased
            );

            part.object.rotation.y = THREE.MathUtils.lerp(
                part.startRotation.y,
                0,
                eased
            );

            part.object.rotation.z = THREE.MathUtils.lerp(
                part.startRotation.z,
                0,
                eased
            );
        }
    });

    if (progress >= 1) {
        assembled = true;
    }

    // Smooth mouse movement
    mouseX += (targetMouseX - mouseX) * 0.045;
    mouseY += (targetMouseY - mouseY) * 0.045;

    // Final floating + interactive animation
    if (assembled) {

        glasses.position.y = Math.sin(elapsed * 1.0) * 0.055;

        glasses.rotation.y =
            Math.sin(elapsed * 0.38) * 0.17 +
            mouseX * 0.28;

        glasses.rotation.x =
            Math.sin(elapsed * 0.50) * 0.045 +
            mouseY * 0.16;

        glasses.rotation.z =
            Math.sin(elapsed * 0.32) * 0.025 -
            mouseX * 0.08;

    } else {

        glasses.position.y = 0;
        glasses.rotation.set(0, 0, 0);
    }

    renderer.render(scene, camera);
}

// ==========================================
// RESPONSIVE
// ==========================================

function resizeScene() {

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', resizeScene);

resizeScene();
animate();

// ==========================================
// LOADER
// ==========================================

window.addEventListener('load', () => {

    setTimeout(() => {

        const loader = document.getElementById('loader');
        const website = document.querySelector('.site-wrapper');

        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            loader.style.pointerEvents = 'none';
        }

        if (website) {
            website.style.opacity = '1';
            website.style.visibility = 'visible';
        }

    }, 1200);

});
