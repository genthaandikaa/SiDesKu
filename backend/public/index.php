<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$tmpDir = __DIR__ . '/../storage/app/tmp';
if (!file_exists($tmpDir)) {
    @mkdir($tmpDir, 0777, true);
}
@ini_set('upload_tmp_dir', $tmpDir);
@ini_set('sys_temp_dir', $tmpDir);
putenv('TMP=' . $tmpDir);
putenv('TEMP=' . $tmpDir);
$_ENV['TMP'] = $tmpDir;
$_ENV['TEMP'] = $tmpDir;
$_SERVER['TMP'] = $tmpDir;
$_SERVER['TEMP'] = $tmpDir;

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
