<?php

use App\Models\Assignment;
use App\Models\Lesson;
use App\Models\UploadType;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $user = User::factory()->create();
    $this->actingAs($user);
});

describe('LessonController', function () {
    describe('index', function () {
        test('can list lessons', function () {
            Lesson::factory()->count(3)->create();

            $response = $this->get(route('lessons.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('lessons', 3)
                    ->has('uploadTypes')
                );
        });

        test('includes assignments count', function () {
            $lesson = Lesson::factory()->create();
            Assignment::factory()->count(2)->create(['lesson_id' => $lesson->id]);

            $response = $this->get(route('lessons.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->where('lessons.0.assignments_count', 2)
                );
        });

        test('includes assignments relationship', function () {
            $lesson = Lesson::factory()->create();
            Assignment::factory()->create(['lesson_id' => $lesson->id]);

            $response = $this->get(route('lessons.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('lessons.0.assignments', 1)
                );
        });
    });

    describe('store', function () {
        test('can create a new lesson', function () {
            $data = [
                'name' => '3D建模基础',
                'year' => '2025',
                'is_active' => true,
                'content' => '<p>课程内容</p>',
            ];

            $response = $this->post(route('lessons.store'), $data);

            $response->assertRedirect(route('lessons.index'))
                ->assertSessionHas('success', '课时创建成功');

            $this->assertDatabaseHas('lessons', $data);
        });

        test('can create lesson with assignments', function () {
            $uploadType = UploadType::factory()->create();

            $data = [
                'name' => '3D建模基础',
                'year' => '2025',
                'is_active' => true,
                'content' => '<p>课程内容</p>',
                'assignments' => [
                    [
                        'name' => '作业1',
                        'upload_type_id' => $uploadType->id,
                        'is_required' => true,
                        'is_published' => true,
                    ],
                    [
                        'name' => '作业2',
                        'upload_type_id' => $uploadType->id,
                        'is_required' => false,
                        'is_published' => false,
                    ],
                ],
            ];

            $response = $this->post(route('lessons.store'), $data);

            $response->assertRedirect(route('lessons.index'));

            $lesson = Lesson::first();
            expect($lesson->assignments)->toHaveCount(2);
        });

        test('validates required fields', function () {
            $response = $this->post(route('lessons.store'), []);

            $response->assertSessionHasErrors(['name', 'year', 'is_active']);
        });
    });

    describe('update', function () {
        test('can update a lesson', function () {
            $lesson = Lesson::factory()->create([
                'name' => '原始名称',
                'year' => '2025',
                'is_active' => true,
                'content' => null,
            ]);

            $data = [
                'name' => '更新后的课程',
                'year' => '2026',
                'is_active' => false,
                'content' => '<p>更新后的内容</p>',
            ];

            $response = $this->put(route('lessons.update', $lesson), $data);

            $response->assertRedirect(route('lessons.index'))
                ->assertSessionHas('success', '课时更新成功');

            $lesson->refresh();
            expect($lesson->name)->toBe('更新后的课程')
                ->and($lesson->year)->toBe('2026')
                ->and($lesson->is_active)->toBe(false)
                ->and($lesson->content)->toBe('<p>更新后的内容</p>');
        });

        test('can update lesson with new assignments', function () {
            $lesson = Lesson::factory()->create();
            Assignment::factory()->create(['lesson_id' => $lesson->id]);
            $uploadType = UploadType::factory()->create();

            $data = [
                'name' => '更新后的课程',
                'year' => '2026',
                'is_active' => true,
                'assignments' => [
                    [
                        'name' => '新作业',
                        'upload_type_id' => $uploadType->id,
                        'is_required' => true,
                        'is_published' => true,
                    ],
                ],
            ];

            $response = $this->put(route('lessons.update', $lesson), $data);

            $response->assertRedirect(route('lessons.index'));

            $lesson->refresh();
            expect($lesson->assignments)->toHaveCount(1)
                ->and($lesson->assignments->first()->name)->toBe('新作业');
        });

        test('validates update data', function () {
            $lesson = Lesson::factory()->create();

            $response = $this->put(route('lessons.update', $lesson), [
                'name' => '',
                'year' => '',
            ]);

            $response->assertSessionHasErrors(['name', 'year', 'is_active']);
        });
    });

    describe('destroy', function () {
        test('can delete a lesson', function () {
            $lesson = Lesson::factory()->create();

            $response = $this->delete(route('lessons.destroy', $lesson));

            $response->assertRedirect(route('lessons.index'))
                ->assertSessionHas('success', '课时删除成功');

            $this->assertDatabaseMissing('lessons', ['id' => $lesson->id]);
        });
    });
});
