<?php

use App\Models\Assignment;
use App\Models\Student;
use App\Models\Submission;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Submission Model', function () {
    test('can create a submission', function () {
        $student = Student::factory()->create();
        $assignment = Assignment::factory()->create();

        $submission = Submission::factory()->create([
            'student_id' => $student->id,
            'assignment_id' => $assignment->id,
            'file_path' => 'submissions/2025/1/1/test.stl',
            'file_name' => 'test.stl',
            'file_size' => 1024000,
            'status' => 'pending',
            'score' => null,
        ]);

        expect($submission)
            ->file_name->toBe('test.stl')
            ->file_size->toBe(1024000)
            ->status->toBe('pending')
            ->score->toBeNull();
    });

    test('has fillable attributes', function () {
        $submission = new Submission;

        expect($submission->getFillable())->toContain(
            'student_id',
            'assignment_id',
            'file_path',
            'file_name',
            'file_size',
            'preview_image_path',
            'status',
            'score',
            'feedback'
        );
    });

    test('casts attributes correctly', function () {
        $submission = Submission::factory()->create([
            'file_size' => '1024000',
            'score' => '10',
        ]);

        expect($submission->file_size)->toBeInt()
            ->and($submission->score)->toBeInt();
    });

    test('belongs to student', function () {
        $student = Student::factory()->create();
        $submission = Submission::factory()->create(['student_id' => $student->id]);

        expect($submission->student->id)->toBe($student->id);
    });

    test('belongs to assignment', function () {
        $assignment = Assignment::factory()->create();
        $submission = Submission::factory()->create(['assignment_id' => $assignment->id]);

        expect($submission->assignment->id)->toBe($assignment->id);
    });

    test('can be scored', function () {
        $submission = Submission::factory()->scored(10)->create();

        expect($submission->score)->toBe(10);
    });

    test('can be pending', function () {
        $submission = Submission::factory()->pending()->create();

        expect($submission->status)->toBe('pending')
            ->and($submission->score)->toBeNull();
    });

    test('score can be updated', function () {
        $submission = Submission::factory()->create(['score' => null]);

        $submission->update(['score' => 12]);

        expect($submission->fresh()->score)->toBe(12);
    });
});
