import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';

const ModelFromPublic = ({
    url,
    targetSize,
    groundBottom = false,
}: {
    url: string;
    targetSize: number;
    groundBottom?: boolean;
}) => {
    const { scene } = useGLTF(url);

    const { clone, position, scale } = useMemo(() => {
        const clone = scene.clone(true);

        // Attach to a temporary parent so updateMatrixWorld propagates
        // through the full hierarchy before we measure — this is the fix
        // for the "wrong bounds on standalone clone" bug.
        const host = new THREE.Object3D();
        host.add(clone);
        host.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(host);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = maxDim > 0 ? targetSize / maxDim : 1;

        // Scale the box extents to find centre / floor after normalisation
        const scaledMin = box.min.clone().multiplyScalar(s);
        const scaledMax = box.max.clone().multiplyScalar(s);
        const cx = (scaledMin.x + scaledMax.x) / 2;
        const cy = (scaledMin.y + scaledMax.y) / 2;
        const cz = (scaledMin.z + scaledMax.z) / 2;

        host.remove(clone);   // detach before handing to R3F

        return {
            clone,
            scale: s,
            position: new THREE.Vector3(
                -cx,
                groundBottom ? -scaledMin.y : -cy,
                -cz,
            ),
        };
    }, [scene, targetSize, groundBottom]);

    return (
        <group position={position} scale={scale}>
            <primitive object={clone} />
        </group>
    );
};

const matrixHelper = new THREE.Matrix4();

// How many consecutive hit-test frames must pass before we consider
// surface tracking stable enough to place the model.
const STABILITY_FRAMES = 25;

// Minimum distance (metres) between camera and hit point before we
// accept the surface. Prevents the model spawning inside the lens.
const MIN_HIT_DISTANCE = 0.5;

// Scratch objects — avoids allocations inside useFrame
const _euler = new THREE.Euler();
const _flatQ = new THREE.Quaternion();

/** Strips pitch + roll from a quaternion so furniture always stands upright. */
function flattenToYaw(q: THREE.Quaternion): THREE.Quaternion {
    _euler.setFromQuaternion(q, 'YXZ');
    _flatQ.setFromEuler(new THREE.Euler(0, _euler.y, 0, 'YXZ'));
    return _flatQ.clone();
}

const ARScene = ({ fileId }: { fileId: string }) => {
    const { gl, camera } = useThree();
    const session = useXR(s => s.session);

    const reticleRef        = useRef<THREE.Mesh>(null);
    const hitSourceRef      = useRef<XRHitTestSource | null>(null);
    const hitPositionRef    = useRef(new THREE.Vector3());
    const hitRotationRef    = useRef(new THREE.Quaternion());
    const hasHitRef         = useRef(false);
    const stableFramesRef   = useRef(0);
    const autoPlacedRef     = useRef(false);
    const [placedPos, setPlacedPos] = useState<THREE.Vector3 | null>(null);
    const [placedRot, setPlacedRot] = useState<THREE.Quaternion | null>(null);

    // Request a hit-test source tied to the viewer (not the device floor)
    // so results are updated every frame relative to the camera direction.
    useEffect(() => {
        if (!session) return;
        let source: XRHitTestSource | null = null;
        let cancelled = false;

        session
            .requestReferenceSpace('viewer')
            .then(viewerSpace => session.requestHitTestSource!({ space: viewerSpace }))
            .then(src => {
                if (!src) return;
                if (cancelled) { src.cancel(); return; }
                source = src;
                hitSourceRef.current = src;
            })
            .catch(() => {});

        return () => {
            cancelled = true;
            source?.cancel();
            hitSourceRef.current = null;
        };
    }, [session]);

    // Tap to re-place after the model has been auto-placed
    useEffect(() => {
        if (!session) return;
        const onSelect = () => {
            if (!hasHitRef.current) return;
            setPlacedPos(hitPositionRef.current.clone());
            setPlacedRot(flattenToYaw(hitRotationRef.current));
        };
        session.addEventListener('select', onSelect);
        return () => session.removeEventListener('select', onSelect);
    }, [session]);

    useFrame((_state, _delta, xrFrame) => {
        if (!xrFrame || !hitSourceRef.current) return;
        const refSpace = gl.xr.getReferenceSpace();
        if (!refSpace) return;

        const results = (xrFrame as XRFrame).getHitTestResults(hitSourceRef.current);

        if (results.length > 0) {
            const pose = results[0].getPose(refSpace);
            if (!pose) return;

            matrixHelper.fromArray(pose.transform.matrix);
            hitPositionRef.current.setFromMatrixPosition(matrixHelper);

            // Reject surfaces closer than MIN_HIT_DISTANCE — prevents the model
            // spawning inside the camera lens at session start.
            const dist = hitPositionRef.current.distanceTo(camera.position);
            if (dist < MIN_HIT_DISTANCE) return;

            // Strip pitch/roll so furniture always stands upright regardless of
            // surface tilt returned by the hit-test pose.
            hitRotationRef.current.copy(
                flattenToYaw(new THREE.Quaternion().setFromRotationMatrix(matrixHelper))
            );
            hasHitRef.current = true;

            if (reticleRef.current) {
                reticleRef.current.visible = true;
                reticleRef.current.position.copy(hitPositionRef.current);
                reticleRef.current.quaternion.copy(hitRotationRef.current);
            }

            stableFramesRef.current += 1;
            if (!autoPlacedRef.current && stableFramesRef.current >= STABILITY_FRAMES) {
                autoPlacedRef.current = true;
                setPlacedPos(hitPositionRef.current.clone());
                setPlacedRot(hitRotationRef.current.clone());
            }
        } else {
            // Hit lost — reset stability counter so we don't place on a stale surface
            stableFramesRef.current = 0;
            hasHitRef.current = false;
            if (reticleRef.current) reticleRef.current.visible = false;
        }
    });

    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[6, 8, 5]} intensity={1.4} castShadow />
            <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#c4b5fd" />
            <pointLight position={[0, -4, 4]} intensity={0.3} color="#818cf8" />

            {/* Surface reticle — visible while scanning, hidden once placed */}
            <mesh ref={reticleRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.07, 0.1, 32]} />
                <meshBasicMaterial color="white" side={THREE.DoubleSide} />
            </mesh>

            {placedPos && placedRot && (
                <group position={placedPos} quaternion={placedRot}>
                    <ModelFromPublic url={fileId} targetSize={0.08} groundBottom />
                </group>
            )}
        </>
    );
};

const XrCube = ({
    position,
    fileId,
    isAR,
}: {
    position: [number, number, number];
    fileId: string;
    scale?: number;  // retained for API compatibility; ignored — auto-normalised
    isAR?: boolean;
}) => {
    const groupRef = useRef<THREE.Group>(null);

    if (isAR) return <ARScene fileId={fileId} />;

    return (
        <group ref={groupRef} position={position}>
            <OrbitControls
                enableZoom
                zoomSpeed={0.8}
                rotateSpeed={0.6}
                minDistance={0.5}
                maxDistance={12}
                enableDamping
                dampingFactor={0.08}
            />
            <ambientLight intensity={0.6} />
            <directionalLight position={[6, 8, 5]} intensity={1.4} castShadow />
            <directionalLight position={[-4, 4, -4]} intensity={0.5} color="#c4b5fd" />
            <pointLight position={[0, -4, 4]} intensity={0.3} color="#818cf8" />
            <Environment preset="studio" />
            {/* targetSize=1.6, centred → model fills ~34% of the viewport */}
            <ModelFromPublic url={fileId} targetSize={1.6} />
        </group>
    );
};

export default XrCube;
