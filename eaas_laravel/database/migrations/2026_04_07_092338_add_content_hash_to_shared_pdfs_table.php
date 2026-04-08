<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('shared_pdfs', function (Blueprint $table) {
            $table->string('content_hash')->nullable()->after('display_name');
        });
    }

    public function down()
    {
        Schema::table('shared_pdfs', function (Blueprint $table) {
            $table->dropColumn('content_hash');
        });
    }
};
