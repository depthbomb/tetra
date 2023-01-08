<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('clicks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('link_id')->constrained();
            $table->string('identifier', 32);
            $table->string('platform');
            $table->string('country')->default('Unknown');
            $table->string('referrer')->default('None');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('clicks');
    }
};
