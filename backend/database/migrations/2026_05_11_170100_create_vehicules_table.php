<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
            $table->string('immatriculation', 20)->unique();
            $table->string('marque', 50);
            $table->string('modele', 100);
            $table->unsignedSmallInteger('annee');
            $table->string('couleur', 50)->nullable();
            $table->enum('categorie', ['economique', 'compacte', 'berline', 'suv', 'utilitaire', 'luxe', 'cabriolet'])->default('compacte');
            $table->unsignedInteger('kilometrage')->default(0);
            $table->enum('statut', ['disponible', 'loue', 'en_maintenance', 'hors_service'])->default('disponible');
            $table->decimal('tarif_journalier', 10, 2);
            $table->decimal('depot_garantie', 10, 2)->default(0);
            $table->unsignedTinyInteger('niveau_carburant')->default(100);
            $table->unsignedTinyInteger('nombre_places')->default(5);
            $table->enum('boite_vitesse', ['manuelle', 'automatique'])->default('manuelle');
            $table->string('photo_principale')->nullable();
            $table->json('photos')->nullable();
            $table->text('description')->nullable();
            // Documents
            $table->date('date_carte_grise')->nullable();
            $table->date('date_assurance')->nullable();
            // Vidange
            $table->date('derniere_vidange_date')->nullable();
            $table->unsignedInteger('derniere_vidange_km')->nullable();
            $table->unsignedInteger('prochaine_vidange_km')->nullable();
            $table->date('prochaine_vidange_date')->nullable();
            // Visite technique
            $table->date('derniere_visite_technique_date')->nullable();
            $table->date('prochaine_visite_technique_date')->nullable();
            $table->string('visite_technique_justificatif')->nullable();
            // Vignette (TSAVM)
            $table->unsignedSmallInteger('vignette_annee')->nullable();
            $table->boolean('vignette_payee')->default(false);
            $table->date('vignette_date_paiement')->nullable();
            $table->string('vignette_justificatif')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicules');
    }
};
