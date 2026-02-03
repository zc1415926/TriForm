'use client';

import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    DirectionalLight,
    Vector3,
    Color3,
    Color4,
    StandardMaterial,
    SceneLoader,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { useEffect, useRef, useState } from 'react';

interface StlModelViewerProps {
    fileUrl: string;
    fileName: string;
    onError?: (error: string) => void;
}

export function StlModelViewer({ fileUrl, fileName, onError }: StlModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;

        // 创建 Babylon.js 引擎
        const engine = new Engine(canvas, true, {
            antialias: true,
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false,
            powerPreference: 'high-performance',
        });

        engineRef.current = engine;

        // 创建场景
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);
        scene.environmentTexture = null;

        // 创建相机 - 允许用户交互
        const camera = new ArcRotateCamera(
            'camera',
            Math.PI / 4,
            Math.PI / 3,
            15,
            Vector3.Zero(),
            scene,
        );
        camera.attachControl(canvas, true);
        camera.wheelPrecision = 50;
        camera.minZ = 0.1;
        camera.maxZ = 1000;
        camera.lowerRadiusLimit = 2;
        camera.upperRadiusLimit = 50;

        // 添加环境光
        const ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), scene);
        ambientLight.intensity = 0.6;
        ambientLight.diffuse = new Color3(1, 1, 1);
        ambientLight.groundColor = new Color3(0.2, 0.2, 0.2);

        // 添加主光源
        const mainLight = new DirectionalLight('mainLight', new Vector3(-1, -2, -1), scene);
        mainLight.intensity = 0.8;
        mainLight.diffuse = new Color3(1, 1, 1);
        mainLight.specular = new Color3(1, 1, 1);

        // 添加辅助光源
        const fillLight = new DirectionalLight('fillLight', new Vector3(1, -1, 1), scene);
        fillLight.intensity = 0.5;
        fillLight.diffuse = new Color3(1, 1, 1);

        // 获取文件扩展名
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

        // 根据文件类型确定加载器扩展名
        const loaderExtension = fileExtension === 'obj' ? '.obj' : '.stl';

        // 使用 ImportMesh 加载模型
        SceneLoader.ImportMesh(
            null,
            fileUrl,
            '',
            scene,
            (meshes) => {
                if (meshes.length > 0) {
                    const modelMeshes = meshes;

                    // 创建材质
                    const material = new StandardMaterial('modelMaterial', scene);
                    material.diffuseColor = new Color3(0.5, 0.5, 0.5);
                    material.specularColor = new Color3(0.1, 0.1, 0.1);
                    material.specularPower = 8;
                    material.ambientColor = new Color3(0.3, 0.3, 0.3);
                    material.emissiveColor = new Color3(0, 0, 0);
                    material.backFaceCulling = false;

                    // 应用材质到所有模型网格
                    modelMeshes.forEach((mesh) => {
                        mesh.material = material;
                    });

                    // 计算所有模型的边界框
                    let minBBox = modelMeshes[0].getBoundingInfo().minimum.clone();
                    let maxBBox = modelMeshes[0].getBoundingInfo().maximum.clone();

                    for (let i = 1; i < modelMeshes.length; i++) {
                        const bbox = modelMeshes[i].getBoundingInfo();
                        minBBox = Vector3.Minimize(minBBox, bbox.minimum);
                        maxBBox = Vector3.Maximize(maxBBox, bbox.maximum);
                    }

                    const size = maxBBox.subtract(minBBox);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const center = minBBox.add(size.scale(0.5));

                    const scale = 8 / maxDim;

                    modelMeshes.forEach((mesh) => {
                        mesh.scaling = new Vector3(scale, scale, scale);

                        const isObjFile = fileExtension === 'obj';
                        if (isObjFile) {
                            mesh.rotation.y = 0;
                        } else {
                            mesh.rotation.y = Math.PI;
                        }
                        mesh.computeWorldMatrix(true);
                    });

                    // 旋转后重新计算边界框并居中
                    let minBBoxAfter = modelMeshes[0].getBoundingInfo().boundingBox.minimumWorld.clone();
                    let maxBBoxAfter = modelMeshes[0].getBoundingInfo().boundingBox.maximumWorld.clone();

                    for (let i = 1; i < modelMeshes.length; i++) {
                        const bbox = modelMeshes[i].getBoundingInfo();
                        minBBoxAfter = Vector3.Minimize(minBBoxAfter, bbox.boundingBox.minimumWorld);
                        maxBBoxAfter = Vector3.Maximize(maxBBoxAfter, bbox.boundingBox.maximumWorld);
                    }

                    const sizeAfter = maxBBoxAfter.subtract(minBBoxAfter);
                    const centerAfter = minBBoxAfter.add(sizeAfter.scale(0.5));

                    // 居中模型
                    modelMeshes.forEach((mesh) => {
                        mesh.position = mesh.position.subtract(centerAfter);
                        mesh.computeWorldMatrix(true);
                    });

                    // 调整相机
                    camera.setTarget(Vector3.Zero());
                    camera.radius = maxDim * scale * 2;

                    const isObjFile = fileExtension === 'obj';
                    if (isObjFile) {
                        camera.beta = Math.PI / 4;
                        camera.alpha = Math.PI / 4;
                    } else {
                        camera.beta = Math.PI / 3;
                        camera.alpha = Math.PI / 4;
                    }

                    setLoading(false);
                } else {
                    const errorMsg = '加载的网格数量为 0';
                    setError(errorMsg);
                    setLoading(false);
                    onError?.(errorMsg);
                }
            },
            null,
            (scene, message, exception) => {
                const errorMsg = '加载3D模型失败: ' + message;
                setError(errorMsg);
                setLoading(false);
                onError?.(errorMsg);
            },
            loaderExtension,
        );

        // 渲染循环
        engine.runRenderLoop(() => {
            scene.render();
        });

        // 处理窗口大小变化
        const handleResize = () => {
            engine.resize();
        };

        window.addEventListener('resize', handleResize);

        // 清理
        return () => {
            window.removeEventListener('resize', handleResize);
            engine.dispose();
        };
    }, [fileUrl, fileName, onError]);

    return (
        <div className="w-full h-full relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full rounded-lg"
                style={{ touchAction: 'none' }}
            />
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                        <div className="text-sm text-muted-foreground">正在加载3D模型...</div>
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="text-center text-red-600">
                        <div className="mb-2">⚠️</div>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
            )}
        </div>
    );
}