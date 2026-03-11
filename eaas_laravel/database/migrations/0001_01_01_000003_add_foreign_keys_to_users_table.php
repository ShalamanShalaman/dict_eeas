<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('office_location_id')->references('id')->on('office_locations')->nullOnDelete();
            $table->foreign('position_id')->references('id')->on('positions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['office_location_id']);
            $table->dropForeign(['position_id']);
        });
    }
};