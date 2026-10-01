<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AuthController extends Controller
{
    private function otpColumnsExist(): bool
    {
        return Schema::hasColumn('users', 'otp_code') && Schema::hasColumn('users', 'otp_expires_at');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'reader',
            'otp_code' => $otpCode,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($otpCode, $user->name));
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Registrasi berhasil! Silakan cek email untuk kode OTP.',
            'requires_otp' => true,
            'email' => $user->email,
        ], 201);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'otp_code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Email tidak ditemukan.'],
            ]);
        }

        if ($user->email_verified_at) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'message' => 'Akun sudah terverifikasi.',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        if (!$user->otp_code || $user->otp_code !== $request->otp_code) {
            throw ValidationException::withMessages([
                'otp_code' => ['Kode OTP salah.'],
            ]);
        }

        if ($user->otp_expires_at && Carbon::parse($user->otp_expires_at)->isPast()) {
            throw ValidationException::withMessages([
                'otp_code' => ['Kode OTP sudah kedaluwarsa. Silakan minta kode baru.'],
            ]);
        }

        $user->update([
            'email_verified_at' => Carbon::now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email berhasil diverifikasi!',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Email tidak ditemukan.'],
            ]);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Akun sudah terverifikasi.']);
        }

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp_code' => $otpCode,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        try {
            Mail::to($user->email)->send(new OtpMail($otpCode, $user->name));
        } catch (\Exception $e) {
            Log::error('Failed to resend OTP email: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mengirim OTP. Coba lagi nanti.'], 500);
        }

        return response()->json(['message' => 'Kode OTP baru telah dikirim ke email Anda.']);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        // Check if email verified (skip for admin/editor, skip if OTP columns don't exist)
        if ($this->otpColumnsExist() && !$user->email_verified_at && !in_array($user->role, ['admin', 'editor'])) {
            $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $user->update([
                'otp_code' => $otpCode,
                'otp_expires_at' => Carbon::now()->addMinutes(10),
            ]);

            try {
                Mail::to($user->email)->send(new OtpMail($otpCode, $user->name));
            } catch (\Exception $e) {
                Log::error('Failed to send OTP on login: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Email belum terverifikasi. Kode OTP baru telah dikirim.',
                'requires_otp' => true,
                'email' => $user->email,
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Google Sign-In: verify Google ID token and create/login user.
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        // Decode the JWT token from Google (without library - verify signature via Google's tokeninfo)
        $credential = $request->credential;

        // Verify token via Google's tokeninfo endpoint
        $client = new \GuzzleHttp\Client(['timeout' => 10]);
        try {
            $response = $client->get('https://oauth2.googleapis.com/tokeninfo?id_token=' . $credential);
            $payload = json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            Log::error('Google token verification failed: ' . $e->getMessage());
            return response()->json(['message' => 'Token Google tidak valid.'], 401);
        }

        if (empty($payload['email']) || empty($payload['email_verified']) || $payload['email_verified'] !== 'true') {
            return response()->json(['message' => 'Email Google tidak terverifikasi.'], 401);
        }

        // Find or create user
        $user = User::where('email', $payload['email'])->first();

        if (!$user) {
            $user = User::create([
                'name' => $payload['name'] ?? $payload['email'],
                'email' => $payload['email'],
                'password' => Hash::make(bin2hex(random_bytes(16))), // Random password
                'role' => 'reader',
                'email_verified_at' => now(),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'current_password' => 'nullable|required_with:password',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Password saat ini salah.'],
                ]);
            }
            $user->password = $request->password;
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user
        ]);
    }
}
