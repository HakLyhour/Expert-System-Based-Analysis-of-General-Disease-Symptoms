<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password; // ← Use full path
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'user_name'      => 'required|string|max:255',
            'date_of_birth'  => 'required|date|before:today',
            'gender'         => 'required|in:male,female,other',
            'image'          => 'nullable|image|max:2048',
            'weight'         => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
            'email'          => 'required|string|lowercase|email|max:255|unique:users',
            'password'       => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers(),
            ],
        ]);

        // Handle image upload or set default
        $image = $request->file('image')
            ? $request->file('image')->store('users', 'public')
            : 'User.png';

        $user = User::create([
            'user_name'      => $request->user_name,
            'date_of_birth'  => $request->date_of_birth,
            'gender'         => $request->gender,
            'image'          => $image,
            'weight'         => $request->weight,
            'height'         => $request->height,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => 'patient',
        ], [
            'date_of_birth.required' => 'The Date of Birth field is required.',
            'date_of_birth.date' => 'The Date of Birth must be a valid date.',
            'date_of_birth.before' => 'The Date of Birth must be before today.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.letters' => 'Password must contain at least one letter.',
            'password.numbers' => 'Password must contain at least one number.',
            'password.mixedCase' => 'Password must have upper and lower case letters.',
            'password.symbols' => 'Password must contain at least one symbol.',
        ]);

        event(new Registered($user));
        Auth::login($user);

        return redirect(route('home', absolute: false));
    }
}
