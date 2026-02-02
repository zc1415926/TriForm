<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lesson>
 */
class LessonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['3D建模基础', '3D渲染技术', '3D动画制作', '3D模型优化', '3D材质设计']),
            'year' => fake()->randomElement(['2025', '2026', '2027']),
            'is_active' => fake()->boolean(80),
        ];
    }
}
