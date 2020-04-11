'use strict';

import {ADMINS, STORAGE_PREFIX, ROOM_CONFIG} from './configuration.js';
import {CommandsStore} from "./Commands/CommandsStore";
import {Command} from "./Commands/Command";
import {AdminInfo, PlayerInfo, PlayersManager} from "./Players/PlayersManager";
import {GameManager, GoalInfo} from "./Game/GameManager";
import {TeamID, TOUCHED_BALL_THRESHOLD} from "./Utils/constants";
import {calculateDistance, getTime, table} from "./Utils/Utils";
import {ScopedStorage} from "./Storage/ScopedStorage";
import {LocalStorageStorage} from "./Storage/LocalStorageStorage";
import {CachingStorage} from "./Storage/CachingStorage";
import {StoreItemTransformer, TransformingStorage} from "./Storage/TransformingStorage";

// Obiekty i konstrukcje pomocnicze
let serverLightMode = false;

class Utils {
	/**
	 * @return {?DiscPropertiesObject}
	 */
	static getBallDiscProperties() {
		let disc;

		for (let x = 0; x < ROOM.getDiscCount(); ++x) {
			disc = ROOM.getDiscProperties(x);

			if (
				(disc.cGroup & KICKABLE_AND_SCORABLE_BALL_MASK) === KICKABLE_AND_SCORABLE_BALL_MASK &&
				(disc.cGroup & ANY_TEAM_BALL) === 0
			) {
				return disc;
			}
		}

		return null;
	}
}

/**
 * @implements {StoreItemTransformer<PlayerInfo>}
 */
class PlayerInfoStoreItemTransformer extends StoreItemTransformer {
	encode(item) {
		try {
			return PlayerInfo.fromJSON(localStorage.getItem(key));
		} catch (e) {
			console.error('Could not deserialize player:', item);

			return null;
		}
	}

	decode(item) {
		return JSON.parse(item);
	}

	supports(key, item) {
		console.log('PlayerInfoStoreItemTransformer', key, item);

		return 'string' === typeof item && /player\.[\w-]{43}$/.test(key);
	}
}

// /Obiekty i konstrukcje pomocnicze

// KONFIGURACJA
/**
 * Dostępne polecenia.
 *
 * @type {CommandsStore}
 */
const COMMANDS = new CommandsStore([
	new Command("help", /**
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 */(player, arg) => {
		if (undefined === arg) {
			ROOM.sendAnnouncement(`Dostępne polecenia: !${COMMANDS.getCommandsNames(player).join(', !')}
Możesz także napisać «!help [nazwa polecenia]», aby wyświetlić pomoc tylko do niego`, player.id);
		} else {
			const command = COMMANDS.get(arg);

			if (null !== command && command.hasDescription()) {
				ROOM.sendAnnouncement(command.getDescription(), player.id);
			} else {
				ROOM.sendAnnouncement(`Brak dostępnej pomocy dla polecenia "${arg}"`, player.id);
			}
		}

		return false;
	}),

	new Command("me", /**
	 * @param {PlayerObject} player
	 */(player) => {
		const playerInfo = PLAYERS.get(player),
		      goalsTotal = playerInfo.goals + playerInfo.assists + playerInfo.ownGoals,
		      lines      = [
			      `👤 ${player.name}, 🙈 AFK: ${PLAYERS.isAfk(player) ? 'tak' : 'nie'}`,
			      `⏰ Czas spędzony na serwerze: ogółem: ${getTime(PLAYERS.getTotalTimeOnServer(player))}, teraz: ${getTime(PLAYERS.getTodayTimeOnServer(player))}`
		      ];

		lines.push(goalsTotal > 0 ?
			`📊 Statystyki goli: ⚽ strzelone: ${playerInfo.goals} (${(playerInfo.goals * 100 / goalsTotal).toFixed(1)}%), 🏃‍♂️ asysty: ${playerInfo.assists} (${(playerInfo.assists * 100 / goalsTotal).toFixed(1)}%), 😂 samobóje: ${playerInfo.ownGoals} (${(playerInfo.ownGoals * 100 / goalsTotal).toFixed(1)}%)` :
			"📊 Statystyki goli: ⚽ strzelone: 0 (0.0%), 🏃‍♂️ asysty: 0 (0.0%), 😂 samobóje: 0 (0.0%)"
		);

		ROOM.sendAnnouncement(lines.join("\n"), player.id);

		return false;
	}, "!me\nWypisuje informacje na temat Twoich statystyk.", () => !serverLightMode),

	new Command("stats", /**
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 */(player, arg) => {
		let data = [];
		const playersSorter = (a, b) => {
			if (a[1] !== b[1]) {
				return b[1] - a[1];
			}

			if (a[2] !== b[2]) {
				return b[2] - a[2];
			}

			return b[3] - a[3];
		};

		switch ((arg ?? '').toLowerCase()) {
			case "allplayers":
			case "all-players":
				if (!player.admin) {
					break;
				}

				for (const player of Object.values(PLAYERS.all())) {
					data.push([
						0,
						player.goals,
						player.assists,
						player.ownGoals,
						player.name
					]);
				}

				ROOM.sendAnnouncement("📈 Statystyki dla wszystkich graczy serwera:\n" + table(
					["#", "Goli", "Asyst", "Samobójów", "Nazwa gracza"],
					data.sort(playersSorter).map((value, index) => {
						value[0] = index + 1;

						return value;
					})
				), player.id);
				break;

			case "top":
			case "top10":
				for (const player of Object.values(PLAYERS.all())) {
					data.push([
						0,
						player.goals,
						player.assists,
						player.ownGoals,
						player.name
					]);
				}

				ROOM.sendAnnouncement("📈 Statystyki dla TOP10 graczy serwera:\n" + table(
					["#", "Goli", "Asyst", "Samobójów", "Nazwa gracza"],
					data.sort(playersSorter).map((value, index) => {
						value[0] = index + 1;

						return value;
					}).slice(0, 10)
				), player.id);
				break;

			case "players":
			default:
				for (const player of ROOM.getPlayerList()) {
					const playerInfo = PLAYERS.get(player);

					data.push([
						0,
						playerInfo.goals,
						playerInfo.assists,
						playerInfo.ownGoals,
						player.name
					]);
				}

				ROOM.sendAnnouncement("📈 Statystyki dla graczy obecnych na serwerze:\n" + table(
					["#", "Goli", "Asyst", "Samobójów", "Nazwa gracza"],
					data.sort(playersSorter).map((value, index) => {
						value[0] = index + 1;

						return value;
					})
				), player.id);
				break;
		}

		return false;
	}, `!stats «statystyka»
Wypisuje statystyki graczy obecnych na serwerze lub całego serwera.

Przykład:
 !stats
 !stats players
 !stats top10

Dostpęne opcje:
 players\t\tWyświetla statystyki dla wszystkich graczy obecnych na serwerze.
 top, top10\tWyświetla statystyki dla TOP10 graczy serwera.`, () => !serverLightMode),

	new Command("team", /**
	 * @param {PlayerObject} sender
	 * @param {string|undefined} arg
	 */(sender, arg) => {
		if (undefined === arg) {
			ROOM.sendAnnouncement(`Wpisz treść wiadomości drużynowej i wyślij jeszcze raz, np.: !team Moja wiadomość`, sender.id);

			return false;
		}

		ROOM.getPlayerList()
			.filter((player) => player.team === sender.team)
			.forEach((player) => ROOM.sendAnnouncement(`[WIADOMOŚĆ DRUŻYNOWA] ${arg.trim()}`, player.id));

		return false;
	}, "!team Wiadomość\nWysyła wiadomość tylko do Twojej obecnej drużyny."),

	new Command("direct", /**
	 * @param {PlayerObject} sender
	 * @param {string|undefined} arg
	 */(sender, arg) => {
		if (undefined === arg) {
			ROOM.sendAnnouncement(`Wpisz treść wiadomości bezpośredniej i wyślij jeszcze raz, np.: !direct «@Nazwa Gracza» «Twoja wiadomość»`, sender.id);

			return false;
		}

		const possibleReceivers = [];
		let receiverId = null;

		for (const player of ROOM.getPlayerList()) {
			if (arg.startsWith(`@${player.name} `)) {
				possibleReceivers.push(player.name);
				receiverId = player.id;
			}
		}

		if (0 === possibleReceivers.length) {
			ROOM.sendAnnouncement(arg, sender.id);
			ROOM.sendAnnouncement("Nie znaleziono odbiorcy", sender.id);
		} else if (possibleReceivers.length > 1) {
			ROOM.sendAnnouncement(`Nie można wysłać wiadomości, więcej niż jednen pasujący odbiorca: ${possibleReceivers.join(', ')}`, sender.id);
		} else {
			ROOM.sendAnnouncement(`[WIADOMOŚĆ PRYWATNA] 👤@${sender.name} ✉${arg.substr(possibleReceivers[0].length + 2).trimLeft()}`, receiverId);
			ROOM.sendAnnouncement(`[WIADOMOŚĆ PRYWATNA] ✉${arg.substr(possibleReceivers[0].length + 2).trimLeft()} → 👤${possibleReceivers[0]}`, sender.id);
		}

		return false;
	}, "!direct @gracz wiadomość\nWysyła wiadomość prywatną do sprecyzowanego gracza."),

	new Command("login", /**
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 */(player, arg) => {
		if (undefined === arg) {
			ROOM.sendAnnouncement("Podaj nazwę uzytkownika i hasło", player.id);

			return false;
		}

		let args = arg.split(/\s+/, 2);

		if (args.length < 2) {
			ROOM.sendAnnouncement("Podaj nazwę uzytkownika i hasło", player.id);

			return false;
		}

		if (PLAYERS.verifyAdminCredentials(args[0], args[1])) {
			ROOM.setPlayerAdmin(player.id, true);
			ROOM.sendAnnouncement("Zalogowano!", player.id, 0x00FF00);
		} else {
			ROOM.sendAnnouncement("Dnae niepoprawne", player.id, 0xFF0000);
		}

		return false;
	}, "!login «użytkownik» «hasło»\nLoguje użytkownika jako administrator."),

	new Command("logout", /**
	 * @param {PlayerObject} player
	 */(player) => {
		if (player.admin) {
			ROOM.setPlayerAdmin(player.id, false);
		}

		return false;
	}, "!logout\nWylogowuje użytkownika z funkcji administratora.", /**
	 * @param {PlayerObject} player
	 */(player) => player.admin),

	new Command("dump", /**
	 * @param {PlayerObject} player
	 */(player) => {
		PLAYERS.flush();

		const data = {
			players: PLAYERS.all()
		};

		console.info(JSON.stringify(data));

		ROOM.sendAnnouncement("💾 Zrzut pamięci zakończony, zobacz konsolę.", player.id);

		return false;
	}, "!dump\nZrzuca stan pamięci serwera.", /**
	 * @param {PlayerObject} player
	 */(player) => player.admin),

	new Command("match", /**
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 */(player, arg) => {
		if (undefined === arg) {
			ROOM.sendAnnouncement("Podaj wymagane argumenty. Wpisz «!help match» aby dowiedzieć się więcej.", player.id);

			return false;
		}

		const regex = /\b(\w+)(?:\s*=\s*([^\s]+))?/g;
		const args = {};
		let m;

		while ((m = regex.exec(arg)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			args[m[1].toLowerCase()] = m[2];
		}

		console.log(arg, args);

		if (args.hasOwnProperty("start")) {
			try {
				GAME.start(
					args.hasOwnProperty("mode") ? (args.mode ?? '').toLowerCase() : GAME.mode,
					args.hasOwnProperty("limit") ? parseInt(args.limit, 10) : GAME.limit,
					args.hasOwnProperty("teamsize") ? parseInt(args.teamsize, 10) : GAME.teamSize,
				);

				ROOM.sendAnnouncement(`🏆 Rozpoczynam turniej: typ - ${GAME.mode}, limit zwycięstw - ${GAME.limit}, maks. rozmiar drużyny - ${GAME.teamSize}`);
			} catch (e) {
				ROOM.sendAnnouncement(`[BŁĄD] ${e.message}`, player.id);
			}
		} else if (args.hasOwnProperty("stop")) {
			ROOM.sendAnnouncement(`🏆 Przerywam turniej na żądanie ${player.name}! 😡`);
			GAME.stop();
		} else if (args.hasOwnProperty("restart")) {
			ROOM.sendAnnouncement("🏆 Restartuję turniej... 🤦‍♂️");

			COMMANDS.execute("match", player, "stop", "");
			COMMANDS.execute("match", player, `start mode=${GAME.mode} limit=${GAME.limit}`, "");
		} else {
			ROOM.sendAnnouncement(`Nierozpoznany argument: ${arg}`, player.id);
		}

		return false;
	}, `!match «akcja»
Pozwala na zarządzanie meczem w konkretnym trybie.

Przykłady:
 !match start
 !match start mode=bo limit=3
 !match start mode=ut limit=5 teamSize=2
 !match restart
 !match stop

Dostępne akcje:
 start		Rozpoczyna automatycznie zarządzany mecz (bez podanego trybu: używając ostatnio użytej konfiguracji).
 restart		Ponownie rozpoczyna automatycznie zarządzany mecz.
 stop		Zatrzymuje obecnie trwający mecz i wychodzi z trybu automatycznego zarządzania.

Dostępne tryby gry (mode):
 bo			Best Of - rozegranie do n gier (wygrywa drużyna, która jako pierwsza zdobędzie ponad połowę zwycięstw).
 ut			Up To - rozegranie n gier (wygrywa drużyna, która jako pierwsza wygra n meczy).
 random	W każdym meczu losowe drużyny.

Dostępne opcje trybów gry:
 mode=bo:
  limit=3		Limit rozegranych meczy.
  teamSize=3	Rozmiar drużyny
 mode=ut:
  limit=3		Limit rozegranych meczy.
  teamSize=3	Rozmiar drużyny
 mode=random:
  limit=3		Limit rozegranych meczy. (0 - brak)
  teamSize=3	Rozmiar drużyny (0 - brak)`, /**
	 * @param {PlayerObject} player
	 */(player) => player.admin && !serverLightMode),

	new Command("light-mode", /**
	 * @param {PlayerObject} player
	 * @param {string|undefined} arg
	 */(player, arg) => {
		switch ((arg ?? '').toLowerCase()) {
			case 'off':
				serverLightMode = false;

				ROOM.sendAnnouncement("Tryb lekki serwera został wyłączony 🐌");
				break;

			case '':
			case 'on':
				serverLightMode = true;

				ROOM.sendAnnouncement("Tryb lekki serwera został włączony 🐇");
				break;

			default:
				console.error(`Unknown argument: ${arg}`);
				break;
		}

		return false;
	}, `!light-mode «status»
Włącza lub wyłącza tryb lekki serwera. W trybie lekkim nie są gromadzone żadne statystyki i wyłączana jest większość interaktywnych elementów serwera.

Przykłady:
 !light-mode
 !light-mode on
 !light-mode off

Dostępne statusy:
 on\tWłącza tryb lekki
 off\tWyłącza tryb lekki`, /**
	 * @param {PlayerObject} player
	 */(player) => player.admin),
]);
// /KONFIGURACJA

// Reszta świata
const ROOM    = HBInit(ROOM_CONFIG),
      //ROOM    = {},
      STORAGE = new ScopedStorage(new TransformingStorage(new CachingStorage(new LocalStorageStorage()), [
	      new PlayerInfoStoreItemTransformer()
      ]), STORAGE_PREFIX),
      PLAYERS = new PlayersManager(ROOM, STORAGE_PREFIX, STORAGE),
      GAME    = new GameManager(ROOM, PLAYERS);

const KICKABLE_AND_SCORABLE_BALL_MASK = ROOM.CollisionFlags.ball | ROOM.CollisionFlags.kick | ROOM.CollisionFlags.score,
      ANY_TEAM_BALL                   = ROOM.CollisionFlags.blue | ROOM.CollisionFlags.red | ROOM.CollisionFlags.blueKO | ROOM.CollisionFlags.redKO;

ROOM.setDefaultStadium("Classic");
ROOM.setScoreLimit(3);
ROOM.setTimeLimit(0);
ROOM.setTeamsLock(true);

setInterval(function () {
	console.log('Autosaving players state');

	PLAYERS.flush();
}, 1000 * 60 * 5);

window.addEventListener("unload", function () {
	console.log('Saving players state before server is down');

	PLAYERS.flush();
});

PLAYERS.setAdmins(ADMINS);

/**
 * @param {PlayerObject} player
 */
ROOM.onPlayerJoin = function (player) {
	ROOM.setPlayerAdmin(player.id, PLAYERS.verifyAdminAuthToken(player.auth));

	PLAYERS.register(player);

	if (serverLightMode || 0 === PLAYERS.getTotalTimeOnServer(player)) {
		ROOM.sendAnnouncement(`Witaj ${player.name} na serwerze! 🎉\nNapisz !help, aby wyświetlić dostępne polecenia.`, player.id);
	} else {
		ROOM.sendAnnouncement(`Witaj ponownie ${player.name} na serwerze! 🎉\nNapisz !help, aby wyświetlić dostępne polecenia.`, player.id);
	}
};

/**
 * @param {PlayerObject} player
 */
ROOM.onPlayerLeave = function (player) {
	PLAYERS.disconnect(player);
};

/**
 * @param {PlayerObject} player
 * @param {string} message
 *
 * @return {boolean}
 */
ROOM.onPlayerChat = function (player, message) {
	const regex = /^\s*!([\w\-]+)\s*(.+)?$/;
	let m;

	return null !== (m = regex.exec(message)) && COMMANDS.has(m[1]) ?
		COMMANDS.execute(m[1], player, m[2], message) :
		true;
};

ROOM.onGameStart = function () {
	//
};

/**
 * @param {ScoresObject} scores
 */
ROOM.onTeamVictory = function (scores) {
	if (serverLightMode) {
		return;
	}

	GAME.registerVictory(scores);
};

ROOM.onGameStop = function () {
	if (serverLightMode) {
		return;
	}

	console.log('onGameStop', GAME.getStats());

	const goalsSummary = ["Podsumowanie goli z meczu:"];

	for (const goal of GAME.goals) {
		goalsSummary.push(`  ${TeamID.RedTeam === goal.byTeam ? "🔴" : "🔵"} [${getTime(goal.scoredAt)}] Gol gracza ${PLAYERS.get(goal.goalBy).name}${null !== goal.assistBy ? ` przy asyście gracza ${PLAYERS.get(goal.assistBy).name}` : ''}`);
	}

	ROOM.sendAnnouncement(goalsSummary.join("\n"));

	GAME.end();
};

ROOM.onPositionsReset = function () {
	if (serverLightMode) {
		return;
	}

	GAME.resetBallTouches();
};

/**
 * @param {PlayerObject} player
 */
ROOM.onPlayerBallKick = function (player) {
	if (serverLightMode) {
		return;
	}

	GAME.registerBallTouch(player);
};

/**
 * @param {PlayerObject} player
 */
ROOM.onPlayerActivity = function (player) {
	// console.log(player, ROOM.getBallPosition());
};

/**
 * @param {PlayerObject} changedPlayer
 * @param {PlayerObject} byPlayer
 */
ROOM.onPlayerTeamChange = function (changedPlayer, byPlayer) {
	//
};

/**
 * @param {TeamID} team
 */
ROOM.onTeamGoal = function (team) {
	if (serverLightMode) {
		return;
	}

	const lastPlayerContactedBall = GAME.ballTouches,
	      scores                  = ROOM.getScores();

	if (lastPlayerContactedBall.length > 0) {
		const shooter = PLAYERS.getActivePlayerObject(lastPlayerContactedBall[0].playerId);
		let contents;

		if (null !== shooter) {
			if (shooter.team === team) {
				PLAYERS.get(lastPlayerContactedBall[0].playerId).goals += 1;

				contents = `⚽ [${getTime(scores.time)}] Gol strzelony przez ${shooter.name}!`;
			} else {
				PLAYERS.get(lastPlayerContactedBall[0].playerId).ownGoals += 1;

				contents = `😂 [${getTime(scores.time)}] Samobój zawodnika ${shooter.name}!`;
			}
		} else {
			contents = `⚽ [${getTime(scores.time)}] Gol strzelony przez ${PLAYERS.get(lastPlayerContactedBall[0].playerId).name}!`;
		}

		if (2 === lastPlayerContactedBall.length) {
			PLAYERS.get(lastPlayerContactedBall[1].playerId).assists += 1;

			contents += ` Asysta ${PLAYERS.get(lastPlayerContactedBall[1].playerId).name}.`;
		}

		contents += TeamID.RedTeam === team ? " 🔴" : " 🔵";

		ROOM.sendAnnouncement(contents);

		GAME.registerGoal(new GoalInfo(
			lastPlayerContactedBall[0].playerId,
			lastPlayerContactedBall.length > 1 ?
				lastPlayerContactedBall[1].playerId :
				null,
			scores.time,
			team
		));
	}
};

ROOM.onGameTick = function () {
	if (serverLightMode) {
		return;
	}

	const ballDiscProperties = Utils.getBallDiscProperties();

	if (null === ballDiscProperties) {
		return;
	}

	/**
	 * @type {?PlayerObject}
	 */
	let closestPlayer = null;
	let playerDiscProperties             = null,
	    playerDiscToBallDistance         = 0,
	    playerDiscClosestoToBallDistance = Infinity;

	for (const player of ROOM.getPlayerList()) {
		if (TeamID.Spectators === player.team) {
			continue;
		}

		playerDiscProperties = ROOM.getPlayerDiscProperties(player.id);
		playerDiscToBallDistance = calculateDistance(player.position, ballDiscProperties) - playerDiscProperties.radius - ballDiscProperties.radius;

		if (playerDiscToBallDistance < playerDiscClosestoToBallDistance) {
			playerDiscClosestoToBallDistance = playerDiscToBallDistance;
			closestPlayer = player;
		}
	}

	if (null !== closestPlayer && playerDiscClosestoToBallDistance <= TOUCHED_BALL_THRESHOLD) {
		GAME.registerBallTouch(closestPlayer);
	}
};
