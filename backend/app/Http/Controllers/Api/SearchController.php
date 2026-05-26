<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Contrat;
use App\Models\Reservation;
use App\Models\Vehicule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim($request->get('q', ''));

        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $like = '%' . $q . '%';
        $isClient = auth()->user()->isClient();
        $clientId = auth()->user()->client?->id;

        $results = [];

        // Véhicules (staff only)
        if (!$isClient) {
            $vehicules = Vehicule::where('immatriculation', 'ilike', $like)
                ->orWhere('marque', 'ilike', $like)
                ->orWhere('modele', 'ilike', $like)
                ->limit(4)->get(['id', 'marque', 'modele', 'immatriculation', 'categorie', 'statut']);

            foreach ($vehicules as $v) {
                $results[] = [
                    'type'     => 'vehicule',
                    'label'    => "{$v->marque} {$v->modele}",
                    'sublabel' => $v->immatriculation,
                    'badge'    => $v->categorie,
                    'url'      => '/vehicules?open=' . $v->id,
                    'id'       => $v->id,
                ];
            }
        }

        // Clients (staff only)
        if (!$isClient) {
            $clients = Client::whereHas('user', fn ($uq) =>
                $uq->where('name', 'ilike', $like)
                   ->orWhere('prenom', 'ilike', $like)
                   ->orWhere('email', 'ilike', $like)
            )->orWhere('numero_cni', 'ilike', $like)
             ->orWhere('telephone', 'ilike', $like)
             ->with('user:id,name,prenom,email')
             ->limit(4)->get();

            foreach ($clients as $c) {
                $results[] = [
                    'type'     => 'client',
                    'label'    => "{$c->user->prenom} {$c->user->name}",
                    'sublabel' => $c->user->email,
                    'badge'    => $c->segment,
                    'url'      => '/clients?open=' . $c->id,
                    'id'       => $c->id,
                ];
            }
        }

        // Réservations
        $resQuery = Reservation::where('numero_reservation', 'ilike', $like)
            ->with(['client.user:id,name,prenom', 'vehicule:id,marque,modele'])
            ->limit(4);

        if ($isClient) $resQuery->where('client_id', $clientId);

        foreach ($resQuery->get() as $r) {
            $results[] = [
                'type'     => 'reservation',
                'label'    => $r->numero_reservation,
                'sublabel' => "{$r->vehicule->marque} {$r->vehicule->modele} · {$r->client->user->prenom} {$r->client->user->name}",
                'badge'    => $r->statut,
                'url'      => '/reservations?open=' . $r->id,
                'id'       => $r->id,
            ];
        }

        // Contrats
        $ctQuery = Contrat::where('numero_contrat', 'ilike', $like)
            ->with(['reservation.client.user:id,name,prenom', 'reservation.vehicule:id,marque,modele'])
            ->limit(4);

        if ($isClient) {
            $ctQuery->whereHas('reservation', fn ($q) => $q->where('client_id', $clientId));
        }

        foreach ($ctQuery->get() as $c) {
            $results[] = [
                'type'     => 'contrat',
                'label'    => $c->numero_contrat,
                'sublabel' => "{$c->reservation->vehicule->marque} {$c->reservation->vehicule->modele}",
                'badge'    => $c->statut,
                'url'      => '/contrats?open=' . $c->id,
                'id'       => $c->id,
            ];
        }

        return response()->json(['results' => $results]);
    }
}
