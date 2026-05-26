<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicule_id')->constrained('vehicules')->restrictOnDelete();
            $table->enum('type', ['vidange', 'visite_technique', 'vignette', 'pneus', 'freins', 'revision', 'autre']);
            $table->string('sous_type', 100)->nullable();
            $table->text('description')->nullable();
            $table->date('date_prevue')->nullable();
            $table->date('date_effective')->nullable();
            $table->unsignedInteger('kilometrage_reference')->nullable();
            $table->unsignedInteger('kilometrage_effectif')->nullable();
            $table->string('prestataire')->nullable();
            $table->decimal('cout', 10, 2)->nullable();
            $table->unsignedSmallInteger('duree_immobilisation_jours')->default(0);
            $table->enum('statut', ['planifiee', 'en_cours', 'terminee', 'annulee'])->default('planifiee');
            $table->string('justificatif')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['vehicule_id', 'type', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
