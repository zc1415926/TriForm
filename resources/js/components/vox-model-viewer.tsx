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
    Mesh,
    VertexData,
    AxesViewer,
} from '@babylonjs/core';
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { VoxParser, VoxelModel, TransformNode } from '@/lib/vox-parser';

export interface VoxModelViewerRef {
    captureScreenshot: () => Promise<string | null>;
}

interface VoxModelViewerProps {
    fileUrl: string;
    fileName: string;
    onError?: (error: string) => void;
    onLoad?: () => void;
    showAxes?: boolean;
}

export const VoxModelViewer = forwardRef<VoxModelViewerRef, VoxModelViewerProps>(function VoxModelViewer({
    fileUrl,
    fileName,
    onError,
    onLoad,
    showAxes = false
}, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Engine | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const axesViewerRef = useRef<AxesViewer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 暴露截图方法给父组件
    useImperativeHandle(ref, () => ({
        captureScreenshot: async (): Promise<string | null> => {
            const canvas = canvasRef.current;
            const engine = engineRef.current;
            const scene = sceneRef.current;

            if (!canvas || !engine || !scene) {
                return null;
            }

            try {
                // 等待一帧渲染完成
                await new Promise<void>((resolve) => {
                    scene.onAfterRenderObservable.addOnce(() => {
                        resolve();
                    });
                });

                // 使用 canvas.toDataURL 获取截图
                const dataUrl = canvas.toDataURL('image/png');
                return dataUrl;
            } catch (err) {
                console.error('截图失败:', err);
                return null;
            }
        },
    }));

    // 创建体素网格
    const createVoxelMesh = useCallback((
        model: VoxelModel, 
        scene: Scene, 
        palette: Uint32Array, 
        transform?: TransformNode['frames'][0]
    ): Mesh | null => {
        const { voxels, bounds } = model;
        const voxelSize = 1;

        // 创建顶点数据
        const positions: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        const colors: number[] = [];

        let vertexOffset = 0;

        // 创建体素位置哈希集合，用于快速邻居查找
        const voxelSet = new Set<string>();
        voxels.forEach((v) => {
            voxelSet.add(`${v.x},${v.y},${v.z}`);
        });

        voxels.forEach((voxel) => {
            const { x, y, z, colorIndex } = voxel;
            const color = palette[colorIndex - 1] || 0xffffffff;

            const r = (color >> 0) & 0xff;
            const g = (color >> 8) & 0xff;
            const b = (color >> 16) & 0xff;
            const a = (color >> 24) & 0xff;

            if (a < 128) return;

            // 检查每个面是否需要绘制
            const neighbors = {
                right: voxelSet.has(`${x + 1},${y},${z}`),
                left: voxelSet.has(`${x - 1},${y},${z}`),
                top: voxelSet.has(`${x},${y + 1},${z}`),
                bottom: voxelSet.has(`${x},${y - 1},${z}`),
                front: voxelSet.has(`${x},${y},${z + 1}`),
                back: voxelSet.has(`${x},${y},${z - 1}`),
            };

            const px = x * voxelSize;
            const py = y * voxelSize;
            const pz = z * voxelSize;
            const half = voxelSize / 2;

            // 添加可见面
            const addFace = (
                facePositions: number[],
                faceNormal: number[],
            ) => {
                for (let i = 0; i < 4; i++) {
                    positions.push(
                        facePositions[i * 3],
                        facePositions[i * 3 + 1],
                        facePositions[i * 3 + 2]
                    );
                    normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
                    colors.push(r / 255, g / 255, b / 255, 1);
                }

                indices.push(
                    vertexOffset, vertexOffset + 1, vertexOffset + 2,
                    vertexOffset, vertexOffset + 2, vertexOffset + 3
                );
                vertexOffset += 4;
            };

            // 右面
            if (!neighbors.right) {
                addFace([
                    px + half, py - half, pz + half,
                    px + half, py + half, pz + half,
                    px + half, py + half, pz - half,
                    px + half, py - half, pz - half,
                ], [1, 0, 0]);
            }

            // 左面
            if (!neighbors.left) {
                addFace([
                    px - half, py - half, pz - half,
                    px - half, py + half, pz - half,
                    px - half, py + half, pz + half,
                    px - half, py - half, pz + half,
                ], [-1, 0, 0]);
            }

            // 顶面
            if (!neighbors.top) {
                addFace([
                    px - half, py + half, pz - half,
                    px + half, py + half, pz - half,
                    px + half, py + half, pz + half,
                    px - half, py + half, pz + half,
                ], [0, 1, 0]);
            }

            // 底面
            if (!neighbors.bottom) {
                addFace([
                    px - half, py - half, pz + half,
                    px + half, py - half, pz + half,
                    px + half, py - half, pz - half,
                    px - half, py - half, pz - half,
                ], [0, -1, 0]);
            }

            // 前面
            if (!neighbors.front) {
                addFace([
                    px - half, py - half, pz + half,
                    px - half, py + half, pz + half,
                    px + half, py + half, pz + half,
                    px + half, py - half, pz + half,
                ], [0, 0, 1]);
            }

            // 后面
            if (!neighbors.back) {
                addFace([
                    px + half, py - half, pz - half,
                    px + half, py + half, pz - half,
                    px - half, py + half, pz - half,
                    px - half, py - half, pz - half,
                ], [0, 0, -1]);
            }
        });

        if (positions.length === 0) return null;

        const mesh = new Mesh('voxelMesh', scene);
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.normals = normals;
        vertexData.indices = indices;
        vertexData.colors = colors;
        vertexData.applyToMesh(mesh);

        // 旋转模型：Z轴向上 -> Y轴向上
        mesh.rotation.x = -Math.PI / 2;
        mesh.scaling.y = -1;

        // 计算中心点
        const actualCenterX = (bounds.minX + bounds.maxX) / 2;
        const actualCenterY = (bounds.minY + bounds.maxY) / 2;
        const actualCenterZ = (bounds.minZ + bounds.maxZ) / 2;

        // 设置位置，底部对齐地面
        mesh.position = new Vector3(
            -actualCenterX,
            -1.0 - bounds.minZ,
            -actualCenterY
        );

        // 应用场景图变换
        if (transform?._t) {
            const tx = Math.abs(transform._t.x) < 10000 ? transform._t.x : 0;
            const ty = Math.abs(transform._t.y) < 10000 ? transform._t.y : 0;
            const tz = Math.abs(transform._t.z) < 10000 ? transform._t.z : 0;

            mesh.position.x += tx;
            mesh.position.y += tz;
            mesh.position.z += ty;

            // 应用旋转
            if (transform._r !== 0 && transform._r !== undefined) {
                const rotMap: Record<number, number> = {
                    0: 0,
                    1: Math.PI / 2,
                    2: Math.PI,
                    3: -Math.PI / 2,
                    4: Math.PI / 2,
                    5: 0,
                    6: 0,
                    7: 0,
                };
                mesh.rotation.y += rotMap[transform._r] || 0;
            }

            // 重新调整底部对齐
            const currentBottomY = bounds.minZ + 0.5 + tz;
            const targetBottomY = -0.5;
            mesh.position.y += (targetBottomY - currentBottomY) + 2;
        }

        return mesh;
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;

        // 创建引擎
        const engine = new Engine(canvas, true, {
            antialias: true,
            preserveDrawingBuffer: true,
            stencil: true,
        });
        engineRef.current = engine;

        // 创建场景
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);
        sceneRef.current = scene;

        // 创建相机
        const camera = new ArcRotateCamera(
            'camera',
            -Math.PI / 2,
            Math.PI / 3,
            20,
            Vector3.Zero(),
            scene,
        );
        camera.attachControl(canvas, true);
        camera.wheelPrecision = 50;
        camera.minZ = 0.1;

        // 添加灯光
        const ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), scene);
        ambientLight.intensity = 0.7;
        ambientLight.diffuse = new Color3(1, 1, 1);
        ambientLight.groundColor = new Color3(0.2, 0.2, 0.2);

        const mainLight = new DirectionalLight('mainLight', new Vector3(-1, -2, -1), scene);
        mainLight.intensity = 0.8;
        mainLight.diffuse = new Color3(1, 1, 1);

        const fillLight = new DirectionalLight('fillLight', new Vector3(1, -1, 1), scene);
        fillLight.intensity = 0.4;
        fillLight.diffuse = new Color3(0.8, 0.9, 1);

        const backLight = new DirectionalLight('backLight', new Vector3(0, 1, -1), scene);
        backLight.intensity = 0.3;

        // 创建坐标轴
        const axesViewer = new AxesViewer(scene, 3);
        axesViewer.enabled = showAxes;
        axesViewerRef.current = axesViewer;

        // 渲染循环
        engine.runRenderLoop(() => {
            scene.render();
        });

        // 窗口大小调整
        const handleResize = () => {
            engine.resize();
        };
        window.addEventListener('resize', handleResize);

        // 加载 VOX 文件
        const loadVoxFile = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`加载失败: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const parser = new VoxParser(arrayBuffer);
                const parsed = parser.parse();

                if (parsed.models.length === 0) {
                    throw new Error('VOX 文件中没有模型数据');
                }

                // 清除之前的网格
                scene.meshes.forEach(mesh => {
                    if (mesh.name === 'voxelMesh') {
                        mesh.dispose();
                    }
                });

                const voxelMeshes: Mesh[] = [];

                // 如果有场景图节点，使用场景图渲染
                if (parsed.nodes.length > 0) {
                    parsed.nodes.forEach((node) => {
                        if (node.type === 'transform') {
                            const childNode = parsed.nodes.find(
                                (n) => n.id === node.childId
                            );
                            if (
                                childNode &&
                                childNode.type === 'shape' &&
                                childNode.models.length > 0
                            ) {
                                const modelId = childNode.models[0];
                                const model = parsed.models[modelId];
                                if (model && model.voxels.length > 0) {
                                    const transform = node.frames[0];
                                    const mesh = createVoxelMesh(
                                        model,
                                        scene,
                                        parsed.palette,
                                        transform,
                                    );
                                    if (mesh) {
                                        voxelMeshes.push(mesh);
                                    }
                                }
                            }
                        }
                    });
                }

                // 如果场景图渲染失败，回退到简单模式
                if (voxelMeshes.length === 0) {
                    parsed.models.forEach((model, index) => {
                        if (model.voxels.length > 0) {
                            const mesh = createVoxelMesh(
                                model,
                                scene,
                                parsed.palette,
                            );
                            if (mesh) {
                                mesh.position.x = index * 20;
                                voxelMeshes.push(mesh);
                            }
                        }
                    });
                }

                if (voxelMeshes.length === 0) {
                    throw new Error('无法创建体素网格');
                }

                // 计算总边界框并调整相机
                let totalVoxels = 0;
                let maxDim = 0;
                parsed.models.forEach((model) => {
                    totalVoxels += model.voxels.length;
                    const dim = Math.max(
                        model.bounds.maxX - model.bounds.minX,
                        model.bounds.maxY - model.bounds.minY,
                        model.bounds.maxZ - model.bounds.minZ,
                    );
                    maxDim = Math.max(maxDim, dim);
                });

                camera.setTarget(Vector3.Zero());
                camera.radius = maxDim * 2;

                setLoading(false);
                onLoad?.();
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : '加载 VOX 模型失败';
                setError(errorMsg);
                setLoading(false);
                onError?.(errorMsg);
            }
        };

        loadVoxFile();

        return () => {
            window.removeEventListener('resize', handleResize);
            engine.dispose();
        };
    }, [fileUrl, fileName, onError, onLoad, createVoxelMesh, showAxes]);

    // 更新坐标轴显示
    useEffect(() => {
        if (axesViewerRef.current) {
            axesViewerRef.current.enabled = showAxes;
        }
    }, [showAxes]);

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
                        <div className="text-sm text-muted-foreground">正在加载 VOX 模型...</div>
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
});
