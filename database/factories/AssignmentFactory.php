<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assignment>
 */
class AssignmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['3D建模作业', '设计草图作业', '渲染作业', '动画作业', '模型导出作业']),
            'upload_type_id' => \App\Models\UploadType::inRandomOrder()->first()->id ?? 1,
            'is_required' => fake()->boolean(),
            'is_published' => fake()->boolean(),
        ];
    }
}
