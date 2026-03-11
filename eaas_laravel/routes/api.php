<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\AttendanceController;

Route::post('/login', [AuthController::class, 'login']);

Route::prefix('admin')->group(function () {
    Route::get('/logs', [AdminController::class, 'getActivityLogs']);
    
    Route::get('/positions', [AdminController::class, 'getPositions']);
    Route::post('/create-position', [AdminController::class, 'createPosition']);
    Route::put('/edit-position/{pos_id}', [AdminController::class, 'editPosition']);
    Route::delete('/delete-position/{pos_id}', [AdminController::class, 'deletePosition']);
    
    Route::get('/locations', [AdminController::class, 'getLocations']);
    Route::post('/create-location', [AdminController::class, 'createLocation']);
    Route::put('/edit-location/{loc_id}', [AdminController::class, 'editLocation']);
    Route::delete('/delete-location/{loc_id}', [AdminController::class, 'deleteLocation']);
    
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::post('/create-user', [AdminController::class, 'createUser']);
    Route::put('/edit-user/{public_id}', [AdminController::class, 'editUser']);
    Route::delete('/delete-user/{public_id}', [AdminController::class, 'deleteUser']);
});

Route::prefix('profile')->group(function () {
    Route::post('/send-otp', [ProfileController::class, 'sendOtp']);
    Route::post('/verify-otp', [ProfileController::class, 'verifyOtp']);
    Route::get('/{public_id}', [ProfileController::class, 'getProfile']);
    Route::put('/{public_id}', [ProfileController::class, 'editOwnProfile']);
    Route::post('/{public_id}/upload-picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::get('/{public_id}/picture', [ProfileController::class, 'getProfilePicture']);
    Route::delete('/{public_id}/picture', [ProfileController::class, 'deleteProfilePicture']);
});

Route::prefix('document')->group(function () {
    Route::post('/upload', [DocumentController::class, 'uploadDocument']);
    Route::post('/autosave/{doc_id}', [DocumentController::class, 'autosaveDocument']);
    Route::post('/submit/{doc_id}', [DocumentController::class, 'submitDocument']);
    Route::post('/review/{doc_id}', [DocumentController::class, 'reviewDocument']);
    Route::get('/content/{doc_id}', [DocumentController::class, 'getDocumentContent']);
    Route::get('/download/{doc_id}', [DocumentController::class, 'downloadDocument']);
    Route::get('/view/{doc_id}', [DocumentController::class, 'viewDocument']);
    Route::delete('/{doc_id}', [DocumentController::class, 'deleteDocument']);
    Route::get('/user/{user_id}', [DocumentController::class, 'getUserDocuments']);
    Route::get('/reviewer/{reviewer_id}', [DocumentController::class, 'getReviewerDocuments']);
    Route::get('/reviewer-archive/{reviewer_id}', [DocumentController::class, 'getReviewerArchive']);
    Route::get('/reviewers', [DocumentController::class, 'getReviewers']);
    Route::post('/upload-review/{doc_id}', [DocumentController::class, 'uploadReviewDocument']);
    Route::get('/notifications/{user_id}', [DocumentController::class, 'getNotifications']);
    Route::post('/notifications/mark-read/{user_id}', [DocumentController::class, 'markNotificationsRead']);
    Route::delete('/notifications/{user_id}/clear', [DocumentController::class, 'clearNotifications']);
    Route::post('/upload-attachments', [DocumentController::class, 'uploadAttachments']);
    Route::post('/rename/{doc_id}', [DocumentController::class, 'renameDocument']);
});

Route::post('/upload-attendance', [AttendanceController::class, 'uploadAttendance']);
Route::post('/download-dtr', [AttendanceController::class, 'downloadDtr']);
Route::post('/generate-ar', [AttendanceController::class, 'generateAr']);
Route::post('/generate-dtr-adjustment', [AttendanceController::class, 'generateDtrAdjustment']);
Route::post('/download-dtr-pdf', [AttendanceController::class, 'downloadDtrPdf']);
Route::post('/generate-ar-pdf', [AttendanceController::class, 'generateArPdf']);
Route::post('/generate-pdf', [AttendanceController::class, 'generatePdf']);