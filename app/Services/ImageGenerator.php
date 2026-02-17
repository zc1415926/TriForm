<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Str;

/**
 * 图片生成器
 * 生成各种类型的 PNG 图片用于测试提交
 */
class ImageGenerator
{
    /**
     * 图片类型配置
     */
    private const IMAGE_TYPES = [
        'design_sketch' => [
            'name' => '设计草图',
            'width' => 1200,
            'height' => 800,
            'bgColors' => [[255, 245, 238], [240, 248, 255], [255, 250, 240]],
        ],
        'render_result' => [
            'name' => '渲染作品',
            'width' => 1920,
            'height' => 1080,
            'bgColors' => [[25, 25, 35], [35, 35, 45], [20, 30, 40]],
        ],
        'animation_draft' => [
            'name' => '动画草稿',
            'width' => 1280,
            'height' => 720,
            'bgColors' => [[255, 255, 255], [250, 250, 250], [245, 245, 245]],
        ],
    ];

    /**
     * 生成设计草图
     */
    public static function designSketch(): array
    {
        return self::generate('design_sketch');
    }

    /**
     * 生成渲染作品
     */
    public static function renderResult(): array
    {
        return self::generate('render_result');
    }

    /**
     * 生成动画草稿
     */
    public static function animationDraft(): array
    {
        return self::generate('animation_draft');
    }

    /**
     * 随机生成一种图片
     */
    public static function random(): array
    {
        $types = array_keys(self::IMAGE_TYPES);
        $type = $types[array_rand($types)];

        return self::generate($type);
    }

    /**
     * 生成指定类型的图片（大图 + 缩略图）
     */
    private static function generate(string $type): array
    {
        $config = self::IMAGE_TYPES[$type];
        $width = $config['width'];
        $height = $config['height'];

        // 创建大图
        $image = imagecreatetruecolor($width, $height);

        // 选择背景色
        $bgColor = $config['bgColors'][array_rand($config['bgColors'])];
        $bg = imagecolorallocate($image, $bgColor[0], $bgColor[1], $bgColor[2]);
        imagefill($image, 0, 0, $bg);

        // 根据类型添加不同的内容
        match ($type) {
            'design_sketch' => self::addSketchElements($image, $width, $height),
            'render_result' => self::addRenderElements($image, $width, $height),
            'animation_draft' => self::addAnimationElements($image, $width, $height),
        };

        // 添加水印文字
        self::addWatermark($image, $width, $height, $config['name']);

        // 生成唯一文件名
        $fileName = Str::random(40);

        // 保存大图
        $tempPath = tempnam(sys_get_temp_dir(), 'img_');
        imagepng($image, $tempPath, 6); // 压缩级别 6
        $fullImageData = file_get_contents($tempPath);
        unlink($tempPath);

        // 创建缩略图 (400x300 max)
        $thumbnail = self::createThumbnail($image, 400, 300);
        $tempThumbPath = tempnam(sys_get_temp_dir(), 'thumb_');
        imagepng($thumbnail, $tempThumbPath, 6);
        $thumbnailData = file_get_contents($tempThumbPath);
        unlink($tempThumbPath);

        // 清理
        imagedestroy($image);
        imagedestroy($thumbnail);

        return [
            'full' => $fullImageData,
            'thumbnail' => $thumbnailData,
            'type' => $type,
            'name' => $config['name'],
            'width' => $width,
            'height' => $height,
            'file_name' => $fileName.'.png',
        ];
    }

    /**
     * 添加草图元素
     */
    private static function addSketchElements(\GdImage $image, int $width, int $height): void
    {
        // 绘制几何图形（线框风格）
        $lineColor = imagecolorallocate($image, 100, 100, 100);
        $accentColor = imagecolorallocate($image, 255, 100, 100);

        // 绘制网格线
        for ($i = 0; $i < $width; $i += 50) {
            imageline($image, $i, 0, $i, $height, imagecolorallocatealpha($image, 200, 200, 200, 100));
        }
        for ($i = 0; $i < $height; $i += 50) {
            imageline($image, 0, $i, $width, $i, imagecolorallocatealpha($image, 200, 200, 200, 100));
        }

        // 绘制 3D 立方体线框
        $cx = $width / 2;
        $cy = $height / 2;
        $size = min($width, $height) / 4;

        // 前面
        imagerectangle($image, (int) ($cx - $size), (int) ($cy - $size), (int) ($cx + $size), (int) ($cy + $size), $lineColor);
        // 后面（透视效果）
        $offset = $size * 0.3;
        imagerectangle($image, (int) ($cx - $size + $offset), (int) ($cy - $size - $offset), (int) ($cx + $size + $offset), (int) ($cy + $size - $offset), $lineColor);

        // 连接线
        imageline($image, (int) ($cx - $size), (int) ($cy - $size), (int) ($cx - $size + $offset), (int) ($cy - $size - $offset), $lineColor);
        imageline($image, (int) ($cx + $size), (int) ($cy - $size), (int) ($cx + $size + $offset), (int) ($cy - $size - $offset), $lineColor);
        imageline($image, (int) ($cx - $size), (int) ($cy + $size), (int) ($cx - $size + $offset), (int) ($cy + $size - $offset), $lineColor);
        imageline($image, (int) ($cx + $size), (int) ($cy + $size), (int) ($cx + $size + $offset), (int) ($cy + $size - $offset), $lineColor);

        // 添加尺寸标注线
        imageline($image, (int) ($cx - $size - 30), (int) ($cy - $size - 40), (int) ($cx + $size + 30), (int) ($cy - $size - 40), $accentColor);
        imageline($image, (int) ($cx - $size - 30), (int) ($cy - $size - 35), (int) ($cx - $size - 30), (int) ($cy - $size - 45), $accentColor);
        imageline($image, (int) ($cx + $size + 30), (int) ($cy - $size - 35), (int) ($cx + $size + 30), (int) ($cy - $size - 45), $accentColor);
    }

    /**
     * 添加渲染元素
     */
    private static function addRenderElements(\GdImage $image, int $width, int $height): void
    {
        // 创建渐变背景
        self::addGradient($image, $width, $height, [50, 60, 80], [30, 35, 50]);

        // 添加发光效果的几何体
        $centerX = $width / 2;
        $centerY = $height / 2;

        // 绘制一个 3D 球体效果（使用渐变圆）
        $radius = min($width, $height) / 5;

        // 外发光
        for ($r = $radius + 20; $r > $radius; $r--) {
            $alpha = (int) (127 * ($r - $radius) / 20);
            $color = imagecolorallocatealpha($image, 100, 150, 255, $alpha);
            imagefilledellipse($image, (int) $centerX, (int) $centerY, (int) ($r * 2), (int) ($r * 2), $color);
        }

        // 主体球
        for ($r = $radius; $r > 0; $r--) {
            $ratio = $r / $radius;
            $rColor = (int) (100 + 100 * $ratio);
            $gColor = (int) (150 + 80 * $ratio);
            $bColor = (int) (255);
            $color = imagecolorallocate($image, $rColor, $gColor, $bColor);
            imagefilledellipse($image, (int) $centerX, (int) $centerY, (int) ($r * 2), (int) ($r * 2), $color);
        }

        // 高光
        $highlight = imagecolorallocatealpha($image, 255, 255, 255, 50);
        imagefilledellipse($image, (int) ($centerX - $radius * 0.3), (int) ($centerY - $radius * 0.3), (int) ($radius * 0.4), (int) ($radius * 0.3), $highlight);
    }

    /**
     * 添加动画元素
     */
    private static function addAnimationElements(\GdImage $image, int $width, int $height): void
    {
        // 绘制关键帧示意
        $frameWidth = ($width - 100) / 4;
        $frameHeight = $frameWidth * 0.75;
        $startX = 50;
        $startY = ($height - $frameHeight) / 2;

        $colors = [
            imagecolorallocate($image, 255, 100, 100),
            imagecolorallocate($image, 100, 255, 100),
            imagecolorallocate($image, 100, 100, 255),
            imagecolorallocate($image, 255, 200, 100),
        ];

        for ($i = 0; $i < 4; $i++) {
            $x = $startX + $i * ($frameWidth + 10);

            // 帧边框
            imagerectangle($image, (int) $x, (int) $startY, (int) ($x + $frameWidth), (int) ($startY + $frameHeight), imagecolorallocate($image, 200, 200, 200));

            // 帧内容（简单图形）
            $offset = $i * 20;
            imagefilledellipse($image, (int) ($x + $frameWidth / 2 + $offset), (int) ($startY + $frameHeight / 2), 60, 60, $colors[$i]);

            // 帧编号
            imagestring($image, 2, (int) ($x + 5), (int) ($startY + 5), 'Frame '.($i + 1), imagecolorallocate($image, 100, 100, 100));
        }

        // 添加箭头连接
        $arrowY = $startY + $frameHeight + 30;
        for ($i = 0; $i < 3; $i++) {
            $x1 = $startX + $i * ($frameWidth + 10) + $frameWidth + 5;
            $x2 = $startX + ($i + 1) * ($frameWidth + 10) - 5;
            imageline($image, (int) $x1, (int) $arrowY, (int) $x2, (int) $arrowY, imagecolorallocate($image, 150, 150, 150));
            // 箭头
            imagefilledpolygon($image, [
                (int) $x2, (int) ($arrowY - 5),
                (int) $x2, (int) ($arrowY + 5),
                (int) ($x2 + 10), (int) $arrowY,
            ], 3, imagecolorallocate($image, 150, 150, 150));
        }
    }

    /**
     * 添加水印文字
     */
    private static function addWatermark(\GdImage $image, int $width, int $height, string $text): void
    {
        // 半透明背景条
        $barColor = imagecolorallocatealpha($image, 0, 0, 0, 100);
        imagefilledrectangle($image, 0, $height - 40, $width, $height, $barColor);

        // 文字
        $textColor = imagecolorallocate($image, 255, 255, 255);
        $textWidth = imagefontwidth(3) * strlen($text);
        $textX = ($width - $textWidth) / 2;
        imagestring($image, 3, (int) $textX, $height - 30, $text, $textColor);

        // 添加时间戳
        $timeText = date('Y-m-d H:i:s');
        imagestring($image, 1, 10, 10, $timeText, imagecolorallocatealpha($image, 150, 150, 150, 50));
    }

    /**
     * 创建缩略图
     */
    private static function createThumbnail(\GdImage $source, int $maxWidth, int $maxHeight): \GdImage
    {
        $srcWidth = imagesx($source);
        $srcHeight = imagesy($source);

        // 计算缩放比例
        $ratio = min($maxWidth / $srcWidth, $maxHeight / $srcHeight);
        $newWidth = (int) ($srcWidth * $ratio);
        $newHeight = (int) ($srcHeight * $ratio);

        // 创建缩略图画布
        $thumbnail = imagecreatetruecolor($newWidth, $newHeight);

        // 保持透明度
        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);
        $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
        imagefilledrectangle($thumbnail, 0, 0, $newWidth, $newHeight, $transparent);

        // 缩放
        imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, $newWidth, $newHeight, $srcWidth, $srcHeight);

        return $thumbnail;
    }

    /**
     * 添加渐变背景
     */
    private static function addGradient(\GdImage $image, int $width, int $height, array $color1, array $color2): void
    {
        for ($y = 0; $y < $height; $y++) {
            $ratio = $y / $height;
            $r = (int) ($color1[0] * (1 - $ratio) + $color2[0] * $ratio);
            $g = (int) ($color1[1] * (1 - $ratio) + $color2[1] * $ratio);
            $b = (int) ($color1[2] * (1 - $ratio) + $color2[2] * $ratio);

            $color = imagecolorallocate($image, $r, $g, $b);
            imageline($image, 0, $y, $width, $y, $color);
        }
    }
}
