<?php

use App\Models\Student;
use App\Models\Submission;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('Student Model', function () {
    test('can create a student', function () {
        $student = Student::factory()->create([
            'name' => '张三',
            'grade' => 3,
            'class' => 2,
            'year' => 2025,
        ]);

        expect($student)
            ->name->toBe('张三')
            ->grade->toBe(3)
            ->class->toBe(2)
            ->year->toBe(2025);
    });

    test('has fillable attributes', function () {
        $student = new Student;

        expect($student->getFillable())->toContain(
            'name',
            'grade',
            'class',
            'year'
        );
    });

    test('casts attributes correctly', function () {
        $student = Student::factory()->create([
            'grade' => '3',
            'class' => '2',
            'year' => '2025',
        ]);

        expect($student->grade)->toBeInt()
            ->and($student->class)->toBeInt()
            ->and($student->year)->toBeInt();
    });

    test('has submissions relationship', function () {
        $student = Student::factory()->create();
        $submission = Submission::factory()->create(['student_id' => $student->id]);

        expect($student->submissions)->toHaveCount(1)
            ->and($student->submissions->first()->id)->toBe($submission->id);
    });

    test('grade text attribute returns correct value', function () {
        $gradeMap = [1 => '一', 2 => '二', 3 => '三', 4 => '四', 5 => '五', 6 => '六'];

        foreach ($gradeMap as $grade => $expected) {
            $student = Student::factory()->create(['grade' => $grade]);
            expect($student->grade_text)->toBe($expected);
        }
    });

    test('grade text attribute returns unknown for invalid grade', function () {
        $student = Student::factory()->create(['grade' => 99]);
        expect($student->grade_text)->toBe('未知');
    });
});
