<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * 预览图生成器
 * 为不同类型的文件生成预览图
 */
class PreviewGenerator
{
    /**
     * 几何体类型的颜色配置
     */
    private const SHAPE_COLORS = [
        'CUBE' => ['r' => 255, 'g' => 100, 'b' => 100],      // 红色
        'CYLINDER' => ['r' => 100, 'g' => 255, 'b' => 100],  // 绿色
        'SPHERE' => ['r' => 100, 'g' => 100, 'b' => 255],    // 蓝色
        'DEFAULT' => ['r' => 255, 'g' => 200, 'b' => 100],   // 橙色
    ];

    /**
     * 为 STL 文件生成占位预览图
     *
     * @param  string  $shapeType  几何体类型 (CUBE/CYLINDER/SPHERE)
     * @param  string  $storagePath  存储路径
     * @return string 预览图路径
     */
    public static function forSTL(string $shapeType, string $storagePath): string
    {
        $width = 400;
        $height = 300;

        // 创建画布
        $image = imagecreatetruecolor($width, $height);

        // 获取颜色配置
        $color = self::SHAPE_COLORS[$shapeType] ?? self::SHAPE_COLORS['DEFAULT'];

        // 填充背景色
        $bgColor = imagecolorallocate($image, $color['r'], $color['g'], $color['b']);
        imagefill($image, 0, 0, $bgColor);

        // 添加渐变效果
        self::addGradient($image, $width, $height, $color);

        // 添加边框
        $borderColor = imagecolorallocate($image, 255, 255, 255);
        imagerectangle($image, 10, 10, $width - 10, $height - 10, $borderColor);

        // 添加文字
        $textColor = imagecolorallocate($image, 255, 255, 255);

        // 大标题：几何体类型
        $title = $shapeType;
        $fontSize = 5; // 内置字体大小
        $titleWidth = imagefontwidth($fontSize) * strlen($title);
        $titleX = (int) (($width - $titleWidth) / 2);
        $titleY = (int) (($height - imagefontheight($fontSize)) / 2);
        imagestring($image, $fontSize, $titleX, $titleY, $title, $textColor);

        // 小标题：文件类型
        $subtitle = 'STL 3D MODEL';
        $subFontSize = 2;
        $subWidth = imagefontwidth($subFontSize) * strlen($subtitle);
        $subX = (int) (($width - $subWidth) / 2);
        $subY = (int) ($titleY + imagefontheight($fontSize) + 20);
        imagestring($image, $subFontSize, $subX, $subY, $subtitle, $textColor);

        // 保存图片
        $fileName = Str::random(40).'_preview.jpg';
        $fullPath = $storagePath.'/'.$fileName;

        // 确保目录存在
        Storage::disk('public')->makeDirectory($storagePath);

        // 保存到临时文件
        $tempPath = tempnam(sys_get_temp_dir(), 'preview_');
        imagejpeg($image, $tempPath, 85);

        // 读取并保存到存储
        $imageData = file_get_contents($tempPath);
        Storage::disk('public')->put($fullPath, $imageData);

        // 清理
        imagedestroy($image);
        unlink($tempPath);

        return $fullPath;
    }

    /**
     * 为图片文件生成缩略图
     *
     * @param  string  $sourcePath  原图路径
     * @param  string  $storagePath  存储路径
     * @return string 缩略图路径
     */
    public static function forImage(string $sourcePath, string $storagePath): string
    {
        // 获取图片信息
        $imageInfo = getimagesize($sourcePath);
        if ($imageInfo === false) {
            // 如果无法读取，生成占位图
            return self::forSTL('DEFAULT', $storagePath);
        }

        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];

        // 加载源图片
        $source = match ($type) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($sourcePath),
            IMAGETYPE_PNG => imagecreatefrompng($sourcePath),
            IMAGETYPE_GIF => imagecreatefromgif($sourcePath),
            IMAGETYPE_WEBP => imagecreatefromwebp($sourcePath),
            default => null,
        };

        if (! $source) {
            return self::forSTL('DEFAULT', $storagePath);
        }

        // 计算缩略图尺寸
        $maxWidth = 400;
        $maxHeight = 300;

        if ($width > $maxWidth || $height > $maxHeight) {
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = (int) ($width * $ratio);
            $newHeight = (int) ($height * $ratio);
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }

        // 创建缩略图
        $thumbnail = imagecreatetruecolor($newWidth, $newHeight);

        // 保持 PNG 透明度
        if ($type === IMAGETYPE_PNG) {
            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);
            $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
            imagefilledrectangle($thumbnail, 0, 0, $newWidth, $newHeight, $transparent);
        }

        // 缩放
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // 保存
        $fileName = Str::random(40).'_preview.jpg';
        $fullPath = $storagePath.'/'.$fileName;

        Storage::disk('public')->makeDirectory($storagePath);

        $tempPath = tempnam(sys_get_temp_dir(), 'preview_');
        imagejpeg($thumbnail, $tempPath, 85);

        $imageData = file_get_contents($tempPath);
        Storage::disk('public')->put($fullPath, $imageData);

        // 清理
        imagedestroy($source);
        imagedestroy($thumbnail);
        unlink($tempPath);

        return $fullPath;
    }

    /**
     * 添加渐变效果
     */
    private static function addGradient(\GdImage $image, int $width, int $height, array $color): void
    {
        // 从中心向外渐变
        $centerX = $width / 2;
        $centerY = $height / 2;
        $maxDist = sqrt($centerX * $centerX + $centerY * $centerY);

        for ($y = 0; $y < $height; $y += 2) { // 步进2像素，提高性能
            for ($x = 0; $x < $width; $x += 2) {
                $dist = sqrt(($x - $centerX) ** 2 + ($y - $centerY) ** 2);
                $factor = 1 - ($dist / $maxDist) * 0.3; // 边缘变暗30%

                $r = (int) min(255, $color['r'] * $factor);
                $g = (int) min(255, $color['g'] * $factor);
                $b = (int) min(255, $color['b'] * $factor);

                $pixelColor = imagecolorallocate($image, $r, $g, $b);
                imagefilledrectangle($image, $x, $y, $x + 1, $y + 1, $pixelColor);
            }
        }
    }
}
