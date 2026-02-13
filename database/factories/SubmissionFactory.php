<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Student;
use App\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Submission>
 */
class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'assignment_id' => Assignment::factory(),
            'file_path' => 'submissions/test.stl',
            'file_name' => fake()->word().'.stl',
            'file_size' => fake()->numberBetween(1000, 10000000),
            'preview_image_path' => null,
            'status' => 'pending',
            'score' => null,
            'feedback' => null,
        ];
    }

    public function scored(?int $score = null): static
    {
        return $this->state(fn (array $attributes) => [
            'score' => $score ?? fake()->numberBetween(0, 12),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'score' => null,
        ]);
    }
}
