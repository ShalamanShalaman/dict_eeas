<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('office_locations', function (Blueprint $table) {
            $table->time('am_in')->nullable();
            $table->time('am_out')->nullable();
            $table->time('pm_in')->nullable();
            $table->time('pm_out')->nullable();
        });
    }

    public function down()
    {
        Schema::table('office_locations', function (Blueprint $table) {
            $table->dropColumn(['am_in', 'am_out', 'pm_in', 'pm_out']);
        });
    }
};