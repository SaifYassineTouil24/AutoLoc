<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', [
                'reservation_rappel',
                'maintenance_due',
                'paiement_retard',
                'contrat_expirant',
                'obligation_vehicule',
                'info',
            ])->default('info');
            $table->enum('priorite', ['haute', 'normale', 'basse'])->default('normale');
            $table->string('titre');
            $table->text('message');
            $table->string('lien')->nullable();
            $table->boolean('lu')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'lu', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
