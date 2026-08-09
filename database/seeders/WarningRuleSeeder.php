<?php

namespace Database\Seeders;

use App\Models\WarningRule;
use Illuminate\Database\Seeder;

class WarningRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        WarningRule::query()->updateOrCreate(
            [
                'rule_type' => 'observation_negative_indicator',
                'name' => 'Observasi Negatif Indikator Pendampingan',
            ],
            [
                'description' => 'Rule awal untuk mendeteksi santri yang membutuhkan pendampingan berdasarkan catatan observasi negatif pada indikator peringatan.',
                'conditions_json' => [
                    'window_days' => 14,
                    'minimum_negative_items' => 2,
                    'require_warning_indicator' => true,
                    'indicator_codes' => ['dishonesty_warning'],
                    'title_template' => ':student membutuhkan pendampingan karakter',
                    'description_template' => ':student memiliki :count catatan observasi yang membutuhkan pendampingan dalam :days hari terakhir. Indikator yang perlu dikuatkan: :indicators.',
                ],
                'severity' => 'medium',
                'is_active' => true,
            ],
        );
    }
}
