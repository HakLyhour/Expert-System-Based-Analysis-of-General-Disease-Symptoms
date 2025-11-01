<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class RegisteredDoctorController extends Controller
{
    // List doctors
    public function index()
    {
        $doctors = User::where('role', 'doctor')->get();
        return Inertia::render('ListDoctor/ListDoctor', [
            'doctors' => $doctors,
        ]);
    }

    // Register new doctor
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_name'      => 'required|string|max:255',
            'date_of_birth'  => 'required|date|before:today',
            'gender'         => 'required|in:male,female,other',
            // If image is a base64 string, validate as string; for file uploads, use 'image'
            'image'          => 'nullable|image|max:10240', // Max 10MB
            'weight'         => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
            'email'          => 'required|string|lowercase|email|max:255|unique:users',
            'password'       => [
                'required',
                'confirmed',
                Password::min(8)->letters()->numbers(),
            ],
        ]);

        // Handle file upload
        if ($request->hasFile('image')) {
            $imageFile = $request->file('image');
            $filename = 'user_' . Str::random(12) . '.jpg';
            $img = Image::read($imageFile)   // read file
                ->cover(300, 300)            // crop + resize
                ->toJpeg(80);                // compress to 80%

            // Store to public disk (storage/app/public/users)
            Storage::disk('public')->put('users/' . $filename, $img);

            $validated['image'] = 'users/' . $filename;
        } else {
            $validated['image'] = 'doctor.png';
        }

        $validated['role'] = 'doctor';
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('listdoctor.index')
            ->with('success', 'Doctor account created successfully!');
    }
    // Update doctor
    public function update(Request $request, $id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);

        $validated = $request->validate([
            'user_name'      => 'required|string|max:255',
            'date_of_birth'  => 'required|date|before:today',
            'gender'         => 'required|in:male,female,other',
            'image'          => 'nullable|image|max:10240', // Max 10MB
            'weight'         => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
            'email'          => 'required|string|lowercase|email|max:255|unique:users,email,' . $doctor->id,
            // Password fields are optional on update
            'current_password' => 'nullable|string',
            'password'       => [
                'nullable',
                'confirmed',
                Password::min(8)->letters()->numbers(),
            ],
        ]);

        // Handle file upload
        if ($request->hasFile('image')) {
            $imageFile = $request->file('image');
            $filename = 'user_' . Str::random(12) . '.jpg';
            $img = Image::read($imageFile)   // read file
                ->cover(300, 300)            // crop + resize
                ->toJpeg(80);                // compress to 80%

            Storage::disk('public')->put('users/' . $filename,  $img);

            // Optionally delete old image if not default
            if ($doctor->image && $doctor->image !== 'doctor.png' && Storage::disk('public')->exists($doctor->image)) {
                Storage::disk('public')->delete($doctor->image);
            }

            $validated['image'] = 'users/' . $filename;
        } else {
            // If no new image, keep the old one
            $validated['image'] = $doctor->image ?? 'doctor.png';
        }

        // Only update password if provided
        if ($request->filled('password')) {
            // Optionally check current password
            if ($request->filled('current_password') && !Hash::check($request->input('current_password'), $doctor->password)) {
                return back()->withErrors(['current_password' => 'Current password is incorrect.']);
            }
            $validated['password'] = Hash::make($request->input('password'));
        } else {
            unset($validated['password']);
        }

        $doctor->update($validated);

        return redirect()->route('listdoctor.index')
            ->with('success', 'Doctor account updated successfully!');
    }

    // Delete doctor
    // public function destroy($id)
    // {
    //     User::where('role', 'doctor')->where('id', $id)->delete();
    //     return redirect()->route('listdoctor.index');
    // }
}







// namespace App\Http\Controllers\Auth;

// use Illuminate\Support\Facades\Storage;
// use App\Http\Controllers\Controller;
// use App\Models\User;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Validation\Rules\Password;
// use Inertia\Inertia;
// use Illuminate\Support\Str;
// use Intervention\Image\Laravel\Facades\Image;

// class RegisteredDoctorController extends Controller
// {
//     // List doctors
//     public function index()
//     {
//         $doctors = User::where('role', 'doctor')->get();
//         return Inertia::render('ListDoctor/ListDoctor', [
//             'doctors' => $doctors,
//         ]);
//     }

//     // Register new doctor
//     public function store(Request $request)
//     {
//         $validated = $request->validate([
//             'user_name'      => 'required|string|max:255',
//             'date_of_birth'  => 'required|date|before:today',
//             'gender'         => 'required|in:male,female,other',
//             'image'          => 'nullable|image|max:2048',
//             'weight'         => 'nullable|numeric|min:0',
//             'height'         => 'nullable|numeric|min:0',
//             'email'          => 'required|string|lowercase|email|max:255|unique:users',
//             'password'       => [
//                 'required',
//                 'confirmed',
//                 Password::min(8)->letters()->numbers(),
//             ],
//         ]);

//         // Handle file upload (Intervention v3)
//         if ($request->hasFile('image')) {
//             $imageFile = $request->file('image');
//             $filename = 'user_' . Str::random(12) . '.jpg';

//             $img = Image::read($imageFile)   // read file
//                 ->cover(300, 300)            // crop + resize
//                 ->toJpeg(80);                // compress to 80%

//             Storage::disk('public')->put('users/' . $filename, (string) $img);

//             $validated['image'] = 'users/' . $filename;
//         } else {
//             $validated['image'] = 'doctor.png';
//         }

//         $validated['role'] = 'doctor';
//         $validated['password'] = Hash::make($validated['password']);

//         User::create($validated);

//         return redirect()->route('listdoctor.index')
//             ->with('success', 'Doctor account created successfully!');
//     }

//     // Update doctor
//     public function update(Request $request, $id)
//     {
//         $doctor = User::where('role', 'doctor')->findOrFail($id);

//         $validated = $request->validate([
//             'user_name'      => 'required|string|max:255',
//             'date_of_birth'  => 'required|date|before:today',
//             'gender'         => 'required|in:male,female,other',
//             'image'          => 'nullable|image|max:2048',
//             'weight'         => 'nullable|numeric|min:0',
//             'height'         => 'nullable|numeric|min:0',
//             'email'          => 'required|string|lowercase|email|max:255|unique:users,email,' . $doctor->id,
//             'current_password' => 'nullable|string',
//             'password'       => [
//                 'nullable',
//                 'confirmed',
//                 Password::min(8)->letters()->numbers(),
//             ],
//         ]);

//         // Handle file upload (Intervention v3)
//         if ($request->hasFile('image')) {
//             $imageFile = $request->file('image');
//             $filename = 'user_' . Str::random(12) . '.jpg';

//             $img = Image::read($imageFile)
//                 ->cover(300, 300)   // crop + resize
//                 ->toJpeg(80);   // compress to 80% quality

//             Storage::disk('public')->put('users/' . $filename, (string) $img);

//             // Delete old image if not default
//             if ($doctor->image && $doctor->image !== 'doctor.png' && Storage::disk('public')->exists($doctor->image)) {
//                 Storage::disk('public')->delete($doctor->image);
//             }

//             $validated['image'] = 'users/' . $filename;
//         } else {
//             $validated['image'] = $doctor->image ?? 'doctor.png';
//         }

//         // Update password only if provided
//         if ($request->filled('password')) {
//             if ($request->filled('current_password') && !Hash::check($request->input('current_password'), $doctor->password)) {
//                 return back()->withErrors(['current_password' => 'Current password is incorrect.']);
//             }
//             $validated['password'] = Hash::make($request->input('password'));
//         } else {
//             unset($validated['password']);
//         }

//         $doctor->update($validated);

//         return redirect()->route('listdoctor.index')
//             ->with('success', 'Doctor account updated successfully!');
//     }
// }
