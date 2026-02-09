<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\BreakingNewsController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\VideoController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\EditorialStaffController;
use App\Http\Controllers\Api\SocialLinkController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public content routes
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/articles/{id}/comments', [CommentController::class, 'index']);
Route::post('/articles/{id}/comments', [CommentController::class, 'store']);
Route::get('/breaking-news', [BreakingNewsController::class, 'index']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/settings/editorial-staff', [SettingController::class, 'editorialStaff']);
Route::get('/settings/social-links', [SettingController::class, 'socialLinks']);
Route::get('/videos', [VideoController::class, 'index']);
Route::get('/videos/{id}', [VideoController::class, 'show']);
Route::get('/editorial-staff', [EditorialStaffController::class, 'index']);
Route::get('/social-links', [SocialLinkController::class, 'index']);

// Protected routes (require authentication)
// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth - accessible by all logged in users
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Content Management (Admin & Editor)
    Route::middleware('role:admin,editor')->group(function () {
        // Article management
        Route::get('/admin/articles', [ArticleController::class, 'index']);
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::put('/articles/{id}', [ArticleController::class, 'update']);
        Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);

        // Category management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Comment management
        Route::get('/admin/comments', [CommentController::class, 'adminIndex']);
        Route::post('/comments/{id}/approve', [CommentController::class, 'approve']);
        Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

        // Breaking news management
        Route::post('/breaking-news', [BreakingNewsController::class, 'store']);
        Route::put('/breaking-news/{id}', [BreakingNewsController::class, 'update']);
        Route::delete('/breaking-news/{id}', [BreakingNewsController::class, 'destroy']);

        // Editorial Staff management
        Route::post('/editorial-staff', [EditorialStaffController::class, 'store']);
        Route::put('/editorial-staff/{id}', [EditorialStaffController::class, 'update']);
        Route::delete('/editorial-staff/{id}', [EditorialStaffController::class, 'destroy']);

        // Social Links management
        Route::post('/social-links', [SocialLinkController::class, 'store']);
        Route::put('/social-links/{id}', [SocialLinkController::class, 'update']);
        Route::delete('/social-links/{id}', [SocialLinkController::class, 'destroy']);

        // Video management
        Route::post('/videos', [VideoController::class, 'store']);
        Route::put('/videos/{id}', [VideoController::class, 'update']);
        Route::delete('/videos/{id}', [VideoController::class, 'destroy']);

        // File upload
        Route::post('/upload', [UploadController::class, 'store']);

        // Site Settings management (accessible by both Admin and Editor)
        Route::put('/settings', [SettingController::class, 'update']);
    });

    // Admin-only routes
    Route::middleware('role:admin')->group(function () {
        // User management
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::post('/admin/users', [UserController::class, 'store']);
        Route::put('/admin/users/{id}/role', [UserController::class, 'updateRole']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);

        // Activity Logs
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });
});


