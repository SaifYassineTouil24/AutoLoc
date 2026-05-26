<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reclamations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reservation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['facturation', 'vehicule', 'service', 'retard', 'autre'])->default('autre');
            $table->enum('priorite', ['haute', 'normale', 'basse'])->default('normale');
            $table->string('titre');
            $table->text('description');
            $table->enum('statut', ['ouverte', 'en_traitement', 'resolue', 'fermee'])->default('ouverte');
            $table->text('reponse')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['client_id', 'statut']);
            $table->index(['statut', 'priorite', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reclamations');
    }
};
