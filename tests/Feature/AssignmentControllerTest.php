<?php

use App\Models\Assignment;
use App\Models\UploadType;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $user = User::factory()->create();
    $this->actingAs($user);
});

describe('AssignmentController', function () {
    describe('index', function () {
        test('can list assignments', function () {
            Assignment::factory()->count(3)->create();

            $response = $this->get(route('assignments.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('assignments', 3)
                    ->has('uploadTypes')
                );
        });

        test('includes upload type relationship', function () {
            $uploadType = UploadType::factory()->create(['name' => '图片文件']);
            Assignment::factory()->create(['upload_type_id' => $uploadType->id]);

            $response = $this->get(route('assignments.index'));

            $response->assertOk()
                ->assertInertia(fn (AssertableInertia $page) => $page
                    ->has('assignments.0.upload_type')
                );
        });
    });

    describe('store', function () {
        test('can create a new assignment', function () {
            $uploadType = UploadType::factory()->create();

            $data = [
                'name' => '期末作品',
                'upload_type_id' => $uploadType->id,
                'lesson_id' => null,
                'is_required' => true,
                'is_published' => true,
            ];

            $response = $this->withoutMiddleware()->post(route('assignments.store'), $data);

            $response->assertRedirect(route('assignments.index'))
                ->assertSessionHas('success', '作业创建成功');

            $this->assertDatabaseHas('assignments', $data);
        });

        test('validates required fields', function () {
            $response = $this->withoutMiddleware()->post(route('assignments.store'), []);

            $response->assertSessionHasErrors(['name', 'upload_type_id', 'is_required', 'is_published']);
        });

        test('validates upload_type_id exists', function () {
            $response = $this->withoutMiddleware()->post(route('assignments.store'), [
                'name' => '期末作品',
                'upload_type_id' => 99999,
                'is_required' => true,
                'is_published' => true,
            ]);

            $response->assertSessionHasErrors(['upload_type_id']);
        });
    });

    describe('update', function () {
        test('can update an assignment', function () {
            $assignment = Assignment::factory()->create();
            $uploadType = UploadType::factory()->create();

            $data = [
                'name' => '更新后的作业',
                'upload_type_id' => $uploadType->id,
                'lesson_id' => null,
                'is_required' => false,
                'is_published' => false,
            ];

            $response = $this->withoutMiddleware()->put(route('assignments.update', $assignment), $data);

            $response->assertRedirect(route('assignments.index'))
                ->assertSessionHas('success', '作业更新成功');

            $this->assertDatabaseHas('assignments', $data + ['id' => $assignment->id]);
        });

        test('validates update data', function () {
            $assignment = Assignment::factory()->create();

            $response = $this->withoutMiddleware()->put(route('assignments.update', $assignment), [
                'name' => '',
                'upload_type_id' => 99999,
            ]);

            $response->assertSessionHasErrors(['name', 'upload_type_id', 'is_required', 'is_published']);
        });
    });

    describe('destroy', function () {
        test('can delete an assignment', function () {
            $assignment = Assignment::factory()->create();

            $response = $this->withoutMiddleware()->delete(route('assignments.destroy', $assignment));

            $response->assertRedirect(route('assignments.index'))
                ->assertSessionHas('success', '作业删除成功');

            $this->assertDatabaseMissing('assignments', ['id' => $assignment->id]);
        });
    });
});
