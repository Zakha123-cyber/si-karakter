# Database Design

Dokumen ini adalah rancangan konseptual awal. Nama kolom dapat disesuaikan saat migration dibuat, tetapi relasi dan pemisahan tanggung jawab harus dipertahankan.

## Core Tables

### users

- id
- name
- username
- email nullable
- password
- pin_enabled
- role: admin, teacher, student
- is_active
- last_login_at
- timestamps

### academic_years

- id
- name
- start_date
- end_date
- is_active
- timestamps

### groups

- id
- academic_year_id
- name
- description nullable
- teacher_id nullable
- is_active
- timestamps

### students

- id
- user_id
- student_code
- birth_date nullable
- gender nullable
- current_group_id nullable
- enrollment_date nullable
- status
- timestamps

### group_student_histories

- id
- student_id
- group_id
- academic_year_id
- joined_at
- left_at nullable
- timestamps

## Test Management

### test_packages

- id
- title
- slug
- description
- start_at nullable
- end_at nullable
- attempt_limit
- status: draft, published, closed
- created_by
- timestamps

### test_package_groups

- id
- test_package_id
- group_id
- timestamps

### moral_cases

- id
- title
- story
- image_path nullable
- audio_path nullable
- sort_order
- is_active
- created_by
- timestamps

### test_package_cases

- id
- test_package_id
- moral_case_id
- sort_order
- timestamps

### moral_case_options

- id
- moral_case_id
- label
- text
- internal_value nullable
- sort_order
- is_active
- timestamps

### character_indicators

- id
- code
- name
- description
- category
- is_warning_indicator
- is_active
- timestamps

### moral_case_indicators

- id
- moral_case_id
- character_indicator_id
- weight
- timestamps

## Test Execution

### test_attempts

- id
- test_package_id
- student_id
- attempt_number
- status: in_progress, submitted, processing, review_pending, completed
- started_at
- submitted_at nullable
- completed_at nullable
- timestamps

### test_answers

- id
- test_attempt_id
- moral_case_id
- selected_option_id nullable
- typed_reason nullable
- final_transcript nullable
- answer_status
- timestamps

### answer_audio_files

- id
- test_answer_id
- file_path
- original_name
- mime_type
- file_size
- duration_seconds nullable
- checksum nullable
- timestamps

### transcriptions

- id
- test_answer_id
- provider
- model
- original_text nullable
- edited_text nullable
- language nullable
- confidence nullable
- status
- error_message nullable
- raw_response_json nullable
- processed_at nullable
- timestamps

### ai_assessments

- id
- test_answer_id
- provider
- model
- moral_level
- confidence
- reasoning_summary
- suggested_intervention nullable
- warning_signals_json nullable
- indicators_json nullable
- prompt_version
- raw_response_json
- status
- error_message nullable
- processed_at nullable
- timestamps

### teacher_validations

- id
- test_answer_id
- ai_assessment_id nullable
- teacher_id
- decision: approved, overridden
- final_moral_level
- final_indicators_json
- teacher_note nullable
- override_reason nullable
- validated_at
- timestamps

## Observation

### observation_entries

- id
- student_id
- teacher_id
- observed_at
- general_note nullable
- timestamps

### observation_items

- id
- observation_entry_id
- character_indicator_id
- sentiment: positive, negative, neutral
- assessment_score nullable
- reward_points default 0
- note nullable
- timestamps

## Scoring

### scoring_configurations

- id
- name
- test_weight
- observation_weight
- is_active
- effective_from
- effective_until nullable
- created_by
- timestamps

### character_score_snapshots

- id
- student_id
- period_start
- period_end
- test_score
- observation_score
- calculated_score
- manual_adjustment nullable
- final_score
- final_level nullable
- adjusted_by nullable
- adjustment_reason nullable
- calculation_detail_json
- timestamps

## Early Warning

### warning_rules

- id
- name
- description
- rule_type
- conditions_json
- severity
- is_active
- timestamps

### student_warnings

- id
- student_id
- warning_rule_id
- source_type
- source_id nullable
- title
- description
- severity
- status: open, reviewed, resolved
- detected_at
- reviewed_by nullable
- reviewed_at nullable
- resolution_note nullable
- timestamps

## Gamification

### goodness_point_transactions

- id
- student_id
- source_type
- source_id nullable
- points
- description
- awarded_by nullable
- created_at

### goodness_tree_levels

- id
- level
- name
- minimum_points
- asset_path
- description nullable
- timestamps

## Educational Content

### educational_contents

- id
- title
- slug
- content_type: video, comic, audio, story
- description
- content_body nullable
- media_path nullable
- thumbnail_path nullable
- duration_seconds nullable
- status
- created_by
- timestamps

### educational_content_indicators

- id
- educational_content_id
- character_indicator_id
- timestamps

### content_interactions

- id
- student_id
- educational_content_id
- emotion_response nullable
- started_at nullable
- completed_at nullable
- timestamps

## Assertiveness Simulation

### simulation_scenarios

- id
- title
- description
- opening_text
- audio_path nullable
- image_path nullable
- status
- created_by
- timestamps

### simulation_options

- id
- simulation_scenario_id
- text
- feedback_text
- score
- reward_points
- sort_order
- timestamps

### simulation_attempts

- id
- student_id
- simulation_scenario_id
- selected_option_id
- score
- reward_points
- completed_at
- timestamps

## Reports and Audit

### character_reports

- id
- student_id
- period_start
- period_end
- status: draft, reviewed, published
- test_summary_json
- observation_summary_json
- ai_generated_narrative nullable
- final_narrative
- recommendation
- teacher_id
- pdf_path nullable
- published_at nullable
- timestamps

### audit_logs

- id
- user_id nullable
- action
- auditable_type nullable
- auditable_id nullable
- old_values_json nullable
- new_values_json nullable
- ip_address nullable
- user_agent nullable
- created_at

## Important Constraints

- Username harus unik.
- student_code harus unik.
- Satu attempt memiliki nomor unik per santri dan paket.
- Satu jawaban hanya untuk satu kasus dalam attempt.
- Semua foreign key penting menggunakan index.
- Soft delete dapat diterapkan pada entitas master yang tidak boleh hilang dari histori.
