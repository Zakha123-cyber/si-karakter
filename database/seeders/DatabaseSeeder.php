<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            InitialRoleUserSeeder::class,
        ]);

        $this->call([
            CharacterIndicatorSeeder::class,
            ScoringConfigurationSeeder::class,
            WarningRuleSeeder::class,
            TestReviewSeeder::class,
        ]);
    }
}
