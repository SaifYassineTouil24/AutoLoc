<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('numero_reservation', 30)->unique();
            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->foreignId('vehicule_id')->constrained('vehicules')->restrictOnDelete();
            $table->foreignId('employe_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->string('lieu_prise_en_charge')->nullable();
            $table->string('lieu_retour')->nullable();
            $table->enum('statut', ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee'])->default('en_attente');
            $table->decimal('prix_base', 10, 2);
            $table->decimal('prix_total', 10, 2);
            $table->decimal('remise', 10, 2)->default(0);
            $table->decimal('coefficient_tarification', 6, 4)->default(1.0000);
            $table->enum('mode_paiement', ['carte', 'especes', 'virement', 'cheque'])->nullable();
            $table->enum('source', ['web', 'agence', 'telephone'])->default('agence');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['vehicule_id', 'date_debut', 'date_fin']);
            $table->index(['client_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
