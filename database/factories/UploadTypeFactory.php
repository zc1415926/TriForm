<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UploadType>
 */
class UploadTypeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = \App\Models\UploadType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $extensionGroups = [
            ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
            ['mp4', 'avi', 'mov', 'wmv'],
            ['mp3', 'wav', 'flac', 'aac'],
            ['zip', 'rar', '7z', 'tar', 'gz'],
        ];

        return [
            'name' => fake()->randomElement(['图片文件', '文档文件', '视频文件', '音频文件', '压缩文件']),
            'description' => fake()->sentence(),
            'extensions' => fake()->randomElement($extensionGroups),
            'max_size' => fake()->randomElement([10485760, 52428800, 104857600, 524288000]),
        ];
    }
}
