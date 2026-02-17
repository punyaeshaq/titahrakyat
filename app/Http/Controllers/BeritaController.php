<?php

namespace App\Http\Controllers;

use App\Models\Berita;
use Illuminate\Http\Request;

class BeritaController extends Controller
{
    public function index(Request $request)
    {
        $query = Berita::query()->where('status', 'published')->latest();

        if ($request->has('kategori') && $request->kategori) {
            $kategori = str_replace('-', ' ', $request->kategori);
            $query->whereRaw('LOWER(kategori) = ?', [strtolower($kategori)]);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('konten', 'like', "%{$search}%");
            });
        }

        $berita = $query->paginate(12);
        $currentKategori = $request->kategori;

        return view('berita.index', compact('berita', 'currentKategori'));
    }

    public function show($slug)
    {
        $berita = Berita::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $berita->increment('views');

        $related = Berita::where('kategori', $berita->kategori)
            ->where('id', '!=', $berita->id)
            ->where('status', 'published')
            ->latest()
            ->limit(4)
            ->get();

        return view('berita.show', compact('berita', 'related'));
    }
}
