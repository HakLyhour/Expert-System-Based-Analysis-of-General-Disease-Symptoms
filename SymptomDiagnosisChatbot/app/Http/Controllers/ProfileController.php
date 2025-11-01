<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;


class ProfileController extends Controller
{
    /**
     * Show the logged-in user's account settings (with info for editing).
     */
    public function indexpatient(Request $request): Response
    {
        return Inertia::render('SettingPage/SettingPatientPage', [
            'user' => $request->user(),
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function index(Request $request): Response
    {
        return Inertia::render('SettingPage/SettingAdminPage', [
            'user' => $request->user(),
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile (account info).
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {

            Log::info('Raw request data:', $request->all());
            Log::info('Validated data:', $request->validated());
            $user = $request->user();

            // Dump the validated data
            Log::info('Validated data:', $request->validated());
            $user->fill($request->validated());
            // Dump what has changed
            Log::info('Changed attributes:', $user->getDirty());
            if ($request->hasFile('image')) {
                $imageFile = $request->file('image');
                $filename = 'user_' . Str::random(12) . '.jpg';
                $img = Image::read($imageFile)
                    ->cover(300, 300)    // crop + resize
                    ->toJpeg(80);        // compress to 80% quality

                Storage::disk('public')->put('users/' . $filename, (string) $img);

                // Optionally delete old image if not default
                if ($user->image && $user->image !== 'doctor.png' && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }

                $user->image = 'users/' . $filename;
            }

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            Log::info('Updating user profile', $user->toArray());
            $user->save();
            Log::info('After save:', $user->fresh()->toArray());


            return Redirect::route('settings.profile.edit')->with('status', 'Profile updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating user profile:', ['message' => $e->getMessage()]);
            return Redirect::route('settings.profile.edit')->withErrors(['error' => 'Error updating profile.']);
        }
    }


    //update password
    public function updatePassword(PasswordUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->password = bcrypt($request->password);
        $user->save();

        return Redirect::route('settings.profile.edit')->with('status', 'Password updated successfully.');
    }



    /**
     * Delete the user's account (with password confirmation).
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
