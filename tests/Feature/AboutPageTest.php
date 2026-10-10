<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit the about page', function () {
    $response = $this->get(route('about'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page->component('about'));
});

test('authenticated users can visit the about page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('about'))->assertOk();
});

test('guests can directly visit each company profile page', function (string $section) {
    $this->get(route('about.'.$section))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('about')
            ->where('section', $section));
})->with(['fitur', 'peran', 'alur', 'visi-misi', 'ai']);
