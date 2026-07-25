<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\TestPackageStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\TestPackages\AssignTestPackageCasesRequest;
use App\Http\Requests\Teacher\TestPackages\AssignTestPackageGroupsRequest;
use App\Http\Requests\Teacher\TestPackages\StoreTestPackageRequest;
use App\Http\Requests\Teacher\TestPackages\UpdateTestPackageRequest;
use App\Models\Group;
use App\Models\MoralCase;
use App\Models\TestPackage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TestPackageController extends Controller
{
    public function index(Request $request): Response
    {
        $packages = TestPackage::query()
            ->with([
                'groups:id,name',
                'cases' => fn ($query) => $query
                    ->select('moral_cases.id', 'moral_cases.title')
                    ->orderBy('test_package_cases.sort_order'),
            ])
            ->withCount(['groups', 'cases'])
            ->when($request->string('search')->toString() !== '', function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString() !== '', fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (TestPackage $package) => $this->packagePayload($package));

        return Inertia::render('teacher/test-packages/index', [
            'packages' => $packages,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statuses' => TestPackageStatus::values(),
            'groups' => Group::query()
                ->select(['id', 'name'])
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'moralCases' => MoralCase::query()
                ->select(['id', 'title'])
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('title')
                ->get(),
        ]);
    }

    public function store(StoreTestPackageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        TestPackage::query()->create([
            ...$data,
            'slug' => $this->uniqueSlug($data['title']),
            'status' => TestPackageStatus::Draft,
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('status', 'Paket tes berhasil dibuat.');
    }

    public function update(UpdateTestPackageRequest $request, TestPackage $testPackage): RedirectResponse
    {
        if ($testPackage->status === TestPackageStatus::Closed) {
            return back()->withErrors([
                'package' => 'Paket yang sudah ditutup tidak dapat diperbarui.',
            ]);
        }

        $data = $request->validated();

        $testPackage->forceFill([
            ...$data,
            'slug' => $this->uniqueSlug($data['title'], $testPackage->id),
        ])->save();

        return back()->with('status', 'Paket tes berhasil diperbarui.');
    }

    public function destroy(TestPackage $testPackage): RedirectResponse
    {
        if ($testPackage->status !== TestPackageStatus::Draft) {
            return back()->withErrors([
                'package' => 'Hanya paket draft yang dapat dihapus.',
            ]);
        }

        $testPackage->delete();

        return back()->with('status', 'Paket tes berhasil dihapus.');
    }

    public function assignGroups(AssignTestPackageGroupsRequest $request, TestPackage $testPackage): RedirectResponse
    {
        if ($testPackage->status === TestPackageStatus::Closed) {
            return back()->withErrors([
                'groups' => 'Paket yang sudah ditutup tidak dapat diubah target kelompoknya.',
            ]);
        }

        $testPackage->groups()->sync($request->input('group_ids', []));

        return back()->with('status', 'Target kelompok paket berhasil diperbarui.');
    }

    public function assignCases(AssignTestPackageCasesRequest $request, TestPackage $testPackage): RedirectResponse
    {
        if ($testPackage->status === TestPackageStatus::Closed) {
            return back()->withErrors([
                'cases' => 'Paket yang sudah ditutup tidak dapat diubah daftar kasusnya.',
            ]);
        }

        DB::transaction(function () use ($request, $testPackage) {
            $sync = collect($request->input('case_ids', []))
                ->values()
                ->mapWithKeys(fn ($caseId, int $index) => [
                    (int) $caseId => ['sort_order' => $index + 1],
                ])
                ->all();

            $testPackage->cases()->sync($sync);
        });

        return back()->with('status', 'Daftar kasus paket berhasil diperbarui.');
    }

    public function publish(TestPackage $testPackage): RedirectResponse
    {
        $errors = $this->publishErrors($testPackage);

        if ($errors !== []) {
            return back()->withErrors(['publish' => implode(' ', $errors)]);
        }

        $testPackage->forceFill([
            'status' => TestPackageStatus::Published,
        ])->save();

        return back()->with('status', 'Paket tes berhasil dipublikasikan.');
    }

    public function close(TestPackage $testPackage): RedirectResponse
    {
        if ($testPackage->status === TestPackageStatus::Draft) {
            return back()->withErrors([
                'close' => 'Paket draft belum perlu ditutup.',
            ]);
        }

        $testPackage->forceFill([
            'status' => TestPackageStatus::Closed,
        ])->save();

        return back()->with('status', 'Paket tes berhasil ditutup.');
    }

    /**
     * @return array<string, mixed>
     */
    private function packagePayload(TestPackage $package): array
    {
        return [
            'id' => $package->id,
            'title' => $package->title,
            'slug' => $package->slug,
            'description' => $package->description,
            'start_at' => $package->start_at?->toISOString(),
            'end_at' => $package->end_at?->toISOString(),
            'attempt_limit' => $package->attempt_limit,
            'status' => $package->status->value,
            'groups_count' => $package->groups_count,
            'cases_count' => $package->cases_count,
            'group_ids' => $package->groups->pluck('id')->values(),
            'case_ids' => $package->cases->pluck('id')->values(),
            'groups' => $package->groups->map(fn (Group $group) => [
                'id' => $group->id,
                'name' => $group->name,
            ])->values(),
            'cases' => $package->cases->map(fn (MoralCase $case) => [
                'id' => $case->id,
                'title' => $case->title,
                'sort_order' => $case->pivot->sort_order,
            ])->values(),
            'created_at' => $package->created_at?->toISOString(),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function publishErrors(TestPackage $testPackage): array
    {
        $testPackage->loadCount(['groups', 'cases']);

        $errors = [];

        if ($testPackage->status === TestPackageStatus::Closed) {
            $errors[] = 'Paket yang sudah ditutup tidak dapat dipublikasikan ulang.';
        }

        if ($testPackage->start_at !== null && $testPackage->end_at !== null && $testPackage->start_at->gt($testPackage->end_at)) {
            $errors[] = 'Tanggal mulai tidak boleh melewati tanggal selesai.';
        }

        if ($testPackage->end_at !== null && $testPackage->end_at->isPast()) {
            $errors[] = 'Periode aktif paket sudah berakhir.';
        }

        if ($testPackage->groups_count < 1) {
            $errors[] = 'Pilih minimal satu target kelompok.';
        }

        if ($testPackage->cases_count < 1) {
            $errors[] = 'Tambahkan minimal satu kasus ke paket.';
        }

        return $errors;
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'paket-tes';
        $slug = $base;
        $counter = 2;

        while (
            TestPackage::query()
                ->where('slug', $slug)
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
