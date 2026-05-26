<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrat_id')->constrained()->restrictOnDelete();
            $table->foreignId('employe_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('numero_facture', 20)->unique();
            $table->decimal('montant', 10, 2);
            $table->enum('mode', ['carte', 'especes', 'virement', 'cheque']);
            $table->enum('type', ['acompte', 'solde', 'penalite', 'remboursement', 'depot']);
            $table->enum('statut', ['en_attente', 'valide', 'refuse', 'rembourse', 'en_retard'])->default('en_attente');
            $table->string('reference_transaction')->nullable();
            $table->dateTime('date_paiement')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['contrat_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
