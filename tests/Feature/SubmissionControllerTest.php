<?php

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\Submission;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

describe('SubmissionController', function () {
    describe('index', function () {
        test('can access submissions index page without login', function () {
            Student::factory()->create(['year' => 2025]);

            $response = $this->get(route('submissions.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('years')
                );
        });

        test('returns years from students', function () {
            Student::factory()->create(['year' => 2025]);
            Student::factory()->create(['year' => 2024]);

            $response = $this->get(route('submissions.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->where('years.0', '2025')
                    ->where('years.1', '2024')
                );
        });
    });

    describe('getAllSubmissions', function () {
        test('returns all submissions with relationships without login', function () {
            $submission = Submission::factory()->create();

            $response = $this->get(route('api.submissions.all'));

            $response->assertOk()
                ->assertJsonFragment([
                    'id' => $submission->id,
                    'student_id' => $submission->student_id,
                    'assignment_id' => $submission->assignment_id,
                ]);
        });
    });

    describe('getStudentsByYear', function () {
        test('returns students filtered by year without login', function () {
            Student::factory()->create(['year' => 2025, 'name' => '张三']);
            Student::factory()->create(['year' => 2024, 'name' => '李四']);

            $response = $this->get(route('api.submissions.students-by-year', ['year' => 2025]));

            $response->assertOk()
                ->assertJsonCount(1)
                ->assertJsonFragment(['name' => '张三']);
        });
    });

    describe('getLessonsByYear', function () {
        test('returns active lessons filtered by year without login', function () {
            $activeLesson = Lesson::factory()->create(['year' => '2025', 'is_active' => true]);
            Lesson::factory()->create(['year' => '2025', 'is_active' => false]);

            $response = $this->get(route('api.submissions.lessons-by-year', ['year' => '2025']));

            $response->assertOk()
                ->assertJsonCount(1);
        });
    });

    describe('getAssignmentsByLesson', function () {
        test('returns published assignments for lesson without login', function () {
            $lesson = Lesson::factory()->create();
            Assignment::factory()->create(['lesson_id' => $lesson->id, 'is_published' => true]);
            Assignment::factory()->create(['lesson_id' => $lesson->id, 'is_published' => false]);

            $response = $this->get(route('api.submissions.assignments-by-lesson', ['lesson_id' => $lesson->id]));

            $response->assertOk()
                ->assertJsonCount(1);
        });
    });

    describe('getSubmissionsByAssignment', function () {
        test('returns submissions for assignment without login', function () {
            $assignment = Assignment::factory()->create();
            Submission::factory()->count(3)->create(['assignment_id' => $assignment->id]);

            $response = $this->get(route('api.submissions.submissions-by-assignment', ['assignment_id' => $assignment->id]));

            $response->assertOk()
                ->assertJsonCount(3);
        });
    });

    describe('updateScore', function () {
        test('can update submission score with grade G', function () {
            $user = User::factory()->create();
            $submission = Submission::factory()->create(['score' => null]);

            $response = $this->actingAs($user)->postJson(route('api.submissions.score'), [
                'submission_id' => $submission->id,
                'grade' => 'G',
            ]);

            $response->assertOk()
                ->assertJson([
                    'success' => true,
                    'score' => 12,
                    'grade' => 'G',
                ]);

            expect($submission->fresh()->score)->toBe(12);
        });

        test('can update submission score with grade A', function () {
            $user = User::factory()->create();
            $submission = Submission::factory()->create(['score' => null]);

            $response = $this->actingAs($user)->postJson(route('api.submissions.score'), [
                'submission_id' => $submission->id,
                'grade' => 'A',
            ]);

            $response->assertOk()
                ->assertJson([
                    'success' => true,
                    'score' => 10,
                    'grade' => 'A',
                ]);
        });

        test('validates grade values', function () {
            $user = User::factory()->create();
            $submission = Submission::factory()->create();

            $response = $this->actingAs($user)->postJson(route('api.submissions.score'), [
                'submission_id' => $submission->id,
                'grade' => 'X',
            ]);

            $response->assertStatus(422);
        });

        test('requires authentication', function () {
            $submission = Submission::factory()->create();

            $response = $this->postJson(route('api.submissions.score'), [
                'submission_id' => $submission->id,
                'grade' => 'G',
            ]);

            $response->assertUnauthorized();
        });
    });

    describe('cancelScore', function () {
        test('can cancel submission score', function () {
            $user = User::factory()->create();
            $submission = Submission::factory()->create(['score' => 10]);

            $response = $this->actingAs($user)->postJson(route('api.submissions.cancel-score'), [
                'submission_id' => $submission->id,
            ]);

            $response->assertOk()
                ->assertJson([
                    'success' => true,
                    'score' => null,
                ]);

            expect($submission->fresh()->score)->toBeNull();
        });

        test('requires authentication', function () {
            $submission = Submission::factory()->create(['score' => 10]);

            $response = $this->postJson(route('api.submissions.cancel-score'), [
                'submission_id' => $submission->id,
            ]);

            $response->assertUnauthorized();
        });
    });

    describe('destroy', function () {
        test('can delete a submission', function () {
            $user = User::factory()->create();
            $submission = Submission::factory()->create([
                'file_path' => 'test/file.stl',
            ]);

            $response = $this->actingAs($user)->deleteJson(route('api.submissions.destroy', $submission->id));

            $response->assertOk()
                ->assertJson(['success' => true]);

            $this->assertDatabaseMissing('submissions', ['id' => $submission->id]);
        });

        test('requires authentication', function () {
            $submission = Submission::factory()->create();

            $response = $this->deleteJson(route('api.submissions.destroy', $submission->id));

            $response->assertUnauthorized();
        });
    });
});
