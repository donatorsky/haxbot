<?php
declare(strict_types=1);

require_once 'vendor/autoload.php';

use Symfony\Component\Process\Process;

if ($argc < 2) {
	fwrite(STDERR, 'You must provide action to perform.' . PHP_EOL);

	exit(1);
}

const ROOT_DIR = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR;
const CLOSURE_COMPILER_JAR = __DIR__ . DIRECTORY_SEPARATOR . 'closure-compiler-v20200315.jar';

function root_path(string $path, string ...$paths): string {
	return ROOT_DIR . implode(DIRECTORY_SEPARATOR, func_get_args());
}

$command = [
	'java',
	'-jar',
	CLOSURE_COMPILER_JAR,

	'--jscomp_off=checkVars',

	'--language_in=ECMASCRIPT_NEXT',
	'--language_out=ECMASCRIPT_2019',

	'--module_resolution=BROWSER_WITH_TRANSFORMED_PREFIXES',
	'--dependency_mode=SORT_ONLY',

	'--externs', root_path('stubs-*.js'),
	'--js_module_root', root_path('src'),
	'--js', root_path('src', 'configuration.js'),
	'--js', root_path('src', 'server.js'),
	'--js', root_path('src', '*', '**.js'),
	"--js='!**.test.js'",

	'--strict_mode_input',
	'--assume_function_wrapper',
	'--inject_libraries',
];

switch (strtolower($argv[1])) {
	case 'merge':
		$command = array_merge($command, [
			'--compilation_level=WHITESPACE_ONLY',

			'--formatting=PRETTY_PRINT',
			'--formatting=SINGLE_QUOTES',

			'--js_output_file', root_path('storage', 'dist', 'server.js'),
		]);
	break;

	case 'minify':
		$command = array_merge($command, [
			'--compilation_level=SIMPLE',

			'--js_output_file', root_path('storage', 'dist', 'server.min.js'),
		]);
	break;

	case 'optimize':
		$command = array_merge($command, [
			'--compilation_level=ADVANCED_OPTIMIZATIONS',

			'--jscomp_off=reportUnknownTypes',
			'--use_types_for_optimization',

			'--js_output_file', root_path('storage', 'dist', 'server.min-advanced.js'),
		]);
	break;

	default:
		fwrite(STDERR, sprintf('Unknown action %s%s', $argv[1], PHP_EOL));

		exit(2);
	break;
}

$process = new Process($command);

$distConfiguration = false;

if (!is_readable(root_path('src', 'configuration.js'))) {
	$distConfiguration = true;

	copy(root_path('src', 'configuration.js.dist'), root_path('src', 'configuration.js'));
}

$exitCode = $process->run();

if ($distConfiguration) {
	unlink(root_path('src', 'configuration.js'));
}

if (0 === $exitCode) {
	exit(0);
}

dump($process);

fwrite(STDERR, sprintf('The Closure Compiler process returned with error%1$s%2$s%1$s', PHP_EOL, $process->getErrorOutput()));

exit($exitCode);
