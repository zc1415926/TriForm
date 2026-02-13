<?php

use App\Models\Student;
use App\Models\Submission;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $user = User::factory()->create();
    $this->actingAs($user);
});

describe('StudentController', function () {
    describe('index', function () {
        test('can list students', function () {
            // Create students with the same year so they all appear
            Student::factory()->count(3)->create(['year' => 2025]);

            $response = $this->get(route('students.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('students', 3)
                    ->has('years')
                );
        });

        test('can filter students by year', function () {
            Student::factory()->create(['year' => 2025]);
            Student::factory()->create(['year' => 2024]);
            Student::factory()->create(['year' => 2024]);

            $response = $this->get(route('students.index', ['year' => 2024]));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('students', 2)
                    ->where('selectedYear', '2024')
                );
        });

        test('returns total score for each student', function () {
            $student = Student::factory()->create();
            Submission::factory()->create(['student_id' => $student->id, 'score' => 10]);
            Submission::factory()->create(['student_id' => $student->id, 'score' => 8]);

            $response = $this->get(route('students.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('students', 1)
                    ->where('students.0.total_score', 18)
                    ->where('students.0.total_submissions', 2)
                );
        });

        test('returns available years in descending order', function () {
            Student::factory()->create(['year' => 2023]);
            Student::factory()->create(['year' => 2025]);
            Student::factory()->create(['year' => 2024]);

            $response = $this->get(route('students.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->where('years', [2025, 2024, 2023])
                );
        });

        test('defaults to latest year when no filter provided', function () {
            Student::factory()->create(['year' => 2024]);
            Student::factory()->create(['year' => 2025]);

            $response = $this->get(route('students.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->where('selectedYear', 2025)
                );
        });
    });

    describe('store', function () {
        test('can create a new student', function () {
            $data = [
                'name' => '张三',
                'grade' => 3,
                'class' => 2,
                'year' => 2025,
            ];

            $response = $this->withoutMiddleware()->post(route('students.store'), $data);

            $response->assertRedirect(route('students.index'))
                ->assertSessionHas('success', '学生创建成功');

            $this->assertDatabaseHas('students', $data);
        });

        test('validates required fields', function () {
            $response = $this->withoutMiddleware()->post(route('students.store'), []);

            $response->assertSessionHasErrors(['name', 'grade', 'class', 'year']);
        });

        test('validates grade range', function () {
            $response = $this->withoutMiddleware()->post(route('students.store'), [
                'name' => '张三',
                'grade' => 7,
                'class' => 2,
                'year' => 2025,
            ]);

            $response->assertSessionHasErrors(['grade']);
        });

        test('validates class range', function () {
            $response = $this->withoutMiddleware()->post(route('students.store'), [
                'name' => '张三',
                'grade' => 3,
                'class' => 25,
                'year' => 2025,
            ]);

            $response->assertSessionHasErrors(['class']);
        });

        test('validates year range', function () {
            $response = $this->withoutMiddleware()->post(route('students.store'), [
                'name' => '张三',
                'grade' => 3,
                'class' => 2,
                'year' => 2019,
            ]);

            $response->assertSessionHasErrors(['year']);
        });
    });

    describe('update', function () {
        test('can update a student', function () {
            $student = Student::factory()->create();

            $data = [
                'name' => '李四',
                'grade' => 4,
                'class' => 3,
                'year' => 2026,
            ];

            $response = $this->withoutMiddleware()->put(route('students.update', $student), $data);

            $response->assertRedirect(route('students.index'))
                ->assertSessionHas('success', '学生更新成功');

            $this->assertDatabaseHas('students', $data + ['id' => $student->id]);
        });

        test('validates update data', function () {
            $student = Student::factory()->create();

            $response = $this->withoutMiddleware()->put(route('students.update', $student), [
                'name' => '',
                'grade' => 10,
                'class' => 30,
                'year' => 2050,
            ]);

            $response->assertSessionHasErrors(['name', 'grade', 'class', 'year']);
        });
    });

    describe('destroy', function () {
        test('can delete a student', function () {
            $student = Student::factory()->create();

            $response = $this->withoutMiddleware()->delete(route('students.destroy', $student));

            $response->assertRedirect(route('students.index'))
                ->assertSessionHas('success', '学生删除成功');

            $this->assertDatabaseMissing('students', ['id' => $student->id]);
        });
    });
});
