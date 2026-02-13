<?php

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\Submission;
use App\Models\UploadType;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Assignment Model', function () {
    test('can create an assignment', function () {
        $uploadType = UploadType::factory()->create();
        $lesson = Lesson::factory()->create();

        $assignment = Assignment::factory()->create([
            'name' => '期末作品',
            'upload_type_id' => $uploadType->id,
            'lesson_id' => $lesson->id,
            'is_required' => true,
            'is_published' => true,
        ]);

        expect($assignment)
            ->name->toBe('期末作品')
            ->is_required->toBeTrue()
            ->is_published->toBeTrue();
    });

    test('has fillable attributes', function () {
        $assignment = new Assignment;

        expect($assignment->getFillable())->toContain(
            'name',
            'upload_type_id',
            'lesson_id',
            'is_required',
            'is_published'
        );
    });

    test('casts boolean attributes', function () {
        $assignment = Assignment::factory()->create([
            'is_required' => 1,
            'is_published' => 0,
        ]);

        expect($assignment->is_required)->toBeBool()
            ->and($assignment->is_published)->toBeBool();
    });

    test('belongs to upload type', function () {
        $uploadType = UploadType::factory()->create();
        $assignment = Assignment::factory()->create(['upload_type_id' => $uploadType->id]);

        expect($assignment->uploadType->id)->toBe($uploadType->id);
    });

    test('belongs to lesson', function () {
        $lesson = Lesson::factory()->create();
        $assignment = Assignment::factory()->create(['lesson_id' => $lesson->id]);

        expect($assignment->lesson->id)->toBe($lesson->id);
    });

    test('has many submissions', function () {
        $assignment = Assignment::factory()->create();
        Submission::factory()->count(2)->create(['assignment_id' => $assignment->id]);

        expect($assignment->submissions)->toHaveCount(2);
    });

    test('can be required', function () {
        $assignment = Assignment::factory()->required()->create();

        expect($assignment->is_required)->toBeTrue();
    });

    test('can be published', function () {
        $assignment = Assignment::factory()->published()->create();

        expect($assignment->is_published)->toBeTrue();
    });
});
