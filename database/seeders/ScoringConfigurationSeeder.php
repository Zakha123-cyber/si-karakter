<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\ScoringConfiguration;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScoringConfigurationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', UserRole::Admin)->first();

        ScoringConfiguration::updateOrCreate(
            ['name' => 'Default Weight'],
            [
                'test_weight' => 60.00,
                'observation_weight' => 40.00,
                'is_active' => true,
                'effective_from' => now()->startOfYear()->toDateString(),
                'effective_until' => null,
                'created_by' => $admin?->id,
            ]
        );
    }
}
