<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GroupStudentHistory>
 */
class GroupStudentHistoryFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'group_id' => Group::factory(),
            'academic_year_id' => AcademicYear::factory(),
            'joined_at' => now()->toDateString(),
            'left_at' => null,
        ];
    }
}
