<?php

use App\Models\User;

test('guest is redirected to gallery', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('submissions.gallery'));
});

test('admin sees dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertOk();
});

test('teacher sees dashboard', function () {
    $user = User::factory()->create(['role' => 'teacher']);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertOk();
});

test('student is redirected to gallery', function () {
    $user = User::factory()->create(['role' => 'student']);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertRedirect(route('submissions.gallery'));
});
