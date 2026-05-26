<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contrats', function (Blueprint $table) {
            $table->id();
            $table->string('numero_contrat', 40)->unique();
            $table->foreignId('reservation_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('employe_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('date_signature')->nullable();
            $table->enum('etat_depart_vehicule', ['excellent', 'bon', 'acceptable', 'mauvais'])->default('bon');
            $table->unsignedInteger('kilometrage_depart')->default(0);
            $table->unsignedTinyInteger('niveau_carburant_depart')->default(100);
            $table->json('photos_depart')->nullable();
            $table->json('accessoires')->nullable();
            $table->text('conditions_particulieres')->nullable();
            $table->decimal('franchise', 10, 2)->default(0);
            $table->enum('assurance_type', ['basique', 'tous_risques', 'premium'])->default('basique');
            $table->text('signature_client')->nullable();
            $table->text('signature_employe')->nullable();
            $table->string('pdf_path')->nullable();
            $table->enum('statut', ['brouillon', 'signe', 'actif', 'termine', 'resilie'])->default('brouillon');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrats');
    }
};
