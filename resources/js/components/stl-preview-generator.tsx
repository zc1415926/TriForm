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
    Mesh,
    VertexData,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { VoxelModel} from '@/lib/vox-parser';
import { VoxParser, SceneNode } from '@/lib/vox-parser';

interface StlPreviewGeneratorProps {
    file: File | null;
    onPreviewGenerated: (previewFile: File) => void;
}

export function StlPreviewGenerator({ file, onPreviewGenerated }: StlPreviewGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<'ready' | 'generating' | 'completed' | 'error'>('ready');
    const [error, setError] = useState<string | null>(null);

    // 创建体素网格（用于VOX文件）
    const createVoxelMesh = (
        model: VoxelModel,
        scene: Scene,
        palette: Uint32Array,
        transform?: { _t: { x: number; y: number; z: number }; _r: number },
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
            const addFace = (facePositions: number[], faceNormal: number[]) => {
                for (let i = 0; i < 4; i++) {
                    positions.push(facePositions[i * 3], facePositions[i * 3 + 1], facePositions[i * 3 + 2]);
                    normals.push(faceNormal[0], faceNormal[1], faceNormal[2]);
                    colors.push(r / 255, g / 255, b / 255, 1);
                }
                indices.push(
                    vertexOffset, vertexOffset + 1, vertexOffset + 2,
                    vertexOffset, vertexOffset + 2, vertexOffset + 3
                );
                vertexOffset += 4;
            };

            // 六个面的顶点和法线
            if (!neighbors.right) {
                addFace([
                    px + half, py - half, pz + half,
                    px + half, py + half, pz + half,
                    px + half, py + half, pz - half,
                    px + half, py - half, pz - half,
                ], [1, 0, 0]);
            }
            if (!neighbors.left) {
                addFace([
                    px - half, py - half, pz - half,
                    px - half, py + half, pz - half,
                    px - half, py + half, pz + half,
                    px - half, py - half, pz + half,
                ], [-1, 0, 0]);
            }
            if (!neighbors.top) {
                addFace([
                    px - half, py + half, pz - half,
                    px + half, py + half, pz - half,
                    px + half, py + half, pz + half,
                    px - half, py + half, pz + half,
                ], [0, 1, 0]);
            }
            if (!neighbors.bottom) {
                addFace([
                    px - half, py - half, pz + half,
                    px + half, py - half, pz + half,
                    px + half, py - half, pz - half,
                    px - half, py - half, pz - half,
                ], [0, -1, 0]);
            }
            if (!neighbors.front) {
                addFace([
                    px - half, py - half, pz + half,
                    px - half, py + half, pz + half,
                    px + half, py + half, pz + half,
                    px + half, py - half, pz + half,
                ], [0, 0, 1]);
            }
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

        // 设置位置
        mesh.position = new Vector3(-actualCenterX, -1.0 - bounds.minZ, -actualCenterY);

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
    };

    // 处理VOX文件
    const handleVoxFile = async (
        voxFile: File,
        scene: Scene,
        camera: ArcRotateCamera,
        canvas: HTMLCanvasElement,
        engine: Engine,
    ) => {
        try {
            console.log('开始处理VOX文件:', voxFile.name);

            // 读取文件
            const arrayBuffer = await voxFile.arrayBuffer();
            const parser = new VoxParser(arrayBuffer);
            const parsed = parser.parse();

            if (parsed.models.length === 0) {
                throw new Error('VOX文件中没有模型数据');
            }

            // 创建体素网格
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
                        const mesh = createVoxelMesh(model, scene, parsed.palette);
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

            // 计算边界框
            let maxDim = 0;
            parsed.models.forEach((model) => {
                const dim = Math.max(
                    model.bounds.maxX - model.bounds.minX,
                    model.bounds.maxY - model.bounds.minY,
                    model.bounds.maxZ - model.bounds.minZ,
                );
                maxDim = Math.max(maxDim, dim);
            });

            // 调整相机
            camera.setTarget(Vector3.Zero());
            camera.radius = maxDim * 2;
            camera.beta = Math.PI / 3;
            camera.alpha = Math.PI / 4;

            // 渲染并生成缩略图
            let frameCount = 0;
            const maxFrames = 3;

            const renderFrame = () => {
                if (frameCount < maxFrames) {
                    scene.render();
                    frameCount++;
                    requestAnimationFrame(renderFrame);
                } else {
                    setTimeout(() => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    console.log('VOX缩略图生成成功，大小:', blob.size, '字节');
                                    const baseName = voxFile.name.replace(/\.[^/.]+$/, '');
                                    const thumbnailFile = new File([blob], `${baseName}_thumbnail.jpg`, {
                                        type: 'image/jpeg',
                                    });
                                    onPreviewGenerated(thumbnailFile);
                                } else {
                                    console.error('生成VOX缩略图失败：blob 为空');
                                    setStatus('error');
                                    setError('生成VOX缩略图失败');
                                }
                                setStatus('completed');
                                engine.dispose();
                            },
                            'image/jpeg',
                            0.85,
                        );
                    }, 200);
                }
            };

            renderFrame();
        } catch (err) {
            console.error('VOX文件处理失败:', err);
            setStatus('error');
            setError('VOX文件处理失败: ' + (err instanceof Error ? err.message : '未知错误'));
            engine.dispose();
        }
    };

    const generateThumbnail = useCallback(() => {
        if (!file || !canvasRef.current) return;

        setStatus('generating');
        setError(null);

        const canvas = canvasRef.current;

        // 创建 Babylon.js 引擎
        const engine = new Engine(canvas, true, {
            antialias: true,
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false,
            powerPreference: 'high-performance',
        });

        // 创建场景
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);
        // 禁用环境贴图以减少 WebGL 警告
        scene.environmentTexture = null;

        // 创建相机 - 调整角度以更好地俯视模型
        const camera = new ArcRotateCamera(
            'camera',
            Math.PI / 4, // alpha - 水平角度 (45度)
            Math.PI / 4, // beta - 垂直角度 (45度)，更平的视角
            15, // radius - 初始距离，增加距离
            Vector3.Zero(),
            scene,
        );
        camera.wheelPrecision = 50;
        camera.minZ = 0.1;
        camera.maxZ = 1000;

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
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        console.log('开始加载3D模型:', file.name, '类型:', fileExtension, '文件大小:', file.size);

        // 处理 VOX 文件
        if (fileExtension === 'vox') {
            handleVoxFile(file, scene, camera, canvas, engine);
            return;
        }

        // 创建 blob URL
        const fileUrl = URL.createObjectURL(file);

        // 根据文件类型确定加载器扩展名
        const loaderExtension = fileExtension === 'obj' ? '.obj' : '.stl';

        // 使用 ImportMesh 加载模型，明确指定加载器扩展名
        SceneLoader.ImportMesh(
            null, // meshNames
            fileUrl, // rootUrl
            '', // sceneFilename
            scene, // scene
            (meshes, particleSystems, skeletons) => {
                console.log('3D模型加载成功，网格数量:', meshes.length);
                console.log(
                    '所有网格信息:',
                    meshes.map((m) => ({
                        name: m.name,
                        vertices: m.getTotalVertices(),
                        indices: m.getTotalIndices(),
                        position: m.position,
                    })),
                );

                if (meshes.length > 0) {
                    // 不再过滤网格，直接使用所有网格
                    const modelMeshes = meshes;

                    console.log('使用网格数量:', modelMeshes.length);

                    // 创建材质 - 石头质感
                    const material = new StandardMaterial('modelMaterial', scene);
                    material.diffuseColor = new Color3(0.5, 0.5, 0.5); // 灰色
                    material.specularColor = new Color3(0.1, 0.1, 0.1); // 低高光，模拟粗糙表面
                    material.specularPower = 8; // 高光功率低，让高光更分散
                    material.ambientColor = new Color3(0.3, 0.3, 0.3); // 环境光颜色
                    material.emissiveColor = new Color3(0, 0, 0); // 不发光
                    material.backFaceCulling = false; // 禁用背面剔除，确保所有面都可见

                    // 应用材质到所有模型网格
                    modelMeshes.forEach((mesh) => {
                        mesh.material = material;
                        console.log(`网格 ${mesh.name}: 顶点数 ${mesh.getTotalVertices()}, 面数 ${mesh.getTotalIndices() / 3}`);
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

                    console.log('模型尺寸:', size, '最大维度:', maxDim, '中心点:', center);

                    // 根据文件类型应用不同的变换
                    const isObjFile = fileExtension === 'obj';
                    const scale = 8 / maxDim;

                    modelMeshes.forEach((mesh) => {
                        mesh.scaling = new Vector3(scale, scale, scale);

                        if (isObjFile) {
                            // OBJ模型通常使用右手坐标系，可能需要不同的旋转
                            // 根据实际情况调整，暂时不旋转
                            mesh.rotation.y = 0;
                        } else {
                            // STL模型绕Y轴旋转180度
                            mesh.rotation.y = Math.PI;
                        }
                        // 强制更新世界矩阵，确保旋转生效
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

                    console.log('旋转后模型尺寸:', sizeAfter, '中心点:', centerAfter);

                    // 居中模型
                    modelMeshes.forEach((mesh, index) => {
                        mesh.position = mesh.position.subtract(centerAfter);
                        // 再次更新世界矩阵
                        mesh.computeWorldMatrix(true);

                        console.log(`网格 ${index} (${mesh.name}) 最终状态:`);
                        console.log('  位置:', mesh.position);
                        console.log('  旋转:', mesh.rotation);
                        console.log('  缩放:', mesh.scaling);
                        console.log(
                            '  世界边界框最小值:',
                            mesh.getBoundingInfo().boundingBox.minimumWorld,
                        );
                        console.log(
                            '  世界边界框最大值:',
                            mesh.getBoundingInfo().boundingBox.maximumWorld,
                        );
                    });

                    // 调整相机
                    camera.setTarget(Vector3.Zero());
                    camera.radius = maxDim * scale * 1.5; // 减小距离，让模型显示得更大（原来是 3）

                    // 根据文件类型设置不同的相机角度
                    if (isObjFile) {
                        // OBJ模型使用更平的视角
                        camera.beta = Math.PI / 4; // 45度俯视
                        camera.alpha = Math.PI / 4; // 45度水平角度
                    } else {
                        // STL模型使用更陡的视角
                        camera.beta = Math.PI / 3; // 60度俯视
                        camera.alpha = Math.PI / 4; // 45度水平角度
                    }

                    // 渲染几帧以确保模型正确显示
                    let frameCount = 0;
                    const maxFrames = 3;

                    const renderFrame = () => {
                        if (frameCount < maxFrames) {
                            scene.render();
                            frameCount++;
                            requestAnimationFrame(renderFrame);
                        } else {
                            // 生成缩略图
                            setTimeout(() => {
                                canvas.toBlob(
                                    (blob) => {
                                        if (blob) {
                                            console.log('缩略图生成成功，大小:', blob.size, '字节');
                                            // 使用原文件名（去掉扩展名）加_thumbnail后缀来创建缩略图文件
                                            const baseName = file.name.replace(/\.[^/.]+$/, '');
                                            const thumbnailFile = new File([blob], `${baseName}_thumbnail.jpg`, {
                                                type: 'image/jpeg',
                                            });
                                            onPreviewGenerated(thumbnailFile);
                                        } else {
                                            console.error('生成缩略图失败：blob 为空');
                                            setStatus('error');
                                            setError('生成缩略图失败');
                                        }
                                        setStatus('completed');

                                        // 清理
                                        URL.revokeObjectURL(fileUrl);
                                        engine.dispose();
                                    },
                                    'image/jpeg',
                                    0.85, // 质量
                                );
                            }, 200);
                        }
                    };

                    renderFrame();
                } else {
                    console.error('加载的网格数量为 0');
                    setStatus('error');
                    setError('加载的网格数量为 0');
                    URL.revokeObjectURL(fileUrl);
                    engine.dispose();
                }
            },
            (evt) => {
                // 加载进度
                if (evt.loaded && evt.total) {
                    const progress = Math.round((evt.loaded / evt.total) * 100);
                    if (progress % 10 === 0) {
                        // 每10%输出一次
                        console.log(`加载进度: ${progress}%`);
                    }
                }
            },
            (scene, message, exception) => {
                console.error('加载3D模型失败:', message, exception);
                setStatus('error');
                setError('加载3D模型失败: ' + message);
                URL.revokeObjectURL(fileUrl);
                engine.dispose();
            },
            loaderExtension, // 明确指定加载器扩展名 (.obj 或 .stl)
        );
    }, [file, onPreviewGenerated]);

    useEffect(() => {
        if (file && canvasRef.current && status === 'ready') {
            generateThumbnail();
        }
    }, [file, status, generateThumbnail]);

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                style={{
                    display: status === 'completed' ? 'none' : 'block',
                    width: '400px',
                    height: '300px',
                }}
                className="rounded-lg border bg-gray-50"
            />
            {status === 'generating' && (
                <div className="text-sm text-muted-foreground text-center">正在生成预览图...</div>
            )}
            {status === 'error' && <div className="text-sm text-red-600 text-center">{error}</div>}
        </div>
    );
}