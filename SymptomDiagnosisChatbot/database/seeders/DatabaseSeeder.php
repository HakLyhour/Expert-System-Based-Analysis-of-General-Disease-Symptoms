<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'user_name'   => 'Admin',
            'date_of_birth'  => '2001-09-29', //yyyy-mm-dd format
            'gender'      => 'male',
            'role'        => 'admin',
            'image'       => 'User.png', // Default image for admin
            'email'       => 'admin@pikrus.com',
            'password'    => Hash::make('Admin@1234'), // This is the actual password
            'weight'      => '70',
            'height'      => '170',
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }
}