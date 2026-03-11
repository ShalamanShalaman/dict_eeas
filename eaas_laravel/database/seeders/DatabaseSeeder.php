<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Position;
use App\Models\OfficeLocation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Basic Positions
        $adminPosition = Position::create(['name' => 'System Administrator']);
        $reviewerPosition = Position::create(['name' => 'Provincial Officer']);
        $employeePosition = Position::create(['name' => 'Staff']);

        // 2. Create the Admin User
        User::create([
            'user_id' => 'ADMIN001',
            'public_id' => Str::uuid(),
            'email' => 'admin@system.local',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'first_name' => 'System',
            'last_name' => 'Admin',
            'position_id' => $adminPosition->id,
            'is_active' => true,
            'force_change_password' => false,
        ]);

        // 3. Create the Reviewer User
        $reviewer = User::create([
            'user_id' => 'REV001',
            'public_id' => Str::uuid(),
            'email' => 'reviewer@system.local',
            'password' => Hash::make('reviewer123'),
            'role' => 'reviewer',
            'first_name' => 'John',
            'last_name' => 'Reviewer',
            'position_id' => $reviewerPosition->id,
            'is_active' => true,
            'force_change_password' => false,
        ]);

        // 4. Create an Office Location and assign the Reviewer
        $office = OfficeLocation::create([
            'location' => 'Main Office, Cauayan City',
            'reviewer_id' => $reviewer->id,
        ]);

        // 5. Create the Employee User and assign to the Office
        User::create([
            'user_id' => 'EMP001',
            'public_id' => Str::uuid(),
            'email' => 'employee@system.local',
            'password' => Hash::make('employee123'),
            'role' => 'employee',
            'first_name' => 'Jane',
            'last_name' => 'Employee',
            'position_id' => $employeePosition->id,
            'office_location_id' => $office->id,
            'is_active' => true,
            'force_change_password' => false,
        ]);

        $this->command->info('Database seeded successfully with Admin, Reviewer, and Employee accounts!');
    }
}