<?php
declare(strict_types=1);

require_once 'vendor/autoload.php';

$inputFile = realpath($argv[1]);

if (false === $inputFile) {
	exit(1);
}

use MatthiasMullie\Minify;

$minifier = new Minify\JS();

$inputDirName = dirname($inputFile);
$imports = [];

$data = preg_replace_callback('/^[\t ]*import {[^}]+} from "([^\"]+)";\n*/m', static function (array $match) use (&$inputFile, &$inputDirName, &$imports): string {
	$imports[$match[1]] = realpath($inputDirName . DIRECTORY_SEPARATOR . $match[1] . '.js');
	
	if (false === $imports[$match[1]]) {
		throw new RuntimeException(sprintf('Could not resolve import "%s" in file "%s"', $match[1], $inputFile));
	}
	
	return '';
}, file_get_contents($inputFile));

foreach ($imports as $import) {
	$minifier->add(preg_replace('/^[\t ]*export\s+class\s+/m', 'class ', file_get_contents($import)));
}

$minifier->add($data);

$minifier->minify(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . pathinfo($inputFile, PATHINFO_FILENAME) . '.min.js');
