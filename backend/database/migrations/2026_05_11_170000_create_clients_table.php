<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('numero_cni', 50)->unique()->nullable();
            $table->string('numero_permis', 50)->unique()->nullable();
            $table->date('date_naissance')->nullable();
            $table->text('adresse')->nullable();
            $table->string('ville', 100)->nullable();
            $table->string('code_postal', 10)->nullable();
            $table->string('telephone', 20)->nullable();
            $table->string('photo_cni')->nullable();
            $table->string('photo_permis')->nullable();
            $table->unsignedTinyInteger('score_fiabilite')->default(50);
            $table->enum('segment', ['vip', 'standard', 'risque'])->default('standard');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
