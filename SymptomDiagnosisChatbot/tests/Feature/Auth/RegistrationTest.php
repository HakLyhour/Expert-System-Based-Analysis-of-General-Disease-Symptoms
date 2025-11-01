<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'user_name' => 'Test User',
        'email' => 'test@example.com',
        'date_of_birth' => '2000-01-01',
        'gender' => 'male',
        'weight' => '70',
        'height' => '175',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertAuthenticated();
});
