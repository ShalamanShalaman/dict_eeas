<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Process;
use App\Helpers\LogHelper;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class AttendanceController extends Controller
{
    private function runPythonScript($action, $data)
    {
        $pythonFolderNames = ['eaas_python', 'dict_python', 'python'];
        $workingDir = false;

        $searchBases = [
            base_path('..'),
            base_path(),
        ];

        foreach ($searchBases as $base) {
            foreach ($pythonFolderNames as $name) {
                $path = $base . DIRECTORY_SEPARATOR . $name;
                if (is_dir($path) && file_exists($path . DIRECTORY_SEPARATOR . 'cli.py')) {
                    $workingDir = realpath($path);
                    break 2;
                }
            }
        }

        if (!$workingDir) {
            $parentDir = dirname(base_path());
            if (is_dir($parentDir)) {
                $items = scandir($parentDir);
                foreach ($items as $item) {
                    if ($item === '.' || $item === '..') continue;
                    $path = $parentDir . DIRECTORY_SEPARATOR . $item;
                    if (is_dir($path) && file_exists($path . DIRECTORY_SEPARATOR . 'cli.py')) {
                        $workingDir = realpath($path);
                        break;
                    }
                }
            }
        }
        
        if ($workingDir === false) {
            throw new \Exception("Python directory (containing cli.py) not found. Checked eaas_python and others.");
        }
        
        $cliPath = $workingDir . DIRECTORY_SEPARATOR . 'cli.py';
        
        // Sanitize data: Convert nulls to empty strings to prevent 'NoneType' attribute errors in Python
        $data = $this->sanitizeNulls($data);

        $tempPayload = tempnam(sys_get_temp_dir(), 'payload_') . '.json';
        file_put_contents($tempPayload, json_encode($data));

        $env = getenv();
        if (empty($env['SystemRoot'])) {
            $env['SystemRoot'] = isset($_SERVER['SystemRoot']) ? $_SERVER['SystemRoot'] : 'C:\\Windows';
        }
        if (empty($env['PATH'])) {
            $env['PATH'] = isset($_SERVER['PATH']) ? $_SERVER['PATH'] : '';
        }

        $process = new Process(['python', $cliPath, $action, $tempPayload], $workingDir, $env);
        $process->setTimeout(120);
        $process->run();

        @unlink($tempPayload);

        if (!$process->isSuccessful()) {
            throw new \Exception("Python Error: " . $process->getErrorOutput());
        }

        $output = json_decode($process->getOutput(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Invalid JSON from Python: " . $process->getOutput());
        }

        if (isset($output['error'])) {
            throw new \Exception($output['error']);
        }

        return $output;
    }

    private function sanitizeNulls($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sanitizeNulls($value);
            }
            return $data;
        }
        return $data ?? '';
    }

    public function uploadAttendance(Request $request)
    {
        if (!$request->hasFile('attendanceFile')) {
            return response()->json(['error' => 'No file part'], 400);
        }

        $file = $request->file('attendanceFile');
        $path = $file->storeAs('temp', uniqid() . '_' . $file->getClientOriginalName(), 'local');
        $fullPath = Storage::disk('local')->path($path);

        try {
            $output = $this->runPythonScript('parse_attendance', ['file_path' => $fullPath]);

            $actionBy = $request->input('action_by') ?? $request->input('user_id');
            LogHelper::log($actionBy, 'UPLOAD', 'Attendance', "Uploaded and parsed biometric attendance PDF", null);

            Storage::disk('local')->delete($path);

            return response()->json([
                'message' => 'Attendance uploaded successfully',
                'data' => $output['data']
            ], 200);

        } catch (\Exception $e) {
            if (Storage::disk('local')->exists($path)) {
                Storage::disk('local')->delete($path);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadDtr(Request $request)
    {
        $data = $request->json()->all();
        
        if (empty($data['employee_name']) || empty($data['employee_data'])) {
            return response()->json(['error' => 'Invalid request data'], 400);
        }

        try {
            $outputFilename = 'DTR_' . str_replace([' ', ','], '_', $data['employee_name']) . '_' . time() . '.xlsx';
            $outputPath = Storage::disk('local')->path('temp/' . $outputFilename);

            $this->runPythonScript('generate_dtr', array_merge($data, ['output_path' => $outputPath]));

            LogHelper::log($request->input('action_by'), 'GENERATE', 'DTR', "Generated DTR Excel for {$data['employee_name']}");

            return response()->download($outputPath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateAr(Request $request)
    {
        $data = $request->json()->all();

        if (empty($data['employee_name']) || empty($data['employee_data'])) {
            return response()->json(['error' => 'Missing employee data'], 400);
        }

        try {
            $outputFilename = 'AR_' . str_replace([' ', ','], '_', $data['employee_name']) . '_' . time() . '.docx';
            $outputPath = Storage::disk('local')->path('temp/' . $outputFilename);

            $this->runPythonScript('generate_ar', array_merge($data, ['output_path' => $outputPath]));

            LogHelper::log($request->input('action_by'), 'GENERATE', 'AR', "Generated AR Word Document for {$data['employee_name']}");

            return response()->download($outputPath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateDtrAdjustment(Request $request)
    {
        $data = $request->json()->all();
        $overrides = $data['overrides'] ?? [];
        $employeeName = $overrides['name'] ?? 'Employee';

        try {
            $outputFilename = 'DTR_ADJUSTMENT_' . str_replace([' ', ','], '_', $employeeName) . '_' . time() . '.docx';
            $outputPath = Storage::disk('local')->path('temp/' . $outputFilename);

            $this->runPythonScript('generate_dtr_adjustment', array_merge($data, ['output_path' => $outputPath]));

            LogHelper::log($request->input('action_by'), 'GENERATE', 'DTR_Adjustment', "Generated DTR Adjustment Slip for {$employeeName}");

            return response()->download($outputPath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadDtrPdf(Request $request)
    {
        $data = $request->json()->all();
        
        if (empty($data['employee_name']) || empty($data['employee_data'])) {
            return response()->json(['error' => 'Invalid request data'], 400);
        }

        try {
            $outputFilename = 'DTR_' . str_replace([' ', ','], '_', $data['employee_name']) . '_' . time() . '.pdf';
            $outputPath = Storage::disk('local')->path('temp/' . $outputFilename);

            $this->runPythonScript('generate_dtr_pdf', array_merge($data, ['output_path' => $outputPath]));

            LogHelper::log($request->input('action_by'), 'GENERATE', 'DTR', "Generated DTR PDF for {$data['employee_name']}");

            return response()->download($outputPath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateArPdf(Request $request)
    {
        $data = $request->json()->all();

        if (empty($data['employee_name']) || empty($data['employee_data'])) {
            return response()->json(['error' => 'Missing employee data'], 400);
        }

        try {
            $outputFilename = 'AR_' . str_replace([' ', ','], '_', $data['employee_name']) . '_' . time() . '.pdf';
            $outputPath = Storage::disk('local')->path('temp/' . $outputFilename);

            $this->runPythonScript('generate_ar_pdf', array_merge($data, ['output_path' => $outputPath]));

            LogHelper::log($request->input('action_by'), 'GENERATE', 'AR', "Generated AR PDF for {$data['employee_name']}");

            return response()->download($outputPath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generatePdf(Request $request)
    {
        $data = $request->json()->all();
        $employeeName = $data['employee_name'] ?? 'Employee';

        try {
            $outputFilename = 'DTR_AR_' . str_replace([' ', ','], '_', $employeeName) . '_' . time() . '.pdf';
            $outputPath = Storage::disk('local')->path('temp/' . $outputFilename);

            $this->runPythonScript('generate_combined_pdf', array_merge($data, ['output_path' => $outputPath]));

            LogHelper::log($request->input('action_by'), 'GENERATE', 'Combined_Report', "Generated Combined DTR/AR PDF for {$employeeName}");

            return response()->download($outputPath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}