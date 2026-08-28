<?php

namespace Database\Seeders;

use App\Domain\EarlyWarning\StudentWarningGenerator;
use App\Enums\UserRole;
use App\Models\AcademicYear;
use App\Models\CharacterIndicator;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\ObservationEntry;
use App\Models\ObservationItem;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;

class EarlyWarningDemoSeeder extends Seeder
{
    /**
     * Seed bad observation data so the early warning rule can be validated manually.
     */
    public function run(StudentWarningGenerator $warningGenerator): void
    {
        $this->call([
            InitialRoleUserSeeder::class,
            WarningRuleSeeder::class,
        ]);

        $teacher = $this->teacher();
        $academicYear = $this->academicYear();
        $group = $this->group($academicYear, $teacher);
        $student = $this->student($group);
        $indicator = $this->warningIndicator();

        $this->negativeObservation(
            student: $student,
            teacher: $teacher,
            indicator: $indicator,
            observedAt: now()->subDay()->toDateString(),
            marker: 'DEMO_EARLY_WARNING_01',
            note: 'Santri beberapa kali belum terbuka saat ditanya kronologi kejadian dan membutuhkan penguatan kejujuran.',
        );

        $this->negativeObservation(
            student: $student,
            teacher: $teacher,
            indicator: $indicator,
            observedAt: now()->toDateString(),
            marker: 'DEMO_EARLY_WARNING_02',
            note: 'Santri kembali memberikan keterangan yang berubah-ubah sehingga perlu pendampingan dengan bahasa yang menenangkan.',
        );

        $student->load(['user', 'currentGroup']);

        $warningGenerator->generateForStudent($student);
    }

    private function teacher(): User
    {
        return User::query()->where('username', 'ustadz')->first()
            ?? User::query()->where('role', UserRole::Teacher)->first()
            ?? User::query()->create([
                'name' => 'Ustadz Demo',
                'username' => 'ustadz',
                'email' => 'ustadz@example.com',
                'password' => 'password',
                'role' => UserRole::Teacher,
                'is_active' => true,
            ]);
    }

    private function academicYear(): AcademicYear
    {
        return AcademicYear::query()->where('is_active', true)->first()
            ?? AcademicYear::query()->create([
                'name' => '2025/2026 Ganjil',
                'start_date' => '2025-07-01',
                'end_date' => '2025-12-31',
                'is_active' => true,
            ]);
    }

    private function group(AcademicYear $academicYear, User $teacher): Group
    {
        return Group::query()->updateOrCreate(
            ['name' => 'Kelompok Early Warning Demo'],
            [
                'academic_year_id' => $academicYear->id,
                'teacher_id' => $teacher->id,
                'description' => 'Kelompok demo untuk validasi early warning pendampingan.',
                'is_active' => true,
            ],
        );
    }

    private function student(Group $group): Student
    {
        $user = User::query()->updateOrCreate(
            ['username' => 'santri_warning_demo'],
            [
                'name' => 'Santri Warning Demo',
                'email' => 'santri.warning.demo@example.com',
                'password' => 'password',
                'pin' => '1234',
                'pin_enabled' => true,
                'role' => UserRole::Student,
                'is_active' => true,
            ],
        );

        $student = Student::query()->updateOrCreate(
            ['student_code' => 'EW-DEMO-001'],
            [
                'user_id' => $user->id,
                'birth_date' => '2017-05-12',
                'gender' => 'male',
                'current_group_id' => $group->id,
                'enrollment_date' => now()->subMonths(3)->toDateString(),
                'status' => 'active',
            ],
        );

        GroupStudentHistory::query()->updateOrCreate(
            [
                'student_id' => $student->id,
                'group_id' => $group->id,
                'academic_year_id' => $group->academic_year_id,
            ],
            [
                'joined_at' => now()->subMonths(3)->toDateString(),
                'left_at' => null,
            ],
        );

        return $student;
    }

    private function warningIndicator(): CharacterIndicator
    {
        return CharacterIndicator::query()->updateOrCreate(
            ['code' => 'dishonesty_warning'],
            [
                'name' => 'Kecenderungan Manipulatif',
                'description' => 'Indikator peringatan jika terdapat pola ketidakjujuran atau pengalihan fakta.',
                'category' => 'moral_reasoning',
                'is_warning_indicator' => true,
                'is_active' => true,
            ],
        );
    }

    private function negativeObservation(
        Student $student,
        User $teacher,
        CharacterIndicator $indicator,
        string $observedAt,
        string $marker,
        string $note,
    ): void {
        $entry = ObservationEntry::query()->updateOrCreate(
            [
                'student_id' => $student->id,
                'general_note' => "{$marker}: Observasi demo untuk memicu early warning pendampingan.",
            ],
            [
                'teacher_id' => $teacher->id,
                'observed_at' => $observedAt,
                'sentiment' => 'negative',
            ],
        );

        ObservationItem::query()->updateOrCreate(
            [
                'observation_entry_id' => $entry->id,
                'character_indicator_id' => $indicator->id,
            ],
            [
                'sentiment' => 'negative',
                'assessment_score' => 20,
                'reward_points' => 0,
                'note' => $note,
            ],
        );
    }
}
