<?php
/** @noinspection ForgottenDebugOutputInspection */
declare(strict_types=1);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'vendor/autoload.php';

use Assert\Assertion;
use Symfony\Component\DomCrawler\Crawler;

const DOC_URL = 'https://github.com/haxball/haxball-issues/wiki/Headless-Host';
const CACHE_ENABLED = true;
const CACHE_DURATION = 60 * 60 * 24;
const CACHE_PATH = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR;
const CACHE_LAST_ITEM_KEY = CACHE_PATH . 'last_item';

if (CACHE_ENABLED) {
	if (!is_file(CACHE_LAST_ITEM_KEY)) {
		touch(CACHE_LAST_ITEM_KEY);
	}

	$lastItemKey = file_get_contents(CACHE_LAST_ITEM_KEY);

	if (empty($lastItemKey) || !is_file(CACHE_PATH . $lastItemKey) || filemtime(CACHE_PATH . $lastItemKey) + CACHE_DURATION < time()) {
		$pageContents = file_get_contents(DOC_URL);
		$name = uniqid('page-contents.', true);

		file_put_contents(CACHE_PATH . $name, gzdeflate($pageContents, 9));
		file_put_contents(CACHE_LAST_ITEM_KEY, $name);
	} else {
		$pageContents = gzinflate(file_get_contents(CACHE_PATH . $lastItemKey));
	}
} else {
	$pageContents = file_get_contents(DOC_URL);
}

class Utils {

	public static function readDescription(DOMNode $node, string $nodeType = 'p,div.highlight,pre > code'): ?string {
		$nextNodes = (new Crawler($node))->nextAll();
		$description = [];

		for ($i = 0; $i < $nextNodes->count(); ++$i) {
			$currentNode = $nextNodes->eq($i);

			if (!$currentNode->matches($nodeType)) {
				break;
			}

			$description[] = 'div' === $currentNode->nodeName() ?
				'<pre>' . $currentNode->text('', false) . '</pre>' :
				$currentNode->outerHtml();
		}

		return empty($description) ?
			null :
			implode("\n", $description);
	}


	/**
	 * @param \AnnotationObject[] $annotations
	 */
	public static function formatDescription(?string $description, array $annotations = []): string {
		Assertion::allIsInstanceOf($annotations, AnnotationObject::class);

		$annotationsGroups = [
			'const'  => [],
			'param'  => [],
			'type'   => [],
			'return' => [],
		];

		foreach ($annotations as $annotation) {
			if (!IsSet($annotationsGroups[$annotation->getName()])) {
				$annotationsGroups[$annotation->getName()] = [];
			}

			$annotationsGroups[$annotation->getName()][] = $annotation;
		}

		$values = array_map(static function (array $items): string {
			return implode("\n * ", $items);
		}, $annotationsGroups);

		array_unshift($values, !empty($description) ?
			implode("\n * ", preg_split('/[\n\r]/', $description)) :
			null);

		$values = array_filter($values);

		return empty($values) ?
			'' :
			sprintf("/**\n * %s\n */\n", implode("\n *\n * ", $values));
	}


	public static function increaseIndentation(string $contents, int $increaseLevel = 1, string $indentationCharacter = "\t"): string {
		$indentation = str_repeat($indentationCharacter, $increaseLevel);

		return implode("\n", array_map(static function (string $line) use (&$indentation): string {
			return $indentation . $line;
		}, preg_split('/\r\n|\r|\n/', $contents)));
	}
}

class ClassObject {

	private $name;

	private $description;

	/**
	 * @var array<string, \FieldGetterObject>|\ObjectsStore
	 */
	private $fields;

	/**
	 * @var array<string, \MethodObject>|\ObjectsStore
	 */
	private $methods;


	/**
	 * @throws \Assert\AssertionFailedException
	 */
	public function __construct(string $name, ?string $description = null) {
		Assertion::regex($name, '/^\\w+$/');

		$this->name = $name;
		$this->description = $description;
		$this->fields = new ObjectsStore(FieldObjectInterface::class);
		$this->methods = new ObjectsStore(MethodObject::class);
	}


	public function __toString(): string {
		$body = array_merge(
			array_map(static function (FieldObjectInterface $field): string {
				return Utils::increaseIndentation((string) $field);
			}, $this->fields->all()),
			array_map(static function (MethodObject $method): string {
				return Utils::increaseIndentation((string) $method);
			}, $this->methods->all())
		);

		return sprintf(
			<<<'CLASS'
%sclass %s {
%s
}
CLASS,
			Utils::formatDescription($this->description),
			$this->name,
			implode("\n\n", $body)
		);
	}


	public function getName(): string {
		return $this->name;
	}


	public function getDescription(): ?string {
		return $this->description;
	}


	/**
	 * @return \ObjectsStore<string, \FieldGetterObject>
	 */
	public function getFields(): ObjectsStore {
		return $this->fields;
	}


	/**
	 * @return \ObjectsStore<string, \MethodObject>
	 */
	public function getMethods(): ObjectsStore {
		return $this->methods;
	}
}

interface FieldObjectInterface {

	public function __toString(): string;
}

class FieldGetterObject implements StoreItem, FieldObjectInterface {

	private $name;

	private $type;

	private $description;

	private $value;


	public function __construct(string $name, ?string $type, ?string $description = null, $value = "\0") {
		$this->name = $name;
		$this->type = null !== $type ?
			new TypeObject(
				$type,
				false !== stripos($description ?? '', 'can be null if')
			)
			: null;
		$this->description = $description;
		$this->value = $value;
	}


	public function __toString(): string {
		return sprintf(
			<<<'FIELD'
%sget %s() {%s
}
FIELD,
			Utils::formatDescription($this->description, null !== $this->type && $this->type->hasType() ?
				[new VarAnnotation($this->type)] :
				[]
			),
			$this->name,
			("\0" !== $this->value) ?
				sprintf("\n\treturn %s;", var_export($this->value, true)) :
				''
		);
	}


	public function getName(): string {
		return $this->name;
	}


	public function getType(): TypeObject {
		return $this->type;
	}


	public function hasType(): bool {
		return null !== $this->type;
	}
}

class FieldSetterObject implements StoreItem, FieldObjectInterface {

	private $name;

	/**
	 * @var \TypeObject|null
	 */
	private $type;

	private $description;

	private $parameterName;


	/**
	 * @param string|\TypeObject|null $type
	 */
	public function __construct(string $name, $type, ?string $description = null, $parameterName = 'value') {
		$this->name = $name;
		$this->description = $description;
		$this->parameterName = $parameterName;

		if (null !== $type) {
			$this->type = $type instanceof TypeObject ?
				$type :
				new TypeObject(
					$type,
					false !== stripos($description ?? '', 'can be null if')
				);
		}
	}


	public function __toString(): string {
		return sprintf(
			<<<'FIELD'
%sset %s(%s) {
}
FIELD,
			Utils::formatDescription($this->description, null !== $this->type && $this->type->hasType() ?
				[new ParamAnnotation($this->type, $this->parameterName)] :
				[]
			),
			$this->name,
			$this->parameterName
		);
	}


	public function getName(): string {
		return $this->name;
	}


	public function getType(): TypeObject {
		return $this->type;
	}


	public function hasType(): bool {
		return null !== $this->type;
	}
}

class MethodObject implements StoreItem {

	private $name;

	/**
	 * @var array<string, \ParameterObject>|\ObjectsStore
	 */
	private $parameters;

	private $description;

	private $returnType;


	public function __construct(string $name, array $parameters = [], ?string $description = null, ?string $returnType = null) {
		$this->name = $name;
		$this->parameters = new ObjectsStore();
		$this->description = $description;
		$this->returnType = null !== $returnType ?
			new TypeObject(
				$returnType,
				false !== stripos($description, 'returns null') ||
				false !== stripos($description, 'or null if')
			) :
			null;

		foreach ($parameters as $parameter) {
			if (!preg_match('/^(\w+)(\?)?\s*:\s*(.+?)(?:\s*=\s*(.+))?$/', trim($parameter), $match)) {
				dump($parameters);

				throw new RuntimeException('Cannot parse parameter data: ' . $parameter);
			}

			/** @noinspection PhpUnhandledExceptionInspection */
			$this->parameters->add(new ParameterObject(
				$match[1],
				$match[3],
				'?' === $match[2],
				$match[4] ?? NAN
			));
		}
	}


	public function __toString(): string {
		return sprintf(
			<<<'FIELD'
%s%s(%s) {
	//
}
FIELD,
			Utils::formatDescription($this->description, array_merge(
				array_map(static function (ParameterObject $parameter): AnnotationObject {
					return new ParamAnnotation($parameter->hasType() ? $parameter->getType() : null, $parameter->getName());
				}, $this->parameters->all()),
				null !== $this->returnType && $this->returnType->hasType() ?
					[new ReturnAnnotation($this->returnType)] :
					[]
			)),
			$this->name,
			implode(', ', $this->parameters->all())
		);
	}


	public function getName(): string {
		return $this->name;
	}


	public function getDescription(): ?string {
		return $this->description;
	}


	public function getParameters() {
		return $this->parameters;
	}


	public function getReturnType(): TypeObject {
		return $this->returnType;
	}


	public function hasReturnType(): bool {
		return null !== $this->returnType;
	}
}

class ParameterObject implements StoreItem {

	private $name;

	private $type;

	private $nullable;

	private $default;


	public function __construct(string $name, ?string $type = null, bool $nullable = false, $default = NAN) {
		$this->name = $name;
		$this->type = null !== $type ? new TypeObject($type, $nullable) : null;
		$this->nullable = $nullable;
		$this->default = $default;
	}


	public function __toString(): string {
		$result = [$this->name];

		if (!is_float($this->default) || (is_float($this->default) && !is_nan($this->default))) {
			$result[] = ' = ' . $this->default;
		} elseif ($this->nullable && is_float($this->default) && is_nan($this->default)) {
			$result[] = ' = null';
		}

		return implode($result);
	}


	public function getName(): string {
		return $this->name;
	}


	public function getType(): TypeObject {
		return $this->type;
	}


	public function hasType(): bool {
		return null !== $this->type;
	}


	public function isNullable(): bool {
		return $this->nullable;
	}


	public function getDefault() {
		return $this->default;
	}
}

class TypeObject {

	protected $type;

	protected $nullable;


	public function __construct(string $type, bool $nullable = false) {
		$this->type = static::getRealType($type);
		$this->nullable = $nullable;
	}


	public function __toString(): string {
		return (null !== $this->type) ?
			sprintf(
				'%s%s',
				$this->nullable ?
					'?' :
					'',
				$this->type
			) :
			'';
	}


	public function getType(): ?string {
		return $this->type;
	}


	public function hasType(): bool {
		return null !== $this->type;
	}


	public function isNullable(): bool {
		return $this->nullable;
	}


	private static function getRealType(string $type): ?string {
		if (0 === strpos($type, '[]')) {
			return sprintf('Array.<%s>', static::getRealType(substr($type, 2)));
		}

		if (strlen($type) > 2 && '[' === $type[-2] && ']' === $type[-1]) {
			return sprintf('Array.<%s>', static::getRealType(substr($type, 0, -2)));
		}

		if (preg_match('/^Array<(.+)>$/', $type, $match)) {
			return sprintf('Array.<%s>', static::getRealType($match[1]));
		}

		if (preg_match('/Object$/', $type)) {
			return $type;
		}

		switch (strtolower($type)) {
			case 'string':
				return 'string';

			case 'int':
			case 'float':
				return 'number';

			case 'bool':
				return 'boolean';

			case 'teamid':
				return 'TeamID';

			case 'uint8array':
				return 'Uint8Array';

			case '{"x": float, "y": float}':
				return 'Position';

			case '{"code": string, "lat" : float, "lon" : float}':
				return '{code: string, lat: number, lon: number}';

			case 'function':
				return 'Function';

			case 'void':
				return null;

			default:
				//dump(debug_backtrace());
				throw new RuntimeException('Unknown parameter type: ' . $type);
		}
	}
}

class CallbackTypeObject extends TypeObject {

	/**
	 * @var \TypeObject[]
	 */
	protected $parameters = [];

	/**
	 * @var \TypeObject|null
	 */
	private $returnType;


	public function __construct(array $parameters, bool $nullable = false, $returnType = 'void') {
		parent::__construct('function', $nullable);

		foreach ($parameters as $parameter) {
			if (!preg_match('/^(\w+)(\?)?\s*:\s*(.+?)(?:\s*=\s*(.+))?$/', trim($parameter), $match)) {
				dump($parameters);

				throw new RuntimeException('Cannot parse parameter data: ' . $parameter);
			}

			$this->parameters[] = new TypeObject($match[3], '?' === $match[2]);
		}

		if (null !== $returnType) {
			$this->returnType = $returnType instanceof TypeObject ?
				$returnType :
				new TypeObject($returnType);
		}
	}


	public function __toString(): string {
		$definition = sprintf('function(%s)', implode(', ', $this->parameters));

		if (null !== $this->returnType && $this->returnType->hasType()) {
			$definition .= sprintf(': %s', $this->returnType);
		}

		if ($this->nullable) {
			$definition = sprintf('(%s)|null', $definition);
		}

		return $definition;
	}
}

class AnnotationObject {

	/**
	 * @var string
	 */
	private $name;

	private $type;

	/**
	 * @var string|null
	 */
	private $variableName;

	/**
	 * @var string|null
	 */
	private $description;


	/**
	 * @param string|\TypeObject|null $type
	 */
	public function __construct(string $name, $type = null, ?string $variableName = null, ?string $description = null) {
		$this->name = $name;
		$this->type = $type;
		$this->variableName = $variableName;
		$this->description = $description;
	}


	public function __toString(): string {
		$result = ["@{$this->name}"];

		if (null !== $this->type) {
			$result[] = sprintf('{%s}', $this->type);
		}

		if (null !== $this->variableName) {
			$result[] = $this->variableName;
		}

		if (null !== $this->description) {
			$result[] = $this->description;
		}

		return implode(' ', $result);
	}


	public function getName(): string {
		return $this->name;
	}


	public function getType() {
		return $this->type;
	}


	public function getVariableName(): ?string {
		return $this->variableName;
	}


	public function getDescription(): ?string {
		return $this->description;
	}
}

class ParamAnnotation extends AnnotationObject {

	/**
	 * @inheritDoc
	 */
	public function __construct($type, ?string $variableName = null, ?string $description = null) {
		parent::__construct('param', $type, $variableName, $description);
	}
}

class VarAnnotation extends AnnotationObject {

	/**
	 * @inheritDoc
	 */
	public function __construct($type, ?string $variableName = null, ?string $description = null) {
		parent::__construct('var', $type, $variableName, $description);
	}
}

class ReturnAnnotation extends AnnotationObject {

	/**
	 * @inheritDoc
	 */
	public function __construct($type, ?string $description = null) {
		parent::__construct('return', $type, null, $description);
	}
}

class EnumAnnotation extends AnnotationObject {

	/**
	 * @inheritDoc
	 */
	public function __construct($type, ?string $description = null) {
		parent::__construct('enum', $type, null, $description);
	}
}

interface StoreItem {

	public function getName(): string;
}

class ObjectsStore implements ArrayAccess {

	/**
	 * @var array<string, object>
	 */
	private $store = [];

	private $class;


	/**
	 * @param string|class-string $class The class string of allowed objects' types
	 */
	public function __construct(string $class = StoreItem::class) {
		$this->class = $class;
	}


	/**
	 * @return array<\StoreItem>
	 */
	public function all(): array {
		return array_values($this->store);
	}


	/**
	 * @param StoreItem $object
	 *
	 * @return $this
	 * @throws \Assert\AssertionFailedException
	 */
	public function add(StoreItem $object): self {
		Assertion::isInstanceOf($object, $this->class);

		$this->store[$object->getName()] = $object;

		return $this;
	}


	/**
	 * @param StoreItem $object
	 *
	 * @return $this
	 * @throws \Assert\AssertionFailedException
	 */
	public function remove(StoreItem $object): self {
		Assertion::isInstanceOf($object, $this->class);

		unset($this->store[$object->getName()]);

		return $this;
	}


	/**
	 * @inheritDoc
	 */
	public function offsetExists($offset): bool {
		return IsSet($this->store[$offset]);
	}


	/**
	 * @inheritDoc
	 */
	public function offsetGet($offset): StoreItem {
		return $this->store[$offset];
	}


	/**
	 * @inheritDoc
	 * @throws \Assert\AssertionFailedException
	 */
	public function offsetSet($offset, $value): void {
		$this->add($value);
	}


	/**
	 * @inheritDoc
	 */
	public function offsetUnset($offset): void {
		unset($this->store[$offset]);
	}
}

$crawler = new Crawler($pageContents);

/**
 * @var \ClassObject[] $classes
 */
$classes = [
	$positionObject = new ClassObject('Position', '<p>{"x": float, "y": float} stub.</p>'),
];

/** @noinspection PhpUnhandledExceptionInspection */
$positionObject->getFields()
	->add(new FieldGetterObject('x', 'Int'))
	->add(new FieldGetterObject('y', 'Int'));

foreach ($crawler->filter('#wiki-body > .markdown-body > h2') as $h2) {
	$name = trim($h2->textContent);

	if ('TeamID' === $name) {
		$classes[] = sprintf(
			<<<'TEAMID'
%sconst TeamID = {
	Spectators: 0,
	RedTeam:    1,
	BlueTeam:   2,
};
TEAMID,
			Utils::formatDescription(Utils::readDescription($h2), [
				new EnumAnnotation(new TypeObject('Int')),
			])
		);

		continue;
	}

	if ('CollisionFlagsObject' === $name) {
		$classes[] = sprintf(
			<<<'COLLISIONFLAGSOBJECT'
%sconst CollisionFlagsObject = {
	ball:   1,
	red:    2,
	blue:   4,
	redKO:  8,
	blueKO: 16,
	wall:   32,
	all:    63,
	kick:   64,
	score:  128,
	c0:     268435456,
	c1:     536870912,
	c2:     1073741824,
	c3:     -2147483648,
};
COLLISIONFLAGSOBJECT,
			Utils::formatDescription(Utils::readDescription($h2), [
				new EnumAnnotation(new TypeObject('Int')),
			])
		);

		continue;
	}

	if ('RoomConfigObject' === $name) {
		$fields = [];

		foreach ((new Crawler($h2))->nextAll()->filter('h3,h2,hr') as $item) {
			/**
			 * @var \DOMNode $item
			 */
			if ('h3' !== $item->nodeName) {
				break;
			}

			$itemValue = trim($item->textContent);

			// Field
			if (preg_match('/^(\w+)\s+:\s+(.+)$/', $itemValue, $match)) {
				$fields[$match[1]] = new TypeObject($match[2]);

				continue;
			}

			// Method or setter
			$node = new Crawler($item);

			if (preg_match('/<code>(?:' . preg_quote($itemValue, '/') . ')?\((.*?)\)\s*(?::\s*(.+))?<\/code>/m', $node->nextAll()->eq(0)->html(), $match)) {
				throw new RuntimeException('RoomConfigObject does not support methods');
			}

			// Field written as method
			if (preg_match('/^<code>(\w+)\s+:\s+(.+)<\/code>$/', $node->nextAll()->eq(0)->html(), $match)) {
				$fields[$match[1]] = new TypeObject($match[2]);

				continue;
			}

			// Unknown
			dump('Unknown place: ' . $node->nextAll()->eq(0)->html());
			//throw new RuntimeException('Unknown place: ' . $node->nextAll()->eq(0)->html());
		}

		$classes[] = sprintf(
			<<<'ROOMCONFIGOBJECT'
%slet RoomConfigObject;
ROOMCONFIGOBJECT,
			Utils::formatDescription(Utils::readDescription($h2), [
				new AnnotationObject(
					'typedef',
					empty($fields) ?
						new TypeObject('Object') :
						sprintf("{\n * \t\t%s\n * }", implode(",\n * \t\t", array_map(static function (string $k, TypeObject $v): string {
							return sprintf('%s: (%s|undefined)', $k, $v);
						}, array_keys($fields), $fields))),
					'RoomConfigObject'
				),
			])
		);

		continue;
	}

	/** @noinspection PhpUnhandledExceptionInspection */
	$classObject = new ClassObject($name, Utils::readDescription($h2));

	foreach ((new Crawler($h2))->nextAll()->filter('h3,h2,hr') as $item) {
		/**
		 * @var \DOMNode $item
		 */
		if ('h3' !== $item->nodeName) {
			break;
		}

		$itemValue = trim($item->textContent);

		// Field
		if (preg_match('/^(\w+)\s+:\s+(.+)$/', $itemValue, $match)) {
			/** @noinspection PhpUnhandledExceptionInspection */
			$classObject->getFields()->add(new FieldGetterObject($match[1], $match[2], Utils::readDescription($item)));

			continue;
		}

		// Method or setter
		$node = new Crawler($item);

		if (preg_match('/<code>(?:' . preg_quote($itemValue, '/') . ')?\((.*?)\)\s*(?::\s*(.+))?<\/code>/m', $node->nextAll()->eq(0)->html(), $match)) {
			if (0 === stripos($itemValue, 'on')) {
				/** @noinspection PhpUnhandledExceptionInspection */
				$classObject->getFields()->add(new FieldSetterObject(
					$itemValue,
					new CallbackTypeObject(array_filter(preg_split('/\s*,\s*/', htmlspecialchars_decode($match[1]))), false, $match[2] ?? null),
					Utils::readDescription($node->nextAll()->getNode(0)),
					'callback'
				));
			} else {
				/** @noinspection PhpUnhandledExceptionInspection */
				$classObject->getMethods()->add(new MethodObject(
					$itemValue,
					array_filter(preg_split('/\s*,\s*/', htmlspecialchars_decode($match[1]))),
					Utils::readDescription($node->nextAll()->getNode(0)),
					$match[2] ?? null
				));
			}

			continue;
		}

		// Field written as method
		if (preg_match('/^<code>(\w+)\s+:\s+(.+)<\/code>$/', $node->nextAll()->eq(0)->html(), $match)) {
			/** @noinspection PhpUnhandledExceptionInspection */
			$classObject->getFields()->add(new FieldGetterObject($match[1], $match[2], Utils::readDescription($item)));

			continue;
		}

		// Unknown
		dump('Unknown place: ' . $node->nextAll()->eq(0)->html());
		//throw new RuntimeException('Unknown place: ' . $node->nextAll()->eq(0)->html());
	}

	//if ('CollisionFlagsObject' === $name) {
	//	/** @noinspection PhpUnhandledExceptionInspection */
	//	$classObject->getFields()
	//		->add(new FieldGetterObject('ball', 'Int', null, 1))
	//		->add(new FieldGetterObject('red', 'Int', null, 2))
	//		->add(new FieldGetterObject('blue', 'Int', null, 4))
	//		->add(new FieldGetterObject('redKO', 'Int', null, 8))
	//		->add(new FieldGetterObject('blueKO', 'Int', null, 16))
	//		->add(new FieldGetterObject('wall', 'Int', null, 32))
	//		->add(new FieldGetterObject('all', 'Int', null, 63))
	//		->add(new FieldGetterObject('kick', 'Int', null, 64))
	//		->add(new FieldGetterObject('score', 'Int', null, 128))
	//		->add(new FieldGetterObject('c0', 'Int', null, 268435456))
	//		->add(new FieldGetterObject('c1', 'Int', null, 536870912))
	//		->add(new FieldGetterObject('c2', 'Int', null, 1073741824))
	//		->add(new FieldGetterObject('c3', 'Int', null, -2147483648));
	//}

	//dump('KONIEC');

	$classes[] = $classObject;
}

$classes[] = <<<'CONSTRUCTOR'
/**
 * @constructor
 *
 * @param {RoomConfigObject} roomConfig
 *
 * @return {RoomObject}
 *
 * @link https://github.com/haxball/haxball-issues/wiki/Headless-Host Documentation
 * @link https://html5.haxball.com/headless                           Headless server host
 */
function HBInit(roomConfig) {
};
CONSTRUCTOR;

file_put_contents(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'stubs-' . date('Y-m-d_H_i_s') . '.js', implode("\n\n", $classes));

//dd($classes);
