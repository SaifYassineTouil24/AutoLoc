<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrat_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('employe_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('date_retour_effective');
            $table->unsignedInteger('kilometrage_retour');
            $table->unsignedTinyInteger('niveau_carburant_retour')->default(100);
            $table->enum('etat_general', ['excellent', 'bon', 'acceptable', 'mauvais'])->default('bon');
            $table->boolean('dommages_constates')->default(false);
            $table->text('description_dommages')->nullable();
            $table->json('photos_retour')->nullable();
            $table->json('accessoires_manquants')->nullable();
            $table->decimal('penalite_retard', 10, 2)->default(0);
            $table->decimal('penalite_carburant', 10, 2)->default(0);
            $table->decimal('penalite_dommages', 10, 2)->default(0);
            $table->decimal('penalite_accessoires', 10, 2)->default(0);
            $table->decimal('penalite_totale', 10, 2)->default(0);
            $table->decimal('depot_libere', 10, 2)->default(0);
            $table->decimal('depot_retenu', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retours');
    }
};
