<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AcademicYear;
use App\Models\AiAssessment;
use App\Models\AnswerAudioFile;
use App\Models\CharacterIndicator;
use App\Models\Group;
use App\Models\GroupStudentHistory;
use App\Models\MoralCase;
use App\Models\MoralCaseOption;
use App\Models\Student;
use App\Models\TeacherValidation;
use App\Models\TestAnswer;
use App\Models\TestAttempt;
use App\Models\TestPackage;
use App\Models\Transcription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TestReviewSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::query()->where('role', UserRole::Teacher)->first()
            ?? User::query()->create([
                'name' => 'Ustadz Demo',
                'username' => 'ustadz',
                'email' => 'ustadz@example.com',
                'password' => bcrypt('password'),
                'role' => UserRole::Teacher,
                'is_active' => true,
            ]);

        $academicYear = AcademicYear::query()->where('is_active', true)->first()
            ?? AcademicYear::query()->create([
                'name' => '2025/2026 Ganjil',
                'is_active' => true,
                'start_date' => '2025-07-01',
                'end_date' => '2025-12-31',
            ]);

        $group = Group::query()->where('teacher_id', $teacher->id)->first()
            ?? Group::query()->create([
                'name' => 'Kelompok Abu Bakar',
                'academic_year_id' => $academicYear->id,
                'teacher_id' => $teacher->id,
                'is_active' => true,
            ]);

        $students = [];
        $names = ['Ahmad Fauzi', 'Budi Santoso', 'Cici Paramida'];
        foreach ($names as $idx => $name) {
            $sUser = User::query()->create([
                'name' => $name,
                'username' => 'santri_'.($idx + 1),
                'email' => 'santri'.($idx + 1).'@example.com',
                'password' => bcrypt('password'),
                'role' => UserRole::Student,
                'is_active' => true,
            ]);

            $student = Student::query()->create([
                'user_id' => $sUser->id,
                'student_code' => 'STU-00'.($idx + 1),
                'gender' => $idx === 2 ? 'F' : 'M',
                'birth_date' => '2017-05-12',
                'current_group_id' => $group->id,
                'status' => 'active',
            ]);

            GroupStudentHistory::query()->create([
                'student_id' => $student->id,
                'group_id' => $group->id,
                'academic_year_id' => $academicYear->id,
                'joined_at' => now()->subMonths(2)->toDateString(),
            ]);

            $students[] = $student;
        }

        $indicator = CharacterIndicator::query()->first()
            ?? CharacterIndicator::query()->create([
                'code' => 'IND-001',
                'name' => 'Kejujuran',
                'domain' => 'Moral',
                'description' => 'Sikap berkata dan bertindak jujur.',
            ]);

        $moralCase = MoralCase::query()->create([
            'title' => 'Dilema Mengembalikan Uang Teman',
            'story' => 'Ahmad menemukan dompet berisi uang Rp 50.000 milik Hasan di kantin sekolah. Hasan tidak melihat dompetnya jatuh, tetapi Ahmad tahu dompet itu milik Hasan. Apa yang sebaiknya dilakukan Ahmad?',
            'is_active' => true,
            'created_by' => $teacher->id,
        ]);

        $optionA = MoralCaseOption::query()->create([
            'moral_case_id' => $moralCase->id,
            'label' => 'A',
            'text' => 'Langsung mengembalikan dompet kepada Hasan.',
            'internal_value' => 'level_3',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $optionB = MoralCaseOption::query()->create([
            'moral_case_id' => $moralCase->id,
            'label' => 'B',
            'text' => 'Menyimpan dompetnya karena tidak ada yang melihat.',
            'internal_value' => 'level_1',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $testPackage = TestPackage::query()->create([
            'title' => 'Asesmen Karakter Kejujuran & Tanggung Jawab',
            'slug' => Str::slug('Asesmen Karakter Kejujuran '.Str::random(5)),
            'description' => 'Paket tes untuk mengukur tingkat penalaran moral santri usia 7-10 tahun.',
            'status' => 'published',
            'created_by' => $teacher->id,
        ]);
        $testPackage->groups()->attach($group->id);
        $testPackage->cases()->attach($moralCase->id, ['sort_order' => 1]);

        // Scenario 1: Pending Review Item (Santri 1)
        $attempt1 = TestAttempt::query()->create([
            'test_package_id' => $testPackage->id,
            'student_id' => $students[0]->id,
            'attempt_number' => 1,
            'status' => 'submitted',
            'started_at' => now()->subHours(3),
            'submitted_at' => now()->subHours(2),
            'completed_at' => now()->subHours(2),
        ]);

        $answer1 = TestAnswer::query()->create([
            'test_attempt_id' => $attempt1->id,
            'moral_case_id' => $moralCase->id,
            'selected_option_id' => $optionA->id,
            'typed_reason' => 'Karena itu bukan milik Ahmad, dan Hasan pasti sedih kalau uangnya hilang.',
            'final_transcript' => 'Saya akan mengembalikan dompetnya langsung ke Hasan karena berbohong dan mengambil barang orang lain itu tidak boleh.',
            'answer_status' => 'submitted',
        ]);

        AnswerAudioFile::query()->create([
            'test_answer_id' => $answer1->id,
            'file_path' => 'audio/demo_answer_1.mp3',
            'original_name' => 'rekaman_santri_1.mp3',
            'mime_type' => 'audio/mpeg',
            'file_size' => 245000,
            'duration_seconds' => 15,
        ]);

        Transcription::query()->create([
            'test_answer_id' => $answer1->id,
            'provider' => 'whisper',
            'model' => 'whisper-1',
            'original_text' => 'Saya akan mengembalikan dompetnya langsung ke Hasan karena berbohong dan mengambil barang orang lain itu tidak boleh.',
            'edited_text' => null,
            'confidence' => 0.9450,
            'status' => 'completed',
            'processed_at' => now()->subHours(2),
        ]);

        AiAssessment::query()->create([
            'test_answer_id' => $answer1->id,
            'provider' => 'google_gemini',
            'model' => 'gemini-3.1-flash-lite',
            'moral_level' => 'Tahap 3: Orientasi Anak Manis',
            'confidence' => 0.9100,
            'reasoning_summary' => 'Santri menunjukkan empati dan kesadaran akan aturan norma kejujuran.',
            'suggested_intervention' => 'Berikan penguatan positif terhadap sikap jujur santri.',
            'warning_signals_json' => [],
            'indicators_json' => [
                ['indicator_id' => $indicator->id, 'indicator_name' => $indicator->name, 'score' => 4],
            ],
            'prompt_version' => 'v1.0',
            'raw_response_json' => ['status' => 'success'],
            'status' => 'completed',
            'processed_at' => now()->subHours(2),
        ]);

        // Scenario 2: Approved Item (Santri 2)
        $attempt2 = TestAttempt::query()->create([
            'test_package_id' => $testPackage->id,
            'student_id' => $students[1]->id,
            'attempt_number' => 1,
            'status' => 'submitted',
            'started_at' => now()->subDays(1),
            'submitted_at' => now()->subDays(1),
            'completed_at' => now()->subDays(1),
        ]);

        $answer2 = TestAnswer::query()->create([
            'test_attempt_id' => $attempt2->id,
            'moral_case_id' => $moralCase->id,
            'selected_option_id' => $optionA->id,
            'typed_reason' => 'Mengembalikan dompet ke Hasan.',
            'final_transcript' => 'Saya kembalikan dompetnya.',
            'answer_status' => 'submitted',
        ]);

        $aiAssessment2 = AiAssessment::query()->create([
            'test_answer_id' => $answer2->id,
            'provider' => 'google_gemini',
            'model' => 'gemini-3.1-flash-lite',
            'moral_level' => 'Tahap 3: Orientasi Anak Manis',
            'confidence' => 0.8800,
            'reasoning_summary' => 'Santri memilih jawaban yang sesuai norma kebaikan.',
            'prompt_version' => 'v1.0',
            'raw_response_json' => ['status' => 'success'],
            'status' => 'completed',
            'processed_at' => now()->subDays(1),
        ]);

        TeacherValidation::query()->create([
            'test_answer_id' => $answer2->id,
            'ai_assessment_id' => $aiAssessment2->id,
            'teacher_id' => $teacher->id,
            'decision' => 'approved',
            'final_moral_level' => 'Tahap 3: Orientasi Anak Manis',
            'final_indicators_json' => [
                ['indicator_id' => $indicator->id, 'indicator_name' => $indicator->name, 'score' => 4],
            ],
            'teacher_note' => 'Disetujui. Jawaban santri konsisten dengan observasi harian.',
            'override_reason' => null,
            'validated_at' => now()->subHours(5),
        ]);
    }
}
