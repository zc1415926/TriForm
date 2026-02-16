<?php

declare(strict_types=1);

namespace App\Services;

/**
 * STL 文件生成器
 * 生成 ASCII 格式的 STL 3D 模型文件
 */
class StlGenerator
{
    /**
     * 生成立方体 STL
     *
     * @param  float  $width  宽度
     * @param  float  $height  高度
     * @param  float  $depth  深度
     */
    public static function cube(float $width = 10, float $height = 10, float $depth = 10): string
    {
        $w = $width / 2;
        $h = $height / 2;
        $d = $depth / 2;

        $facets = [];

        // 前面 (z = d)
        $facets[] = self::createFacet([$w, -$h, $d], [$w, $h, $d], [-$w, $h, $d], [0, 0, 1]);
        $facets[] = self::createFacet([$w, -$h, $d], [-$w, $h, $d], [-$w, -$h, $d], [0, 0, 1]);

        // 后面 (z = -d)
        $facets[] = self::createFacet([-$w, -$h, -$d], [-$w, $h, -$d], [$w, $h, -$d], [0, 0, -1]);
        $facets[] = self::createFacet([-$w, -$h, -$d], [$w, $h, -$d], [$w, -$h, -$d], [0, 0, -1]);

        // 右面 (x = w)
        $facets[] = self::createFacet([$w, -$h, -$d], [$w, $h, -$d], [$w, $h, $d], [1, 0, 0]);
        $facets[] = self::createFacet([$w, -$h, -$d], [$w, $h, $d], [$w, -$h, $d], [1, 0, 0]);

        // 左面 (x = -w)
        $facets[] = self::createFacet([-$w, -$h, $d], [-$w, $h, $d], [-$w, $h, -$d], [-1, 0, 0]);
        $facets[] = self::createFacet([-$w, -$h, $d], [-$w, $h, -$d], [-$w, -$h, -$d], [-1, 0, 0]);

        // 顶面 (y = h)
        $facets[] = self::createFacet([-$w, $h, $d], [$w, $h, $d], [$w, $h, -$d], [0, 1, 0]);
        $facets[] = self::createFacet([-$w, $h, $d], [$w, $h, -$d], [-$w, $h, -$d], [0, 1, 0]);

        // 底面 (y = -h)
        $facets[] = self::createFacet([-$w, -$h, -$d], [$w, -$h, -$d], [$w, -$h, $d], [0, -1, 0]);
        $facets[] = self::createFacet([-$w, -$h, -$d], [$w, -$h, $d], [-$w, -$h, $d], [0, -1, 0]);

        return self::buildStl('Cube', $facets);
    }

    /**
     * 生成圆柱体 STL
     *
     * @param  float  $radius  半径
     * @param  float  $height  高度
     * @param  int  $segments  圆周分段数
     */
    public static function cylinder(float $radius = 5, float $height = 10, int $segments = 32): string
    {
        $h = $height / 2;
        $facets = [];

        // 生成圆周顶点
        $vertices = [];
        for ($i = 0; $i <= $segments; $i++) {
            $angle = 2 * M_PI * $i / $segments;
            $vertices[] = [
                'x' => $radius * cos($angle),
                'z' => $radius * sin($angle),
            ];
        }

        // 侧面
        for ($i = 0; $i < $segments; $i++) {
            $v1 = $vertices[$i];
            $v2 = $vertices[$i + 1];

            // 计算法线（侧面的法线指向外侧）
            $angle = 2 * M_PI * ($i + 0.5) / $segments;
            $nx = cos($angle);
            $nz = sin($angle);

            // 上三角形
            $facets[] = self::createFacet(
                [$v1['x'], $h, $v1['z']],
                [$v2['x'], $h, $v2['z']],
                [$v2['x'], -$h, $v2['z']],
                [$nx, 0, $nz]
            );

            // 下三角形
            $facets[] = self::createFacet(
                [$v1['x'], $h, $v1['z']],
                [$v2['x'], -$h, $v2['z']],
                [$v1['x'], -$h, $v1['z']],
                [$nx, 0, $nz]
            );
        }

        // 顶面（三角形扇）
        for ($i = 0; $i < $segments; $i++) {
            $v1 = $vertices[$i];
            $v2 = $vertices[$i + 1];
            $facets[] = self::createFacet(
                [$v1['x'], $h, $v1['z']],
                [0, $h, 0],
                [$v2['x'], $h, $v2['z']],
                [0, 1, 0]
            );
        }

        // 底面（三角形扇，法线向下）
        for ($i = 0; $i < $segments; $i++) {
            $v1 = $vertices[$i];
            $v2 = $vertices[$i + 1];
            $facets[] = self::createFacet(
                [$v1['x'], -$h, $v1['z']],
                [$v2['x'], -$h, $v2['z']],
                [0, -$h, 0],
                [0, -1, 0]
            );
        }

        return self::buildStl('Cylinder', $facets);
    }

    /**
     * 生成球体 STL
     *
     * @param  float  $radius  半径
     * @param  int  $segments  经纬度分段数
     */
    public static function sphere(float $radius = 5, int $segments = 16): string
    {
        $facets = [];

        // 使用经纬度网格生成球体
        for ($i = 0; $i < $segments; $i++) {
            $theta1 = M_PI * $i / $segments;
            $theta2 = M_PI * ($i + 1) / $segments;

            for ($j = 0; $j < $segments; $j++) {
                $phi1 = 2 * M_PI * $j / $segments;
                $phi2 = 2 * M_PI * ($j + 1) / $segments;

                // 四个顶点
                $v1 = self::sphereVertex($radius, $theta1, $phi1);
                $v2 = self::sphereVertex($radius, $theta1, $phi2);
                $v3 = self::sphereVertex($radius, $theta2, $phi1);
                $v4 = self::sphereVertex($radius, $theta2, $phi2);

                // 每个网格分成两个三角形
                // 三角形 1: v1, v2, v3
                $n1 = self::normalize($v1);
                $facets[] = self::createFacet($v1, $v2, $v3, $n1);

                // 三角形 2: v2, v4, v3
                $n2 = self::normalize($v2);
                $facets[] = self::createFacet($v2, $v4, $v3, $n2);
            }
        }

        return self::buildStl('Sphere', $facets);
    }

    /**
     * 随机生成一种几何体
     */
    public static function random(): string
    {
        $shapes = ['cube', 'cylinder', 'sphere'];
        $shape = $shapes[array_rand($shapes)];

        return match ($shape) {
            'cube' => self::cube(
                rand(8, 15),
                rand(8, 15),
                rand(8, 15)
            ),
            'cylinder' => self::cylinder(
                rand(3, 6),
                rand(8, 15),
                32
            ),
            'sphere' => self::sphere(
                rand(4, 7),
                16
            ),
        };
    }

    /**
     * 获取几何体名称
     */
    public static function getShapeName(string $stlContent): string
    {
        if (str_contains($stlContent, 'solid Cube')) {
            return 'CUBE';
        }
        if (str_contains($stlContent, 'solid Cylinder')) {
            return 'CYLINDER';
        }
        if (str_contains($stlContent, 'solid Sphere')) {
            return 'SPHERE';
        }

        return '3D';
    }

    /**
     * 计算球体顶点坐标
     */
    private static function sphereVertex(float $radius, float $theta, float $phi): array
    {
        return [
            $radius * sin($theta) * cos($phi),
            $radius * cos($theta),
            $radius * sin($theta) * sin($phi),
        ];
    }

    /**
     * 归一化向量
     */
    private static function normalize(array $v): array
    {
        $length = sqrt($v[0] * $v[0] + $v[1] * $v[1] + $v[2] * $v[2]);
        if ($length < 0.0001) {
            return [0, 1, 0];
        }

        return [$v[0] / $length, $v[1] / $length, $v[2] / $length];
    }

    /**
     * 创建一个三角面
     *
     * @param  array  $v1  顶点1 [x, y, z]
     * @param  array  $v2  顶点2 [x, y, z]
     * @param  array  $v3  顶点3 [x, y, z]
     * @param  array  $normal  法线 [nx, ny, nz]
     */
    private static function createFacet(array $v1, array $v2, array $v3, array $normal): string
    {
        $nx = number_format($normal[0], 6, '.', '');
        $ny = number_format($normal[1], 6, '.', '');
        $nz = number_format($normal[2], 6, '.', '');

        $facet = "  facet normal {$nx} {$ny} {$nz}\n";
        $facet .= "    outer loop\n";
        $facet .= sprintf("      vertex %.6f %.6f %.6f\n", $v1[0], $v1[1], $v1[2]);
        $facet .= sprintf("      vertex %.6f %.6f %.6f\n", $v2[0], $v2[1], $v2[2]);
        $facet .= sprintf("      vertex %.6f %.6f %.6f\n", $v3[0], $v3[1], $v3[2]);
        $facet .= "    endloop\n";
        $facet .= "  endfacet\n";

        return $facet;
    }

    /**
     * 构建完整的 STL 文件内容
     *
     * @param  string  $name  模型名称
     * @param  array  $facets  三角面数组
     */
    private static function buildStl(string $name, array $facets): string
    {
        $stl = "solid {$name}\n";
        $stl .= implode('', $facets);
        $stl .= "endsolid {$name}\n";

        return $stl;
    }
}
