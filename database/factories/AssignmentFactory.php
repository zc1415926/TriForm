<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\UploadType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assignment>
 */
class AssignmentFactory extends Factory
{
    protected $model = Assignment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['3D建模作业', '设计草图作业', '渲染作业', '动画作业', '模型导出作业']),
            'upload_type_id' => UploadType::factory(),
            'lesson_id' => Lesson::factory(),
            'is_required' => fake()->boolean(),
            'is_published' => fake()->boolean(),
        ];
    }

    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => true,
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }
}
