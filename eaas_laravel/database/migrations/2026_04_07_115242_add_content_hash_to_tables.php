<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (!Schema::hasColumn('documents', 'content_hash')) {
                $table->string('content_hash')->nullable()->after('is_shared');
            }
        });

        Schema::table('shared_pdfs', function (Blueprint $table) {
            if (!Schema::hasColumn('shared_pdfs', 'content_hash')) {
                $table->string('content_hash')->nullable()->after('display_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (Schema::hasColumn('documents', 'content_hash')) {
                $table->dropColumn('content_hash');
            }
        });

        Schema::table('shared_pdfs', function (Blueprint $table) {
            if (Schema::hasColumn('shared_pdfs', 'content_hash')) {
                $table->dropColumn('content_hash');
            }
        });
    }
};