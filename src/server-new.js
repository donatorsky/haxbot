'use strict';

import {ROOM_CONFIG} from './configuration.js';

// Obiekty i konstrukcje pomocnicze
// ...
// /Obiekty i konstrukcje pomocnicze

// KONFIGURACJA
// ..
// /KONFIGURACJA

// Reszta świata
const ROOM = HBInit(ROOM_CONFIG);

ROOM.setDefaultStadium("Classic");
ROOM.setScoreLimit(3);
ROOM.setTimeLimit(3);

/**
 * @param {PlayerObject} player
 */
ROOM.onPlayerJoin = function (player) {
	ROOM.setPlayerAdmin(player.id, true);
};
