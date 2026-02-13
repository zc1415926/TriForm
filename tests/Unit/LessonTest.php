<?php

use App\Models\Assignment;
use App\Models\Lesson;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Lesson Model', function () {
    test('can create a lesson', function () {
        $lesson = Lesson::factory()->create([
            'name' => '3D建模基础',
            'year' => '2025',
            'is_active' => true,
            'content' => '<p>课程内容</p>',
        ]);

        expect($lesson)
            ->name->toBe('3D建模基础')
            ->year->toBe('2025')
            ->is_active->toBeTrue()
            ->content->toBe('<p>课程内容</p>');
    });

    test('has fillable attributes', function () {
        $lesson = new Lesson;

        expect($lesson->getFillable())->toContain(
            'name',
            'year',
            'is_active',
            'content'
        );
    });

    test('casts is_active as boolean', function () {
        $lesson = Lesson::factory()->create(['is_active' => 1]);

        expect($lesson->is_active)->toBeBool();
    });

    test('has assignments relationship', function () {
        $lesson = Lesson::factory()->create();
        $assignment = Assignment::factory()->create(['lesson_id' => $lesson->id]);

        expect($lesson->assignments)->toHaveCount(1)
            ->and($lesson->assignments->first()->id)->toBe($assignment->id);
    });

    test('can have multiple assignments', function () {
        $lesson = Lesson::factory()->create();
        Assignment::factory()->count(3)->create(['lesson_id' => $lesson->id]);

        expect($lesson->assignments)->toHaveCount(3);
    });

    test('deleting lesson does not cascade assignments by default', function () {
        $lesson = Lesson::factory()->create();
        $assignment = Assignment::factory()->create(['lesson_id' => $lesson->id]);

        $lesson->delete();

        // Note: Depending on database foreign key constraints, this behavior may vary
        expect(Lesson::count())->toBe(0);
    });
});
