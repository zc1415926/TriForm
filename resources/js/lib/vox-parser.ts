/**
 * VOX 文件解析器
 * 支持 MagicaVoxel VOX 格式解析，包括场景图节点
 */

export interface VoxelModel {
    size: { x: number; y: number; z: number };
    voxels: Array<{ x: number; y: number; z: number; colorIndex: number }>;
    bounds: {
        minX: number; minY: number; minZ: number;
        maxX: number; maxY: number; maxZ: number;
    };
}

export interface TransformNode {
    id: number;
    type: 'transform';
    attributes: Record<string, string>;
    childId: number;
    reservedId: number;
    layerId: number;
    frames: Array<{
        _t: { x: number; y: number; z: number };
        _r: number;
        attributes: Record<string, string>;
    }>;
}

export interface GroupNode {
    id: number;
    type: 'group';
    attributes: Record<string, string>;
    children: number[];
}

export interface ShapeNode {
    id: number;
    type: 'shape';
    attributes: Record<string, string>;
    models: number[];
    modelAttributes: Record<string, string>;
}

export type SceneNode = TransformNode | GroupNode | ShapeNode;

export interface ParsedVox {
    models: VoxelModel[];
    palette: Uint32Array;
    nodes: SceneNode[];
}

// 默认调色板
const DEFAULT_PALETTE = new Uint32Array([
    0x00000000, 0xffffffff, 0xffccffff, 0xff99ffff, 0xff66ffff, 0xff33ffff,
    0xff00ffff, 0xffffccff, 0xffccccff, 0xff99ccff, 0xff66ccff, 0xff33ccff,
    0xff00ccff, 0xffff99ff, 0xffcc99ff, 0xff9999ff, 0xff6699ff, 0xff3399ff,
    0xff0099ff, 0xffff66ff, 0xffcc66ff, 0xff9966ff, 0xff6666ff, 0xff3366ff,
    0xff0066ff, 0xffff33ff, 0xffcc33ff, 0xff9933ff, 0xff6633ff, 0xff3333ff,
    0xff0033ff, 0xffff00ff, 0xffcc00ff, 0xff9900ff, 0xff6600ff, 0xff3300ff,
    0xff0000ff, 0xffffffcc, 0xffccffcc, 0xff99ffcc, 0xff66ffcc, 0xff33ffcc,
    0xff00ffcc, 0xffffcccc, 0xffcccccc, 0xff99cccc, 0xff66cccc, 0xff33cccc,
    0xff00cccc, 0xffff99cc, 0xffcc99cc, 0xff9999cc, 0xff6699cc, 0xff3399cc,
    0xff0099cc, 0xffff66cc, 0xffcc66cc, 0xff9966cc, 0xff6666cc, 0xff3366cc,
    0xff0066cc, 0xffff33cc, 0xffcc33cc, 0xff9933cc, 0xff6633cc, 0xff3333cc,
    0xff0033cc, 0xffff00cc, 0xffcc00cc, 0xff9900cc, 0xff6600cc, 0xff3300cc,
    0xff0000cc, 0xffffff99, 0xffccff99, 0xff99ff99, 0xff66ff99, 0xff33ff99,
    0xff00ff99, 0xffffcc99, 0xffcccc99, 0xff99cc99, 0xff66cc99, 0xff33cc99,
    0xff00cc99, 0xffff9999, 0xffcc9999, 0xff999999, 0xff669999, 0xff339999,
    0xff009999, 0xffff6699, 0xffcc6699, 0xff996699, 0xff666699, 0xff336699,
    0xff006699, 0xffff3399, 0xffcc3399, 0xff993399, 0xff663399, 0xff333399,
    0xff003399, 0xffff0099, 0xffcc0099, 0xff990099, 0xff660099, 0xff330099,
    0xff000099, 0xffffff66, 0xffccff66, 0xff99ff66, 0xff66ff66, 0xff33ff66,
    0xff00ff66, 0xffffcc66, 0xffcccc66, 0xff99cc66, 0xff66cc66, 0xff33cc66,
    0xff00cc66, 0xffff9966, 0xffcc9966, 0xff999966, 0xff669966, 0xff339966,
    0xff009966, 0xffff6666, 0xffcc6666, 0xff996666, 0xff666666, 0xff336666,
    0xff006666, 0xffff3366, 0xffcc3366, 0xff993366, 0xff663366, 0xff333366,
    0xff003366, 0xffff0066, 0xffcc0066, 0xff990066, 0xff660066, 0xff330066,
    0xff000066, 0xffffff33, 0xffccff33, 0xff99ff33, 0xff66ff33, 0xff33ff33,
    0xff00ff33, 0xffffcc33, 0xffcccc33, 0xff99cc33, 0xff66cc33, 0xff33cc33,
    0xff00cc33, 0xffff9933, 0xffcc9933, 0xff999933, 0xff669933, 0xff339933,
    0xff009933, 0xffff6633, 0xffcc6633, 0xff996633, 0xff666633, 0xff336633,
    0xff006633, 0xffff3333, 0xffcc3333, 0xff993333, 0xff663333, 0xff333333,
    0xff003333, 0xffff0033, 0xffcc0033, 0xff990033, 0xff660033, 0xff330033,
    0xff000033, 0xffff0000, 0xffcc0000, 0xff990000, 0xff660000, 0xff330000,
    0xff0000ee, 0xff0000dd, 0xff0000bb, 0xff0000aa, 0xff000088, 0xff000077,
    0xff000055, 0xff000044, 0xff000022, 0xff000011, 0xff00ee00, 0xff00dd00,
    0xff00bb00, 0xff00aa00, 0xff008800, 0xff007700, 0xff005500, 0xff004400,
    0xff002200, 0xff001100, 0xffee0000, 0xffdd0000, 0xffbb0000, 0xffaa0000,
    0xff880000, 0xff770000, 0xff550000, 0xff440000, 0xff220000, 0xff110000,
    0xffeeeeee, 0xffdddddd, 0xffbbbbbb, 0xffaaaaaa, 0xff888888, 0xff777777,
    0xff555555, 0xff444444, 0xff222222, 0xff111111,
]);

export class VoxParser {
    private data: DataView;
    private offset: number;
    private palette: Uint32Array;
    private models: VoxelModel[];
    private nodes: SceneNode[];
    private currentModel: VoxelModel | null;

    constructor(arrayBuffer: ArrayBuffer) {
        this.data = new DataView(arrayBuffer);
        this.offset = 0;
        this.palette = new Uint32Array(DEFAULT_PALETTE);
        this.models = [];
        this.nodes = [];
        this.currentModel = null;
    }

    private readString(length: number): string {
        if (this.offset + length > this.data.byteLength) {
            throw new Error(`读取字符串超出边界: offset=${this.offset}, length=${length}`);
        }
        let str = '';
        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(this.data.getUint8(this.offset + i));
        }
        this.offset += length;
        return str;
    }

    private readUint32(): number {
        if (this.offset + 4 > this.data.byteLength) {
            throw new Error(`读取 Uint32 超出边界`);
        }
        const value = this.data.getUint32(this.offset, true);
        this.offset += 4;
        return value;
    }

    private readUint8(): number {
        if (this.offset + 1 > this.data.byteLength) {
            throw new Error(`读取 Uint8 超出边界`);
        }
        const value = this.data.getUint8(this.offset);
        this.offset += 1;
        return value;
    }

    private readDictionary(): Record<string, string> {
        const dictSize = this.readUint32();
        const dict: Record<string, string> = {};
        for (let i = 0; i < dictSize; i++) {
            const keyLen = this.readUint32();
            const key = this.readString(keyLen);
            const valLen = this.readUint32();
            const val = this.readString(valLen);
            dict[key] = val;
        }
        return dict;
    }

    parse(): ParsedVox {
        // 读取文件头
        const magic = this.readString(4);
        if (magic !== 'VOX ') {
            throw new Error('不是有效的 VOX 文件');
        }

        const version = this.readUint32();

        // 读取 MAIN 块
        const mainChunkId = this.readString(4);
        const mainContentSize = this.readUint32();
        const mainChildrenSize = this.readUint32();

        if (mainChunkId !== 'MAIN') {
            throw new Error('找不到 MAIN 块');
        }

        this.offset += mainContentSize;

        // 读取子块
        const endOffset = mainChildrenSize === 4294967295
            ? this.data.byteLength
            : this.offset + mainChildrenSize;

        while (this.offset < endOffset && this.offset < this.data.byteLength) {
            this.parseChunk();
        }

        return {
            models: this.models,
            palette: this.palette,
            nodes: this.nodes,
        };
    }

    private parseChunk(): void {
        const chunkId = this.readString(4);
        const contentSize = this.readUint32();
        const childrenSize = this.readUint32();

        switch (chunkId) {
            case 'SIZE':
                this.parseSizeChunk();
                break;
            case 'XYZI':
                this.parseXYZIChunk();
                break;
            case 'RGBA':
                this.parseRGBAChunk();
                break;
            case 'nTRN':
                this.parseTransformChunk(contentSize);
                break;
            case 'nGRP':
                this.parseGroupChunk();
                break;
            case 'nSHP':
                this.parseShapeChunk();
                break;
            default:
                this.offset += contentSize;
                break;
        }

        if (childrenSize > 0) {
            this.offset += childrenSize;
        }
    }

    private parseSizeChunk(): void {
        const sizeX = this.readUint32();
        const sizeY = this.readUint32();
        const sizeZ = this.readUint32();

        this.currentModel = {
            size: { x: sizeX, y: sizeY, z: sizeZ },
            voxels: [],
            bounds: {
                minX: Infinity, minY: Infinity, minZ: Infinity,
                maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity,
            },
        };
    }

    private parseXYZIChunk(): void {
        const numVoxels = this.readUint32();
        const bounds = this.currentModel!.bounds;

        for (let i = 0; i < numVoxels; i++) {
            const x = this.readUint8();
            const y = this.readUint8();
            const z = this.readUint8();
            const colorIndex = this.readUint8();

            this.currentModel!.voxels.push({ x, y, z, colorIndex });

            bounds.minX = Math.min(bounds.minX, x);
            bounds.minY = Math.min(bounds.minY, y);
            bounds.minZ = Math.min(bounds.minZ, z);
            bounds.maxX = Math.max(bounds.maxX, x);
            bounds.maxY = Math.max(bounds.maxY, y);
            bounds.maxZ = Math.max(bounds.maxZ, z);
        }

        this.models.push(this.currentModel!);
    }

    private parseRGBAChunk(): void {
        for (let i = 0; i < 256; i++) {
            const r = this.readUint8();
            const g = this.readUint8();
            const b = this.readUint8();
            const a = this.readUint8();
            this.palette[i] = (a << 24) | (b << 16) | (g << 8) | r;
        }
    }

    private parseTransformChunk(contentSize: number): void {
        const nodeId = this.readUint32();
        const attributes = this.readDictionary();
        const childId = this.readUint32();
        const reservedId = this.readUint32();
        const layerId = this.readUint32();
        const frameCount = this.readUint32();

        const node: TransformNode = {
            id: nodeId,
            type: 'transform',
            attributes,
            childId,
            reservedId,
            layerId,
            frames: [],
        };

        for (let i = 0; i < frameCount; i++) {
            const dictSize = this.readUint32();
            const frameDict: Record<string, string> = {};
            for (let j = 0; j < dictSize; j++) {
                const keyLen = this.readUint32();
                const key = this.readString(keyLen);
                const valLen = this.readUint32();
                const val = this.readString(valLen);
                frameDict[key] = val;
            }

            let _t = { x: 0, y: 0, z: 0 };
            let _r = 0;

            if (frameDict['_t']) {
                const parts = frameDict['_t'].split(' ');
                _t = {
                    x: parseInt(parts[0]) || 0,
                    y: parseInt(parts[1]) || 0,
                    z: parseInt(parts[2]) || 0,
                };
            }

            if (frameDict['_r']) {
                _r = parseInt(frameDict['_r']) || 0;
            }

            node.frames.push({ _t, _r, attributes: frameDict });
        }

        this.nodes.push(node);
    }

    private parseGroupChunk(): void {
        const nodeId = this.readUint32();
        const attributes = this.readDictionary();
        const childCount = this.readUint32();
        const children: number[] = [];

        for (let i = 0; i < childCount; i++) {
            children.push(this.readUint32());
        }

        this.nodes.push({
            id: nodeId,
            type: 'group',
            attributes,
            children,
        });
    }

    private parseShapeChunk(): void {
        const nodeId = this.readUint32();
        const attributes = this.readDictionary();
        const modelCount = this.readUint32();
        const models: number[] = [];

        for (let i = 0; i < modelCount; i++) {
            models.push(this.readUint32());
        }

        const modelAttributes = this.readDictionary();

        this.nodes.push({
            id: nodeId,
            type: 'shape',
            attributes,
            models,
            modelAttributes,
        });
    }
}
