<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shared_pdfs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_id')->unique();
            $table->unsignedBigInteger('uploader_id')->nullable();
            $table->string('uploader_name')->nullable();
            $table->string('office_name')->nullable();
            $table->string('file_path');
            $table->string('display_name')->nullable();
            $table->timestamps();

            $table->foreign('document_id')->references('id')->on('documents')->onDelete('cascade');
            $table->index('office_name');
        });

        // Backfill existing shared documents so they persist in the new table.
        $existing = DB::table('documents')
            ->leftJoin('users', 'users.id', '=', 'documents.employee_id')
            ->leftJoin('office_locations', 'office_locations.id', '=', 'users.office_location_id')
            ->where('documents.is_shared', true)
            ->select(
                'documents.id as document_id',
                'documents.employee_id as uploader_id',
                'documents.file_path',
                'users.first_name',
                'users.middle_name',
                'users.last_name',
                'office_locations.location as office_name',
                'documents.created_at',
                'documents.updated_at'
            )
            ->get();

        foreach ($existing as $row) {
            $middle = $row->middle_name ? ' ' . $row->middle_name : '';
            $uploaderName = trim(($row->first_name ?? '') . $middle . ' ' . ($row->last_name ?? ''));
            $base = basename($row->file_path ?? '');
            $displayName = preg_replace('/^shared_[^_]+_/', '', $base);
            if (!$displayName) {
                $displayName = $base ?: ('shared_' . $row->document_id . '.pdf');
            }

            DB::table('shared_pdfs')->updateOrInsert(
                ['document_id' => $row->document_id],
                [
                    'uploader_id' => $row->uploader_id,
                    'uploader_name' => $uploaderName ?: null,
                    'office_name' => $row->office_name,
                    'file_path' => $row->file_path,
                    'display_name' => $displayName,
                    'created_at' => $row->created_at,
                    'updated_at' => $row->updated_at,
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_pdfs');
    }
};
