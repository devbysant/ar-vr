import { useRef } from 'react';
import * as THREE from 'three';
import { useLoader, useFrame, useThree } from '@react-three/fiber';

const ImageXrCube = ({ position, fileId }: { position: [number, number, number]; fileId: string }) => {
    const cubeRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    const s3Url = `https://renomate-3d.s3.eu-north-1.amazonaws.com/3d/${fileId}.png`;

    const ImageFromS3 = ({ url }: { url: string }) => {
        const texture = useLoader(THREE.TextureLoader, url);
        return (
            <mesh scale={[0.5, 0.5, 0.5]}>
                <planeGeometry args={[5, 5]} />
                <meshBasicMaterial map={texture} transparent />
            </mesh>
        );
    };
    useFrame(() => {
        if (cubeRef.current) {
            cubeRef.current.position.copy(camera.position);
            cubeRef.current.quaternion.copy(camera.quaternion);
            cubeRef.current.translateZ(-5);
        }
    });

    return (
        <group ref={cubeRef} position={position}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            <ImageFromS3 url={s3Url} />
        </group>
    );
};

export default ImageXrCube;
