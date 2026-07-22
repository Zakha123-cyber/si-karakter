<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class InitialRoleUserSeeder extends Seeder
{
    /**
     * Seed default accounts for local development and manual testing.
     */
    public function run(): void
    {
        $this->seedUser([
            'name' => 'Admin SI-KARAKTER',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => UserRole::Admin,
        ]);

        $this->seedUser([
            'name' => 'Ustadz Demo',
            'username' => 'ustadz',
            'email' => 'ustadz@example.com',
            'password' => 'password',
            'role' => UserRole::Teacher,
        ]);

        $this->seedUser([
            'name' => 'Santri Demo',
            'username' => 'santri',
            'email' => null,
            'password' => 'password',
            'pin' => '1234',
            'pin_enabled' => true,
            'role' => UserRole::Student,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function seedUser(array $attributes): void
    {
        User::query()->updateOrCreate(
            ['username' => $attributes['username']],
            [
                ...$attributes,
                'is_active' => true,
            ],
        );
    }
}
