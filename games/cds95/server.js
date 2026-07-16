'use strict';

const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const express = require('express');
const { Server } = require('socket.io');
const Terrain = require('./public/js/terrain.js');
const OceanCurrent = require('./public/js/ocean-current.js');
const ClassroomStore = require('./lib/classroom-store.js');
const MissionCatalog = require('./lib/mission-catalog.js');
const Fatigue = require('./lib/fatigue.js');
const ArrivalZones = require('./lib/arrival-zones.js');
const ARRIVAL_ZONES = require('./data/catalog/arrival-zones.json');

const PORT = Number(process.env.PORT || 3000);
const TEACHER_PIN = String(process.env.TEACHER_PIN || '2468');
const { WORLD_W, WORLD_H, TILE, WORLD_PIXEL_W, WORLD_PIXEL_H, SPEED: TERRAIN_SPEED } = Terrain;
const START = { x: 1181.5 * TILE, y: 356.5 * TILE };
const LISBON = Object.freeze({
  harbor: { x: 1185.5 * TILE, y: 357.5 * TILE },
  city: { x: 1186.5 * TILE, y: 356.5 * TILE },
  landGate: { x: 1188.5 * TILE, y: 356.5 * TILE }
});
const SEA_BASE_SPEED = 132;
const LAND_BASE_SPEED = 96;
const COMPLETION_SPEED_MULTIPLIER = 2;
const CURRENT_TAIL_FACTOR = 0.30;
const CURRENT_HEAD_FACTOR = 0.08;
const CURRENT_CROSS_FACTOR = 0.14;
const GAME_HOURS_PER_REAL_SECOND = 4;
const PORT_ENTRY_GAME_MINUTES = 360;
const PORT_EXIT_GAME_MINUTES = 240;
const LAND_PREP_GAME_MINUTES = 360;
const RETURN_CITY_GAME_MINUTES = 120;
const STARTING_MONEY = 5000;
const MAX_WATER = 100;
const MAX_FOOD = 100;
const WATER_PER_GAME_DAY_SEA = 1.2;
const FOOD_PER_GAME_DAY_SEA = 1.0;
const WATER_PER_GAME_DAY_LAND = 1.8;
const FOOD_PER_GAME_DAY_LAND = 1.2;
const TEACHER_CLOCK_TIMEOUT_MS = 8000;
const TICK_HZ = 20;
const SNAPSHOT_HZ = 10;
const NEARBY_RADIUS = 34 * TILE;
const MAX_ROOM_PLAYERS = 45;
const PORT_RADIUS = 2.15 * TILE;
const LAND_GATE_RADIUS = 2.25 * TILE;
const MAX_MISSION_TITLE = 50;
const MAX_MISSION_TEXT = 500;
const store = new ClassroomStore();
// v23부터는 복합 단계형 미션을 사용하지 않는다. 이전 버전의 진행 상태는 자동 정리한다.
for (const room of Object.values(store.state?.rooms || {})) {
  if (room.activeMission && room.activeMission.kind !== 'arrivalRace') {
    room.activeMission = null;
    room.progress = {};
  }
}
store.scheduleSave();

const worldBuffer = fs.readFileSync(path.join(__dirname, 'data', 'world', 'WORLD.CDS'));
if (worldBuffer.length !== WORLD_W * WORLD_H * 2) {
  throw new Error(`WORLD.CDS 크기 불일치: ${worldBuffer.length}`);
}
const world = new Uint16Array(worldBuffer.buffer, worldBuffer.byteOffset, worldBuffer.length / 2);

function nearestTerrainPoint(baseX, baseY, predicate, maxRadiusTiles = 36) {
  const cx = Math.round(baseX / TILE);
  const cy = Math.round(baseY / TILE);
  let best = null;
  let bestDistance = Infinity;
  for (let radius = 0; radius <= maxRadiusTiles; radius += 1) {
    for (let oy = -radius; oy <= radius; oy += 1) {
      for (let ox = -radius; ox <= radius; ox += 1) {
        if (radius > 0 && Math.abs(ox) !== radius && Math.abs(oy) !== radius) continue;
        const tx = ((cx + ox) % WORLD_W + WORLD_W) % WORLD_W;
        const ty = Math.max(1, Math.min(WORLD_H - 2, cy + oy));
        const px = (tx + 0.5) * TILE;
        const py = (ty + 0.5) * TILE;
        const terrain = terrainAtPixelRaw(px, py);
        if (!predicate(terrain)) continue;
        const d = Math.hypot(ox, oy);
        if (d < bestDistance) {
          bestDistance = d;
          best = { x: px, y: py, terrain: terrain.type };
        }
      }
    }
    if (best) return best;
  }
  return { x: wrapX(baseX), y: Math.max(TILE, Math.min(WORLD_PIXEL_H - TILE, baseY)), terrain: terrainAtPixelRaw(baseX, baseY).type };
}

function terrainAtPixelRaw(x, y) {
  return Terrain.terrainAtPixel(world, x, y);
}

function defaultArrivalRadiusTiles(source) {
  const explicit = Number(source?.arrivalRadiusTiles);
  if (Number.isFinite(explicit) && explicit > 0) return Math.max(2, Math.min(80, explicit));
  const byCategory = { '반도':18, '제도':26, '열도':30, '사막':24, '산맥':24, '강 하구':8, '삼각주':8, '지협':8, '폭포':6, '해협':6, '곶':6, '지구대':14, '항구 도시':3.2, '도시':3.5 };
  return byCategory[source?.category] || (source?.access === 'port' ? 3.1 : 6);
}

function resolveCatalog() {
  const byId = new Map();
  for (const source of MissionCatalog.PLACES) {
    const cell = MissionCatalog.placeCell(source);
    const baseX = cell.x * TILE;
    const baseY = cell.y * TILE;
    const seaPoint = nearestTerrainPoint(baseX, baseY, (terrain) => terrain.type === 'sea');
    const preferredTypes = source.category === '산맥' ? ['mountain']
      : source.category === '사막' ? ['desert']
      : ['강 하구', '삼각주', '폭포'].includes(source.category) ? ['river', 'coast']
      : source.category === '지협' ? ['coast', 'plain']
      : source.category === '지구대' ? ['plain', 'mountain']
      : [];
    const preferredSearchRadius = source.category === '산맥' ? 70 : 24;
    const preferredLandPoint = preferredTypes.length
      ? nearestTerrainPoint(baseX, baseY, (terrain) => preferredTypes.includes(terrain.type) && terrain.passable, preferredSearchRadius)
      : null;
    const landPoint = preferredLandPoint && preferredTypes.includes(preferredLandPoint.terrain)
      ? preferredLandPoint
      : nearestTerrainPoint(baseX, baseY, (terrain) => terrain.type !== 'sea' && terrain.passable);
    const exactCellPoint = (cell, fallback) => Array.isArray(cell) && cell.length >= 2
      ? { x: (Number(cell[0]) + 0.5) * TILE, y: (Number(cell[1]) + 0.5) * TILE, terrain: terrainAtPixelRaw((Number(cell[0]) + 0.5) * TILE, (Number(cell[1]) + 0.5) * TILE).type }
      : fallback;
    const originalMarkerPoints = source.isOriginalCity && Array.isArray(source.originalMarkerCells)
      ? source.originalMarkerCells.map((cell) => exactCellPoint(cell, null)).filter(Boolean)
      : [];
    const originalSeaEntryPoints = source.isOriginalCity && Array.isArray(source.originalSeaEntryCells)
      ? source.originalSeaEntryCells.map((cell) => exactCellPoint(cell, null)).filter(Boolean)
      : [];
    const originalLandEntryPoints = source.isOriginalCity && Array.isArray(source.originalLandEntryCells)
      ? source.originalLandEntryCells.map((cell) => exactCellPoint(cell, null)).filter(Boolean)
      : [];
    const markerCenter = originalMarkerPoints.length
      ? {
          x: originalMarkerPoints.reduce((sum, item) => sum + item.x, 0) / originalMarkerPoints.length,
          y: originalMarkerPoints.reduce((sum, item) => sum + item.y, 0) / originalMarkerPoints.length,
          terrain: 'city'
        }
      : { x: baseX, y: baseY, terrain: terrainAtPixelRaw(baseX, baseY).type };
    const exactSeaPoint = exactCellPoint(source.originalSeaSpawnCell, originalSeaEntryPoints[0] || seaPoint);
    const exactLandPoint = exactCellPoint(source.originalLandSpawnCell, originalLandEntryPoints[0] || landPoint);
    const cityPoint = source.isOriginalCity ? markerCenter : landPoint;
    const resolvedSeaPoint = source.isOriginalCity ? exactSeaPoint : seaPoint;
    const resolvedLandPoint = source.isOriginalCity ? exactLandPoint : landPoint;
    const point = source.isOriginalCity
      ? (source.canEnterFromSea ? resolvedSeaPoint : resolvedLandPoint)
      : source.access === 'sea' ? seaPoint : source.access === 'land' ? landPoint : seaPoint;
    byId.set(source.id, {
      ...source,
      x: point.x,
      y: point.y,
      point,
      cityPoint,
      seaPoint: resolvedSeaPoint,
      landPoint: resolvedLandPoint,
      originalMarkerPoints,
      originalSeaEntryPoints,
      originalLandEntryPoints,
      arrivalRadiusTiles: defaultArrivalRadiusTiles(source),
      interactionRadiusTiles: source.isOriginalCity ? 3.2 : Math.max(2.2, Math.min(8, Number(source.interactionRadiusTiles) || 3.2))
    });
  }
  return byId;
}

const RESOLVED_PLACES = resolveCatalog();
const ITEM_BY_ID = new Map(MissionCatalog.ITEMS.map((item) => [item.id, item]));
const TEMPLATE_BY_ID = new Map(MissionCatalog.TEMPLATES.map((template) => [template.id, template]));
const READY_BY_ID = new Map(MissionCatalog.READY_MISSIONS.map((mission) => [mission.id, mission]));

function publicMissionCatalog() {
  const base = MissionCatalog.publicCatalog();
  return {
    ...base,
    places: base.places.map((place) => {
      const resolved = RESOLVED_PLACES.get(place.id);
      return {
        ...place,
        point: resolved ? { x: resolved.point.x, y: resolved.point.y } : null,
        cityPoint: resolved ? { x: resolved.cityPoint.x, y: resolved.cityPoint.y } : null,
        seaPoint: resolved ? { x: resolved.seaPoint.x, y: resolved.seaPoint.y } : null,
        landPoint: resolved ? { x: resolved.landPoint.x, y: resolved.landPoint.y } : null,
        arrivalRadiusTiles: resolved?.arrivalRadiusTiles || null
      };
    })
  };
}

const app = express();
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.gz')) res.setHeader('Content-Type', 'application/gzip');
  }
}));
app.get('/api/mission-catalog', (_req, res) => res.json(publicMissionCatalog()));
app.get('/health', (_req, res) => res.json({
  ok: true,
  version: 35,
  rooms: rooms.size,
  players: playerCount(),
  seaBaseSpeed: SEA_BASE_SPEED,
  landBaseSpeed: LAND_BASE_SPEED,
  completionSpeedMultiplier: COMPLETION_SPEED_MULTIPLIER,
  currentTailAssistPercent: Math.round(CURRENT_TAIL_FACTOR * 100),
  currentHeadPenaltyPercent: Math.round(CURRENT_HEAD_FACTOR * 100),
  gameHoursPerRealSecond: GAME_HOURS_PER_REAL_SECOND,
  landMode: true,
  missionSystem: 'one-destination-four-start-cities-teacher-start-gated-arrival-race',
  originalCityCount: MissionCatalog.ORIGINAL_CITIES.length,
  originalPortCityCount: MissionCatalog.ORIGINAL_CITIES.filter((place) => place.canEnterFromSea === true).length,
  originalCityAccessRule: 'WORLD.CDS marker adjacency (original behavior)',
  allOriginalPortTransitions: true,
  mapCityLabels: true,
  destinationArrivalZones: Object.keys(ARRIVAL_ZONES).length,
  expeditionJournal: false,
  minimalStudentState: true,
  oceanCurrentAnimation: 'pending-original-waves-decode',
  oceanCurrentAffectsMovement: true,
  visualWeather: [],
  sharedClassClock: true,
  teacherClockAuthority: true,
  timedPortOperations: true,
  directSeaLandTransfer: true,
  fatigueAffectsSeaAndLandSpeed: true,
  fatigueSlowdownStart: Fatigue.FATIGUE_SLOWDOWN_START,
  fatigueMinSpeedPercent: Math.round(Fatigue.MIN_SPEED_MULTIPLIER * 100),
  topStatusBar: ['date','latitudeLongitude','fatigue'],
  bottomGuideWindow: true,
  suppliesConsumeWithSharedClock: false,
  persistedStudentState: ['selectedStartCity', 'missionStatus', 'finishRank', 'completionTime'],
  teacherControls: true,
  persistenceFile: store.filePath
}));

const server = http.createServer(app);
const io = new Server(server, {
  serveClient: true,
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 64 * 1024,
  pingInterval: 10000,
  pingTimeout: 12000
});

const rooms = new Map();
const teachers = new Map();
const missionRuntime = new Map();
const roomClocks = new Map();

function clockForRoom(roomCode) {
  if (!roomClocks.has(roomCode)) {
    roomClocks.set(roomCode, {
      baseGameMinutes: Number(store.room(roomCode).clock?.gameMinutes || 0),
      baseServerMs: Date.now(),
      ownerSocketId: null,
      lastTeacherSyncAt: 0
    });
  }
  return roomClocks.get(roomCode);
}

function classGameMinutes(roomCode, now = Date.now()) {
  const clock = clockForRoom(roomCode);
  const settings = store.room(roomCode).settings;
  const ownerAlive = clock.ownerSocketId
    && io.sockets.sockets.has(clock.ownerSocketId)
    && now - clock.lastTeacherSyncAt <= TEACHER_CLOCK_TIMEOUT_MS;
  if (settings.paused || !ownerAlive) return clock.baseGameMinutes;
  return clock.baseGameMinutes + ((now - clock.baseServerMs) / 1000) * GAME_HOURS_PER_REAL_SECOND * 60;
}

function freezeClassClock(roomCode, now = Date.now()) {
  const clock = clockForRoom(roomCode);
  clock.baseGameMinutes = classGameMinutes(roomCode, now);
  clock.baseServerMs = now;
  store.setRoomClock(roomCode, clock.baseGameMinutes);
  return clock.baseGameMinutes;
}

function claimTeacherClock(roomCode, socketId) {
  const now = Date.now();
  const clock = clockForRoom(roomCode);
  clock.baseGameMinutes = classGameMinutes(roomCode, now);
  clock.baseServerMs = now;
  clock.ownerSocketId = socketId;
  clock.lastTeacherSyncAt = now;
  return clock.baseGameMinutes;
}

function syncTeacherClock(roomCode, socketId, reportedGameMinutes) {
  const clock = clockForRoom(roomCode);
  if (clock.ownerSocketId !== socketId) return null;
  const value = Number(reportedGameMinutes);
  if (!Number.isFinite(value) || value < 0) return null;
  const now = Date.now();
  const expected = classGameMinutes(roomCode, now);
  const maxCorrection = GAME_HOURS_PER_REAL_SECOND * 60 * 4;
  clock.baseGameMinutes = Math.max(0, Math.min(expected + maxCorrection, Math.max(expected - maxCorrection, value)));
  clock.baseServerMs = now;
  clock.lastTeacherSyncAt = now;
  store.room(roomCode).clock.gameMinutes = clock.baseGameMinutes;
  return clock.baseGameMinutes;
}

function releaseTeacherClock(socketId) {
  const now = Date.now();
  for (const [roomCode, clock] of roomClocks) {
    if (clock.ownerSocketId !== socketId) continue;
    freezeClassClock(roomCode, now);
    clock.ownerSocketId = null;
    clock.lastTeacherSyncAt = 0;
  }
}

function runtimeKey(roomCode, studentName, missionId) {
  return `${roomCode}\u0000${studentName}\u0000${missionId}`;
}

function runtimeProgressFor(roomCode, studentName, missionId, create = true) {
  if (!missionId) return null;
  const key = runtimeKey(roomCode, studentName, missionId);
  if (!missionRuntime.has(key) && create) {
    missionRuntime.set(key, {
      started: false,
      distanceTiles: 0,
      terrainDistanceTiles: {},
      visitedTerrains: new Set(),
      returnCompleted: false
    });
  }
  return missionRuntime.get(key) || null;
}

function clearMissionRuntime(roomCode) {
  const prefix = `${roomCode}\u0000`;
  for (const key of missionRuntime.keys()) if (key.startsWith(prefix)) missionRuntime.delete(key);
}

function playerCount() {
  let total = 0;
  for (const room of rooms.values()) total += room.size;
  return total;
}

function cleanName(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[^0-9A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ _-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12);
}

function cleanRoom(value) {
  return String(value || '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[^0-9A-Z가-힣_-]/g, '')
    .slice(0, 10);
}


function generateClassCode() {
  const used = new Set([
    ...rooms.keys(),
    ...teachers.values(),
    ...Object.keys(store.state?.rooms || {})
  ]);
  for (let i = 0; i < 2000; i += 1) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    if (!used.has(code)) return code;
  }
  throw new Error('사용 가능한 학급 코드를 만들지 못했습니다. 잠시 후 다시 시도하세요.');
}

function isValidClassCode(value) {
  return /^\d{6}$/.test(String(value || ''));
}

function cleanText(value, maxLength = MAX_MISSION_TEXT) {
  return String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function cleanMissionKind(value) {
  return ['location', 'terrain', 'exploration', 'staged'].includes(value) ? value : 'location';
}


function cleanMissionMode(value) {
  return ['any', 'sea', 'land', 'city'].includes(value) ? value : 'any';
}

function cleanMarkerMode(value) {
  return ['hidden', 'area', 'exact'].includes(value) ? value : 'hidden';
}

function finiteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isArrivalRace(mission) {
  return mission?.kind === 'arrivalRace' && Array.isArray(mission.startOptions) && mission.targetPlace;
}

function isStartChoiceSet(mission) {
  return mission?.kind === 'startChoiceSet' && Array.isArray(mission.startOptions);
}

function arrivalRaceTravelGate(player) {
  if (!player) return { ok: false, error: '학생 접속 상태가 아닙니다.' };
  const mission = store.room(player.roomCode).activeMission;
  if (!isArrivalRace(mission)) return { ok: false, error: '교사가 미션을 준비할 때까지 기다리세요.' };
  const progress = progressFor(player.roomCode, player.name, mission.id, false);
  if (!progress?.selectedStartPlaceId) return { ok: false, error: '먼저 출발 도시를 선택하세요.' };
  if (mission.phase !== 'running') return { ok: false, error: '출발 준비 완료. 교사가 출발 버튼을 누를 때까지 기다리세요.' };
  return { ok: true, mission, progress, completed: progress.status === 'completed' };
}

function selectedMission(activeMission, progress) {
  if (!activeMission) return null;
  if (isArrivalRace(activeMission)) return progress?.selectedStartPlaceId ? activeMission : null;
  if (!isStartChoiceSet(activeMission)) return activeMission;
  if (!progress?.selectedMissionId) return null;
  return activeMission.startOptions.find((option) => option.id === progress.selectedMissionId) || null;
}

function startOptionSummary(option) {
  const source = option.startPlace || option;
  return {
    id: option.id || source.id,
    startPlace: source ? {
      id: source.id,
      name: source.name,
      region: source.region || '',
      continent: source.continent || '',
      atlasHint: source.atlasHint || ''
    } : null
  };
}

function missionForStudentWithProgress(activeMission, progress) {
  if (!activeMission) return null;
  if (isArrivalRace(activeMission)) return missionForStudent(activeMission);
  if (!isStartChoiceSet(activeMission)) return missionForStudent(activeMission);
  const chosen = selectedMission(activeMission, progress);
  if (chosen) return missionForStudent(chosen);
  return {
    id: activeMission.id,
    title: activeMission.title,
    instructions: activeMission.instructions,
    atlasInstruction: activeMission.atlasInstruction || '',
    goalLabel: activeMission.goalLabel || '',
    kind: 'startChoiceSet',
    mode: 'any',
    startOptions: activeMission.startOptions.map(startOptionSummary),
    createdAt: activeMission.createdAt
  };
}

function missionContext(roomCode, studentName, create = true) {
  const activeMission = store.room(roomCode).activeMission;
  const progress = activeMission ? progressFor(roomCode, studentName, activeMission.id, create) : null;
  return { activeMission, mission: selectedMission(activeMission, progress), progress };
}

function missionForStudent(mission) {
  if (!mission) return null;
  return {
    id: mission.id,
    title: mission.title,
    instructions: mission.instructions,
    kind: mission.kind,
    mode: mission.mode,
    target: mission.target,
    criteria: mission.criteria,
    templateId: mission.templateId || null,
    atlasInstruction: mission.atlasInstruction || '',
    markerMode: mission.markerMode || 'hidden',
    phase: mission.phase || null,
    startedAtGameMinutes: Number.isFinite(mission.startedAtGameMinutes) ? mission.startedAtGameMinutes : null,
    item: mission.item || null,
    targetPlace: mission.targetPlace ? {
      id: mission.targetPlace.id,
      name: mission.targetPlace.name,
      category: mission.targetPlace.category || '',
      region: mission.targetPlace.region || '',
      continent: mission.targetPlace.continent || '',
      atlasHint: mission.targetPlace.atlasHint || '',
      mode: mission.targetPlace.mode,
      radiusTiles: mission.targetPlace.radiusTiles
    } : null,
    startOptions: Array.isArray(mission.startOptions) ? mission.startOptions.map(startOptionSummary) : null,
    stages: Array.isArray(mission.stages) ? mission.stages.map((stage) => ({
      id: stage.id,
      type: stage.type,
      label: stage.label,
      instruction: stage.instruction,
      mode: stage.mode,
      point: stage.point,
      radiusTiles: stage.radiusTiles,
      actionRequired: stage.actionRequired === true,
      actionLabel: stage.actionLabel || '',
      placeName: stage.placeName || '',
      facility: stage.facility || '',
      item: stage.item || null
    })) : null,
    createdAt: mission.createdAt
  };
}

function missionForTeacher(mission) {
  return mission ? JSON.parse(JSON.stringify(mission)) : null;
}

function progressFor(roomCode, studentName, missionId, create = true) {
  if (!missionId) return null;
  return store.studentProgress(roomCode, studentName, missionId, create);
}

function missionStatusLabel(status) {
  return ({ assigned: '수행 전', inProgress: '수행 중', completed: '완료' })[status] || status;
}

function publicProgress(progress, mission = null) {
  if (!progress) return null;
  const stageCount = Array.isArray(mission?.stages) ? mission.stages.length : 0;
  const stageIndex = Math.max(0, Math.min(stageCount || 20, Number(progress.stageIndex || 0)));
  let selectedStartPlace = null;
  if (isArrivalRace(mission) && progress.selectedStartPlaceId) {
    selectedStartPlace = mission.startOptions.find((option) => option.startPlace?.id === progress.selectedStartPlaceId)?.startPlace || null;
  } else if (mission?.startPlace) {
    selectedStartPlace = mission.startPlace;
  }
  return {
    status: progress.status || 'assigned',
    statusLabel: missionStatusLabel(progress.status || 'assigned'),
    stageIndex,
    stageCount,
    cargoItemId: progress.cargoItemId || null,
    selectedMissionId: progress.selectedMissionId || null,
    selectedStartPlaceId: progress.selectedStartPlaceId || selectedStartPlace?.id || null,
    selectedStartPlaceName: selectedStartPlace?.name || null,
    selectedMissionTitle: mission?.title || null,
    completedAt: Number.isFinite(progress.completedAt) ? progress.completedAt : null,
    completedGameMinutes: Number.isFinite(progress.completedGameMinutes) ? progress.completedGameMinutes : null,
    finishRank: Number.isFinite(progress.finishRank) ? progress.finishRank : null
  };
}

function missionProgressList(roomCode, missionId) {
  if (!missionId) return [];
  const state = store.room(roomCode);
  const activeMission = state.activeMission?.id === missionId ? state.activeMission : null;
  return Object.entries(state.progress).map(([name, missions]) => {
    const progress = missions[missionId] || { status: 'assigned' };
    const mission = isArrivalRace(activeMission) ? activeMission : selectedMission(activeMission, progress);
    return { name, ...publicProgress(progress, mission) };
  });
}

function sanitizeMission(payload, roomCode) {
  const kind = cleanMissionKind(payload?.kind);
  const mode = cleanMissionMode(payload?.mode);
  const title = cleanText(payload?.title, MAX_MISSION_TITLE);
  const instructions = cleanText(payload?.instructions, MAX_MISSION_TEXT);
  if (title.length < 2) throw new Error('미션 제목을 두 글자 이상 입력하세요.');
  if (instructions.length < 2) throw new Error('미션 설명을 입력하세요.');

  let target = null;
  let criteria = null;
  if (kind === 'location') {
    const x = wrapX(finiteNumber(payload?.target?.x, LISBON.harbor.x));
    const y = Math.max(TILE, Math.min(WORLD_PIXEL_H - TILE, finiteNumber(payload?.target?.y, LISBON.harbor.y)));
    const radiusTiles = Math.max(0.75, Math.min(16, finiteNumber(payload?.target?.radiusTiles, 2.2)));
    target = { x, y, radiusTiles, label: cleanText(payload?.target?.label, 40) || '학습 지점' };
  } else if (kind === 'terrain') {
    const allowedTerrains = ['plain', 'coast', 'river', 'forest', 'desert', 'mountain'];
    const terrainType = allowedTerrains.includes(payload?.criteria?.terrainType) ? payload.criteria.terrainType : 'plain';
    const minDistanceTiles = Math.max(1, Math.min(200, finiteNumber(payload?.criteria?.minDistanceTiles, 8)));
    criteria = { terrainType, minDistanceTiles };
  } else {
    const minDistanceTiles = Math.max(1, Math.min(500, finiteNumber(payload?.criteria?.minDistanceTiles, 20)));
    const minTerrainTypes = Math.max(1, Math.min(6, Math.round(finiteNumber(payload?.criteria?.minTerrainTypes, 2))));
    criteria = { minDistanceTiles, minTerrainTypes, requireReturnToCity: payload?.criteria?.requireReturnToCity === true };
  }

  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    roomCode, title, instructions, kind, mode, target, criteria, createdAt: Date.now()
  };
}



function catalogPlace(id, label = '지점') {
  const place = RESOLVED_PLACES.get(String(id || ''));
  if (!place) throw new Error(`${label}을(를) 지명 목록에서 선택하세요.`);
  return place;
}

function catalogItem(id) {
  const item = ITEM_BY_ID.get(String(id || ''));
  if (!item) throw new Error('운송할 물품을 선택하세요.');
  return item;
}

function withObjectParticle(text) {
  const value = String(text || '');
  const last = value.charCodeAt(value.length - 1);
  const hasBatchim = last >= 0xac00 && last <= 0xd7a3 ? ((last - 0xac00) % 28) !== 0 : false;
  return `${value}${hasBatchim ? '을' : '를'}`;
}

function facilityFor(place, requested, fallback) {
  const value = cleanText(requested, 30);
  if (value) return value;
  return place.facilities?.[0] || fallback;
}

function pointForMode(place, mode) {
  if (mode === 'land') return { x: place.landPoint.x, y: place.landPoint.y };
  return { x: place.seaPoint.x, y: place.seaPoint.y };
}

function makeStage({ id, type, place, mode, label, instruction, radiusTiles = null, arrivalRadiusTiles = null, actionRequired = true, actionLabel = '', facility = '', item = null, transitionTo = null, transitionPoint = null }) {
  const exactRadius = Math.max(1.5, Math.min(12, Number(radiusTiles) || place.interactionRadiusTiles || 3.2));
  const arrivalRadius = Math.max(exactRadius, Math.min(80, Number(arrivalRadiusTiles) || place.arrivalRadiusTiles || exactRadius));
  return {
    id,
    type,
    placeId: place.id,
    placeName: place.name,
    mode,
    point: pointForMode(place, mode),
    radiusTiles: exactRadius,
    arrivalRadiusTiles: arrivalRadius,
    label,
    instruction,
    actionRequired,
    actionLabel,
    facility,
    item: item ? { id: item.id, name: item.name } : null,
    transitionTo,
    transitionPoint
  };
}

function buildGeneratedMission(payload, roomCode) {
  const ready = payload?.readyMissionId ? READY_BY_ID.get(String(payload.readyMissionId)) : null;
  const config = { ...(ready || {}), ...(payload || {}) };
  const templateId = String(config.templateId || 'landmark');
  if (!TEMPLATE_BY_ID.has(templateId)) throw new Error('미션 유형을 선택하세요.');
  const markerMode = cleanMarkerMode(config.markerMode);
  const stages = [];
  let title = '';
  let instructions = '';
  let atlasInstruction = '';
  let item = null;

  if (templateId === 'transport') {
    const source = catalogPlace(config.sourcePlaceId, '출발 도시');
    const target = catalogPlace(config.targetPlaceId, '목적 도시');
    if (source.canEnterFromSea !== true || target.canEnterFromSea !== true) throw new Error('도시 간 운송은 항구 도시를 선택하세요.');
    item = catalogItem(config.itemId);
    const sourceFacility = facilityFor(source, config.sourceFacility, '항구 창고');
    const targetFacility = facilityFor(target, config.targetFacility, '항구 창고');
    title = `${source.name} → ${target.name} ${item.name} 운송`;
    atlasInstruction = `사회과부도에서 ${source.name}과 ${target.name}의 위치를 각각 찾고, 두 도시가 접한 바다와 이동 방향을 확인하세요.`;
    instructions = `${source.name} ${sourceFacility}에서 ${withObjectParticle(item.name)} 구입한 뒤 ${target.name} ${targetFacility}에 전달하세요.`;
    stages.push(makeStage({ id:'collect', type:'collect', place:source, mode:'sea', label:`${source.name}에서 물품 구입`, instruction:`${source.name} ${sourceFacility}에 접근해 ${withObjectParticle(item.name)} 구입하세요.`, actionLabel:`${item.name} 구입`, facility:sourceFacility, item }));
    stages.push(makeStage({ id:'deliver', type:'deliver', place:target, mode:'sea', label:`${target.name}에 물품 전달`, instruction:`${target.name} ${targetFacility}에 ${withObjectParticle(item.name)} 전달하세요.`, actionLabel:`${item.name} 전달`, facility:targetFacility, item }));
  } else if (templateId === 'landmark') {
    const target = catalogPlace(config.targetPlaceId, '탐험할 지형');
    if (target.canEnterFromSea === true) throw new Error('주요 지형을 선택하세요.');
    title = `${target.name} 탐험`;
    atlasInstruction = `사회과부도에서 ${target.name}을 찾아 표시하고, ${target.atlasHint}을(를) 확인하세요.`;
    instructions = `${target.name}의 실제 위치를 사회과부도에서 확인한 뒤 게임 지도에서 해당 지형을 찾아 조사하세요.`;
    if (target.access === 'land') {
      const landing = catalogPlace(target.landingPortId, '상륙 항구');
      stages.push(makeStage({ id:'land', type:'disembark', place:landing, mode:'sea', label:`${landing.name}에서 상륙`, instruction:`${landing.name} 부근에 도착해 탐험대를 상륙시키세요.`, actionLabel:'탐험대 상륙', transitionTo:'land', transitionPoint:{ x:landing.landPoint.x, y:landing.landPoint.y }, radiusTiles:3 }));
      stages.push(makeStage({ id:'arrive', type:'arriveLandmark', place:target, mode:'land', label:`${target.name} 도착`, instruction:`육상 탐험대로 ${target.name} 영역에 들어가세요.`, actionRequired:false, actionLabel:'', radiusTiles:target.arrivalRadiusTiles, arrivalRadiusTiles:target.arrivalRadiusTiles }));
    } else {
      stages.push(makeStage({ id:'arrive', type:'arriveLandmark', place:target, mode:'sea', label:`${target.name} 도착`, instruction:`배로 ${target.name} 영역에 들어가세요.`, actionRequired:false, actionLabel:'', radiusTiles:target.arrivalRadiusTiles, arrivalRadiusTiles:target.arrivalRadiusTiles }));
    }
  } else if (templateId === 'supply_landmark') {
    const source = catalogPlace(config.sourcePlaceId, '출발 도시');
    const target = catalogPlace(config.targetPlaceId, '목적 지형');
    if (source.canEnterFromSea !== true || target.canEnterFromSea === true) throw new Error('출발 항구 도시와 목적 지형을 선택하세요.');
    item = catalogItem(config.itemId);
    const sourceFacility = facilityFor(source, config.sourceFacility, '항구 창고');
    const targetFacility = cleanText(config.targetFacility, 30) || `${target.category} 조사대`;
    title = `${target.name} 조사대에 ${item.name} 전달`;
    atlasInstruction = `사회과부도에서 ${source.name}과 ${target.name}을 찾고, ${target.atlasHint}을(를) 확인하세요.`;
    instructions = `${source.name} ${sourceFacility}에서 ${withObjectParticle(item.name)} 구입해 ${target.name}의 ${targetFacility}에 전달하세요.`;
    stages.push(makeStage({ id:'collect', type:'collect', place:source, mode:'sea', label:`${source.name}에서 물품 구입`, instruction:`${source.name} ${sourceFacility}에 접근해 ${withObjectParticle(item.name)} 구입하세요.`, actionLabel:`${item.name} 구입`, facility:sourceFacility, item }));
    if (target.access === 'land') {
      const landing = catalogPlace(target.landingPortId, '상륙 항구');
      stages.push(makeStage({ id:'land', type:'disembark', place:landing, mode:'sea', label:`${landing.name}에서 상륙`, instruction:`${landing.name} 부근에 도착해 탐험대를 상륙시키세요.`, actionLabel:'탐험대 상륙', transitionTo:'land', transitionPoint:{ x:landing.landPoint.x, y:landing.landPoint.y }, radiusTiles:3 }));
      stages.push(makeStage({ id:'arrive', type:'arriveLandmark', place:target, mode:'land', label:`${target.name} 도착`, instruction:`육상 탐험대로 ${target.name} 영역에 들어가세요.`, actionRequired:false, actionLabel:'', radiusTiles:target.arrivalRadiusTiles, arrivalRadiusTiles:target.arrivalRadiusTiles }));
      stages.push(makeStage({ id:'deliver', type:'deliver', place:target, mode:'land', label:`${target.name} 조사대에 전달`, instruction:`${target.name} 조사 지점에 가까이 이동해 ${withObjectParticle(item.name)} ${targetFacility}에 전달하세요.`, actionLabel:`${item.name} 전달`, facility:targetFacility, item, radiusTiles:target.interactionRadiusTiles, arrivalRadiusTiles:target.arrivalRadiusTiles }));
    } else {
      stages.push(makeStage({ id:'arrive', type:'arriveLandmark', place:target, mode:'sea', label:`${target.name} 도착`, instruction:`배로 ${target.name} 영역에 들어가세요.`, actionRequired:false, actionLabel:'', radiusTiles:target.arrivalRadiusTiles, arrivalRadiusTiles:target.arrivalRadiusTiles }));
      stages.push(makeStage({ id:'deliver', type:'deliver', place:target, mode:'sea', label:`${target.name} 조사대에 전달`, instruction:`${target.name} 조사 지점에 가까이 이동해 ${withObjectParticle(item.name)} ${targetFacility}에 전달하세요.`, actionLabel:`${item.name} 전달`, facility:targetFacility, item, radiusTiles:target.interactionRadiusTiles, arrivalRadiusTiles:target.arrivalRadiusTiles }));
    }
  } else if (templateId === 'sea_route') {
    const source = catalogPlace(config.sourcePlaceId, '출발 도시');
    const via = catalogPlace(config.viaPlaceId, '통과할 지형');
    const target = catalogPlace(config.targetPlaceId, '목적 도시');
    if (source.canEnterFromSea !== true || target.canEnterFromSea !== true || via.access !== 'sea') throw new Error('출발·목적 항구와 해상 지형을 올바르게 선택하세요.');
    title = `${via.name} 통과 항로`;
    atlasInstruction = `사회과부도에서 ${source.name}, ${via.name}, ${target.name}을 차례로 찾고 항로의 방향을 확인하세요.`;
    instructions = `${source.name}에서 항로를 시작해 ${via.name}을 통과한 뒤 ${target.name}에 도착하세요.`;
    stages.push(makeStage({ id:'start', type:'start', place:source, mode:'sea', label:`${source.name}에서 항로 시작`, instruction:`${source.name} 항구에서 항로 조사를 시작하세요.`, actionLabel:'항로 시작' }));
    stages.push(makeStage({ id:'via', type:'waypoint', place:via, mode:'sea', label:`${via.name} 통과`, instruction:`사회과부도에서 찾은 ${via.name}을 실제로 통과하세요.`, actionRequired:false, actionLabel:'' , radiusTiles:3.2 }));
    stages.push(makeStage({ id:'arrive', type:'arrive', place:target, mode:'sea', label:`${target.name} 도착`, instruction:`${target.name} 항구에 도착해 항로 조사를 마치세요.`, actionLabel:'도착 확인' }));
  }

  const customTitle = cleanText(config.title, MAX_MISSION_TITLE);
  const customInstructions = cleanText(config.instructions, MAX_MISSION_TEXT);
  if (customTitle) title = customTitle;
  if (customInstructions) instructions = customInstructions;
  if (!stages.length) throw new Error('미션 단계를 만들지 못했습니다.');
  const finalStage = stages[stages.length - 1];
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    roomCode,
    kind:'staged',
    mode:'any',
    templateId,
    title,
    instructions,
    atlasInstruction,
    markerMode,
    item: item ? { id:item.id, name:item.name, category:item.category } : null,
    stages,
    target:{ x:finalStage.point.x, y:finalStage.point.y, radiusTiles:finalStage.arrivalRadiusTiles || finalStage.radiusTiles, label:finalStage.placeName },
    criteria:null,
    createdAt:Date.now()
  };
}

function commonMissionGoal(config) {
  const templateId = String(config.templateId || 'landmark');
  if (templateId === 'transport') {
    const target = catalogPlace(config.targetPlaceId, '목적 도시');
    const item = catalogItem(config.itemId);
    return { title:`${target.name}에 ${item.name} 운송`, label:target.name };
  }
  if (templateId === 'supply_landmark') {
    const target = catalogPlace(config.targetPlaceId, '목적 지형');
    const item = catalogItem(config.itemId);
    return { title:`${target.name} 조사대에 ${item.name} 전달`, label:target.name };
  }
  if (templateId === 'sea_route') {
    const via = catalogPlace(config.viaPlaceId, '통과할 지형');
    const target = catalogPlace(config.targetPlaceId, '목적 도시');
    return { title:`${via.name}을 통과해 ${target.name} 도착`, label:`${via.name} · ${target.name}` };
  }
  const target = catalogPlace(config.targetPlaceId, '탐험할 지형');
  return { title:`${target.name} 탐험`, label:target.name };
}

function buildStartChoiceSet(payload, roomCode) {
  const readyMissionId = String(payload?.readyMissionId || '');
  const preset = READY_BY_ID.get(readyMissionId);
  if (!preset) throw new Error('공통 미션을 기본 미션 목록에서 선택하세요.');
  const ids = Array.isArray(payload?.startPlaceIds) ? payload.startPlaceIds.map(String) : [];
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length !== 3) throw new Error('서로 다른 출발 도시 4곳을 선택하세요.');
  const starts = unique.map((id) => {
    const place = catalogPlace(id, '출발 도시');
    if (place.canEnterFromSea !== true) throw new Error('출발지는 항구 도시만 선택할 수 있습니다.');
    return place;
  });
  const configBase = { ...preset };
  const goal = commonMissionGoal(configBase);
  const commonTitle = cleanText(payload?.title, MAX_MISSION_TITLE) || goal.title;
  const startOptions = starts.map((start) => {
    const config = { ...configBase };
    if (['transport', 'supply_landmark', 'sea_route'].includes(config.templateId)) config.sourcePlaceId = start.id;
    if (config.targetPlaceId === start.id) throw new Error(`${start.name}은(는) 목적지와 같아 출발 도시로 사용할 수 없습니다.`);
    const mission = buildGeneratedMission({ ...config, title: commonTitle }, roomCode);
    mission.startPlace = {
      id:start.id,
      name:start.name,
      region:start.region || '',
      continent:start.continent || '',
      atlasHint:start.atlasHint || '',
      point:{ x:start.seaPoint.x, y:start.seaPoint.y }
    };
    return mission;
  });
  return {
    id: `start-choice-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    roomCode,
    kind: 'startChoiceSet',
    mode: 'any',
    templateId: configBase.templateId,
    readyMissionId,
    title: commonTitle,
    goalLabel: goal.label,
    atlasInstruction: `사회과부도에서 ${goal.label}과 출발 도시 네 곳의 위치를 찾고, 거리와 방향을 비교하세요.`,
    instructions: cleanText(payload?.instructions, MAX_MISSION_TEXT) || `모든 학생의 목표는 같습니다. 사회과부도를 보고 출발 도시 네 곳 중 한 곳을 선택한 뒤 ${goal.label}까지 스스로 이동하세요. 선택 후에는 출발 도시를 바꿀 수 없습니다.`,
    startOptions,
    createdAt: Date.now()
  };
}

function buildArrivalRace(payload, roomCode) {
  const target = catalogPlace(payload?.targetPlaceId, '도착 도시 또는 지형');
  const ids = Array.isArray(payload?.startPlaceIds) ? payload.startPlaceIds.map(String) : [];
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length !== 4) throw new Error('서로 다른 출발 도시 4곳을 선택하세요.');
  const starts = unique.map((id) => {
    const place = catalogPlace(id, '출발 도시');
    if (place.canEnterFromSea !== true) throw new Error('출발지는 항구 도시만 선택할 수 있습니다.');
    if (place.id === target.id) throw new Error(`${place.name}은(는) 도착지와 같아 출발 도시로 사용할 수 없습니다.`);
    return place;
  });
  const targetMode = target.access === 'land' ? 'land' : 'sea';
  const targetPoint = pointForMode(target, targetMode);
  const title = cleanText(payload?.title, MAX_MISSION_TITLE) || `${target.name} 도착 미션`;
  return {
    id: `arrival-race-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    roomCode,
    kind: 'arrivalRace',
    mode: 'any',
    title,
    instructions: `${target.name}에 도착하면 자동으로 성공 처리됩니다. 사회과부도에서 목적지와 출발 도시 네 곳의 위치를 비교한 뒤 출발 도시를 선택하세요.`,
    atlasInstruction: `사회과부도에서 ${target.name}의 실제 위치를 찾고, 출발 도시 네 곳과의 거리·방향을 비교하세요.`,
    markerMode: 'hidden',
    targetPlace: {
      id: target.id,
      name: target.name,
      category: target.category || '',
      region: target.region || '',
      continent: target.continent || '',
      atlasHint: target.atlasHint || '',
      mode: targetMode,
      point: { x: targetPoint.x, y: targetPoint.y },
      radiusTiles: target.arrivalRadiusTiles
    },
    startOptions: starts.map((start) => ({
      id: start.id,
      startPlace: {
        id: start.id,
        name: start.name,
        region: start.region || '',
        continent: start.continent || '',
        atlasHint: start.atlasHint || '',
        point: { x: start.seaPoint.x, y: start.seaPoint.y }
      }
    })),
    createdAt: Date.now(),
    phase: 'selecting',
    startedAtGameMinutes: null
  };
}

function currentMissionStage(mission, progress) {
  if (!mission || mission.kind !== 'staged' || !Array.isArray(mission.stages)) return null;
  return mission.stages[Math.max(0, Number(progress?.stageIndex || 0))] || null;
}

function missionInteractionForPlayer(player, mission, progress) {
  const stage = currentMissionStage(mission, progress);
  if (!stage || !stage.actionRequired || progress?.status === 'completed') return null;
  const inMode = stage.mode === 'any' || stage.mode === player.mode;
  const near = inMode && distanceXY(player.x, player.y, stage.point.x, stage.point.y) <= (stage.radiusTiles || 2.5) * TILE;
  return {
    stageId:stage.id,
    canInteract:near,
    actionLabel:stage.actionLabel || '확인',
    placeName:stage.placeName,
    message:near ? `${stage.placeName}에서 ${stage.actionLabel || '확인'}할 수 있습니다.` : ''
  };
}

function advanceStagedMission(roomCode, player, mission, progress, stage, label) {
  if (progress.status === 'completed') return publicProgress(progress, mission);
  if (stage.type === 'collect' && stage.item) progress.cargoItemId = stage.item.id;
  if (stage.type === 'deliver') {
    if (stage.item && progress.cargoItemId !== stage.item.id) throw new Error(`${stage.item.name}을 먼저 구입해야 합니다.`);
    progress.cargoItemId = null;
  }
  if (stage.transitionTo === 'land' && stage.transitionPoint) setModeAt(player, 'land', stage.transitionPoint);
  progress.status = 'inProgress';
  progress.stageIndex = Math.max(0, Number(progress.stageIndex || 0)) + 1;
  player.stageArrivalKey = null;
  player.missionStatus = progress.status;
  setNotice(player, label || `${stage.label} 완료`);
  if (progress.stageIndex >= mission.stages.length) {
    completeMission(roomCode, player, mission, progress, label || stage.label);
  } else {
    player.mission = `${mission.title} · ${mission.stages[progress.stageIndex].label}`;
    store.scheduleSave();
    const result = publicProgress(progress, mission);
    io.to(player.id).emit('missionProgress', { mission: missionForStudent(mission), progress: result });
    io.to(`teacher:${roomCode}`).emit('teacherMissionProgress', { name:player.name, progress:result, missionId:store.room(roomCode).activeMission?.id || mission.id });
  }
  return publicProgress(progress, mission);
}



function nearbyCatalogPort(player) {
  const place = nearestOriginalCityAccess(player, 3.2);
  if (!place) return null;
  // 내륙 도시는 육상 통과·도착만 가능하다. 실제 바다 출입구가 있는 도시만 승선 버튼을 표시한다.
  if (player.mode === 'land' && (!Array.isArray(place.originalSeaEntryPoints) || !place.originalSeaEntryPoints.length)) return null;
  return {
    placeId: place.id,
    placeName: place.name,
    actionLabel: player.mode === 'sea' ? `${place.name} 상륙` : `${place.name} 승선`,
    nextMode: player.mode === 'sea' ? 'land' : 'sea'
  };
}

function arrivedAtOriginalCity(player, place) {
  if (!player || !place?.isOriginalCity) return false;
  const nearAny = (points, radiusTiles) => Array.isArray(points) && points.some((point) => distanceXY(player.x, player.y, point.x, point.y) <= radiusTiles * TILE);
  if (player.mode === 'sea') {
    return !!place.canEnterFromSea && nearAny(place.originalSeaEntryPoints, 3.2);
  }
  if (player.mode === 'land') {
    // 도시 마커 자체는 통행 불가 타일일 수 있으므로 원작 육상 출입 경계에 닿으면 도착으로 인정한다.
    return nearAny(place.originalLandEntryPoints, 2.2) || nearAny(place.originalMarkerPoints, 2.6);
  }
  return false;
}

function activeMissionState(roomCode, studentName, player = null) {
  const { activeMission, mission, progress } = missionContext(roomCode, studentName, true);
  return {
    mission: missionForStudentWithProgress(activeMission, progress),
    progress: publicProgress(progress, mission),
    interaction: player && mission ? missionInteractionForPlayer(player, mission, progress) : null,
    portInteraction: player ? nearbyCatalogPort(player) : null
  };
}

function wrapX(x) {
  return Terrain.wrapPixelX(x);
}

function wrapDx(toX, fromX) {
  let d = toX - fromX;
  if (d > WORLD_PIXEL_W / 2) d -= WORLD_PIXEL_W;
  if (d < -WORLD_PIXEL_W / 2) d += WORLD_PIXEL_W;
  return d;
}

function terrainAtPixel(x, y) {
  return Terrain.terrainAtPixel(world, x, y);
}

function isSeaPixel(x, y) {
  return terrainAtPixel(x, y).type === 'sea';
}

function vectorToDir(vx, vy) {
  let angle = Math.atan2(vx, -vy);
  if (angle < 0) angle += Math.PI * 2;
  return Math.round(angle / (Math.PI / 4)) & 7;
}

function distanceXY(ax, ay, bx, by) {
  return Math.hypot(wrapDx(ax, bx), ay - by);
}

function distance(a, b) {
  return distanceXY(a.x, a.y, b.x, b.y);
}

function safeSpawn(room, origin, requiredMode) {
  const offsets = [
    [0,0],[-28,0],[28,0],[0,-28],[0,28],[-42,-24],[42,-24],[-42,24],[42,24],
    [-64,0],[64,0],[0,-52],[0,52],[-78,-36],[78,-36],[-78,36],[78,36]
  ];
  const players = room ? [...room.values()] : [];
  for (let ring = 0; ring < 8; ring++) {
    for (const [ox, oy] of offsets) {
      const x = wrapX(origin.x + ox + ring * 17);
      const y = Math.max(TILE, Math.min(WORLD_PIXEL_H - TILE, origin.y + oy + ring * 11));
      const terrain = terrainAtPixel(x, y);
      const allowed = requiredMode === 'sea' ? terrain.type === 'sea' : terrain.type !== 'sea' && terrain.passable;
      if (!allowed) continue;
      if (players.every((p) => p.mode !== requiredMode || distanceXY(p.x, p.y, x, y) > 18)) return { x, y };
    }
  }
  return { ...origin };
}

function safeSeaSpawn(room) {
  return safeSpawn(room, START, 'sea');
}

function safeHarborSpawn(room, place = RESOLVED_PLACES.get('lisbon')) {
  return safeSpawn(room, place?.seaPoint || LISBON.harbor, 'sea');
}

function safeLandSpawn(room, place = RESOLVED_PLACES.get('lisbon')) {
  return safeSpawn(room, place?.landPoint || LISBON.landGate, 'land');
}

function currentCityForPlayer(player) {
  const place = RESOLVED_PLACES.get(String(player?.currentCityId || player?.lastCityId || ''));
  return place?.isOriginalCity ? place : null;
}

function nearestOriginalCityAccess(player, radiusTiles = 3.2) {
  if (!player || (player.mode !== 'sea' && player.mode !== 'land')) return null;
  let best = null;
  let bestDistance = Infinity;
  for (const place of RESOLVED_PLACES.values()) {
    if (!place.isOriginalCity) continue;
    const points = player.mode === 'sea' ? place.originalSeaEntryPoints : place.originalLandEntryPoints;
    if (!Array.isArray(points) || !points.length) continue;
    for (const point of points) {
      const d = distanceXY(player.x, player.y, point.x, point.y);
      if (d <= radiusTiles * TILE && d < bestDistance) {
        best = place;
        bestDistance = d;
      }
    }
  }
  return best;
}

function setNotice(p, text) {
  const now = Date.now();
  if (p.noticeText === text && now - p.noticeAt < 900) return;
  p.noticeText = text;
  p.noticeAt = now;
  p.noticeSeq = (p.noticeSeq || 0) + 1;
}

function updateFatigue(p, dt) {
  const terrainMultiplier = p.mode === 'land' ? terrainAtPixel(p.x, p.y).multiplier : 1;
  p.fatigue = Fatigue.nextFatigue({
    fatigue: p.fatigue,
    dt,
    mode: p.mode,
    moving: p.moving,
    transition: p.transition,
    terrainMultiplier,
    paused: store.room(p.roomCode).settings.paused || !arrivalRaceTravelGate(p).ok
  });
}

function supplyBand(value) {
  const n = Math.max(0, Number(value) || 0);
  if (n <= 0) return 0;
  if (n <= 10) return 10;
  if (n <= 25) return 25;
  if (n <= 50) return 50;
  return 100;
}

function updateSupplies(p, nowGameMinutes) {
  const now = Math.max(0, Number(nowGameMinutes) || 0);
  if (!Number.isFinite(p.lastSupplyGameMinutes)) p.lastSupplyGameMinutes = now;
  const elapsedMinutes = Math.max(0, Math.min(1440, now - p.lastSupplyGameMinutes));
  p.lastSupplyGameMinutes = now;
  if (!arrivalRaceTravelGate(p).ok) return;
  if (!(elapsedMinutes > 0) || p.mode === 'city') return;
  const days = elapsedMinutes / 1440;
  const inLand = p.mode === 'land';
  const transitionFactor = p.transition ? 0.55 : 1;
  const waterRate = inLand ? WATER_PER_GAME_DAY_LAND : WATER_PER_GAME_DAY_SEA;
  const foodRate = inLand ? FOOD_PER_GAME_DAY_LAND : FOOD_PER_GAME_DAY_SEA;
  p.water = Math.max(0, (Number(p.water) || 0) - waterRate * days * transitionFactor);
  p.food = Math.max(0, (Number(p.food) || 0) - foodRate * days * transitionFactor);

  const nextWaterBand = supplyBand(p.water);
  const nextFoodBand = supplyBand(p.food);
  if (nextWaterBand < (p.waterBand ?? 100)) {
    if (nextWaterBand === 0) setNotice(p, '식수가 모두 떨어졌습니다. 가까운 항구에서 보급하세요.');
    else setNotice(p, `식수가 ${nextWaterBand}% 이하입니다. 항구에서 보급하세요.`);
  }
  if (nextFoodBand < (p.foodBand ?? 100)) {
    if (nextFoodBand === 0) setNotice(p, '식량이 모두 떨어졌습니다. 가까운 항구에서 보급하세요.');
    else setNotice(p, `식량이 ${nextFoodBand}% 이하입니다. 항구에서 보급하세요.`);
  }
  p.waterBand = nextWaterBand;
  p.foodBand = nextFoodBand;
}

function publicPlayer(p, nowGameMinutes = classGameMinutes(p.roomCode)) {
  const activeMission = store.room(p.roomCode).activeMission;
  const raceProgress = isArrivalRace(activeMission) ? progressFor(p.roomCode, p.name, activeMission.id, false) : null;
  const raceCompleted = raceProgress?.status === 'completed';
  const finishRank = Number.isFinite(raceProgress?.finishRank) ? raceProgress.finishRank : null;
  const transition = p.transition ? {
    kind: p.transition.kind,
    label: p.transition.label,
    startedAtGameMinutes: p.transition.startedAtGameMinutes,
    endsAtGameMinutes: p.transition.endsAtGameMinutes,
    remainingGameMinutes: Math.max(0, p.transition.endsAtGameMinutes - nowGameMinutes)
  } : null;
  return {
    id: p.id,
    name: p.name,
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
    dir: p.dir,
    moving: p.moving,
    mode: p.mode,
    mission: p.mission,
    lastSeen: p.lastSeen,
    terrain: p.terrain || 'sea',
    noticeSeq: p.noticeSeq || 0,
    noticeText: p.noticeText || '',
    missionStatus: p.missionStatus || 'assigned',
    finishRank,
    missionCompleted: raceCompleted,
    speedBoostMultiplier: raceCompleted ? COMPLETION_SPEED_MULTIPLIER : 1,
    currentCityId: p.currentCityId || null,
    currentCityName: currentCityForPlayer(p)?.name || '',
    lastCityId: p.lastCityId || null,
    fatigue: Math.round(Fatigue.clamp(p.fatigue) * 10) / 10,
    fatigueSpeedMultiplier: Math.round(Fatigue.speedMultiplier(p.fatigue) * 1000) / 1000,
    transition
  };
}

function roomForSocket(socket) {
  const code = socket.data.roomCode;
  return code ? rooms.get(code) : null;
}

function playerForSocket(socket) {
  return roomForSocket(socket)?.get(socket.id);
}

function stopPlayer(p) {
  p.input = { up: false, down: false, left: false, right: false };
  p.target = null;
  p.moving = false;
}

function setModeAt(p, mode, point) {
  stopPlayer(p);
  p.transition = null;
  p.mode = mode;
  if (mode !== 'city') p.currentCityId = null;
  p.x = wrapX(point.x);
  p.y = Math.max(TILE, Math.min(WORLD_PIXEL_H - TILE, point.y));
  p.terrain = mode === 'sea' ? 'sea' : mode === 'land' ? terrainAtPixel(p.x, p.y).type : 'plain';
  p.lastSeen = Date.now();
}

function beginTimedTransition(p, options) {
  if (p.transition) return false;
  const nowGameMinutes = classGameMinutes(p.roomCode);
  stopPlayer(p);
  p.transition = {
    kind: options.kind,
    label: options.label,
    startedAtGameMinutes: nowGameMinutes,
    endsAtGameMinutes: nowGameMinutes + Math.max(1, options.durationGameMinutes),
    destinationMode: options.destinationMode,
    destinationPoint: { x: options.destinationPoint.x, y: options.destinationPoint.y },
    missionAfter: options.missionAfter || p.mission,
    noticeAfter: options.noticeAfter || '',
    cityIdAfter: options.cityIdAfter || null,
    lastCityIdAfter: options.lastCityIdAfter || options.cityIdAfter || null
  };
  p.lastSeen = Date.now();
  return true;
}

function updateTimedTransition(p, nowGameMinutes) {
  const action = p.transition;
  if (!action || nowGameMinutes < action.endsAtGameMinutes) return false;
  p.transition = null;
  setModeAt(p, action.destinationMode, action.destinationPoint);
  if (action.destinationMode === 'city') p.currentCityId = action.cityIdAfter || action.lastCityIdAfter || null;
  if (action.lastCityIdAfter) p.lastCityId = action.lastCityIdAfter;
  p.mission = action.missionAfter;
  if (action.noticeAfter) setNotice(p, action.noticeAfter);
  return true;
}


function completeMission(roomCode, p, mission, progress, label) {
  if (progress.status === 'completed') return;
  progress.status = 'completed';
  progress.completedAt = Date.now();
  progress.completedGameMinutes = classGameMinutes(roomCode);
  if (isArrivalRace(store.room(roomCode).activeMission)) {
    const all = Object.values(store.room(roomCode).progress)
      .map((missions) => missions?.[store.room(roomCode).activeMission.id])
      .filter(Boolean);
    const usedRanks = all.map((item) => Number(item.finishRank) || 0);
    progress.finishRank = Math.max(0, ...usedRanks) + 1;
  }
  missionRuntime.delete(runtimeKey(roomCode, p.name, store.room(roomCode).activeMission?.id || mission.id));
  p.missionStatus = 'completed';
  p.mission = `${mission.title} · 완료`;
  const rankText = progress.finishRank ? ` ${progress.finishRank}위로` : '';
  setNotice(p, `미션 성공!${rankText} ${label || mission.title}에 도착했습니다. 메달을 달고 이동속도 2배로 자유 탐험할 수 있습니다.`);
  store.scheduleSave();
  const activeMission = store.room(roomCode).activeMission;
  const result = publicProgress(progress, isArrivalRace(activeMission) ? activeMission : mission);
  io.to(p.id).emit('missionProgress', { mission: missionForStudent(isArrivalRace(activeMission) ? activeMission : mission), progress: result });
  io.to(`teacher:${roomCode}`).emit('teacherMissionProgress', { name: p.name, progress: result, missionId: activeMission?.id || mission.id });
}

function recordMovement(p, movedPixels) {
  if (!(movedPixels > 0)) return;
  const { activeMission, mission, progress } = missionContext(p.roomCode, p.name, true);
  if (!activeMission || !mission || !missionModeMatches(mission, p.mode)) return;
  if (progress.status === 'completed') return;
  const runtime = runtimeProgressFor(p.roomCode, p.name, activeMission.id, true);
  const tiles = movedPixels / TILE;
  runtime.started = true;
  runtime.distanceTiles += tiles;
  runtime.terrainDistanceTiles[p.terrain] = (runtime.terrainDistanceTiles[p.terrain] || 0) + tiles;
  runtime.visitedTerrains.add(p.terrain);
  if (progress.status === 'assigned') progress.status = 'inProgress';
  p.missionStatus = progress.status;
}

function removePlayer(socket) {
  const roomCode = socket.data.roomCode;
  if (!roomCode) return;
  const room = rooms.get(roomCode);
  if (!room) return;
  const p = room.get(socket.id);
  room.delete(socket.id);
  socket.leave(`class:${roomCode}`);
  socket.data.roomCode = null;
  if (room.size === 0) rooms.delete(roomCode);
  if (p) io.to(`teacher:${roomCode}`).emit('teacherEvent', { type: 'leave', name: p.name, at: Date.now() });
}

io.on('connection', (socket) => {
  socket.on('joinClass', (payload, ack = () => {}) => {
    try {
      removePlayer(socket);
      const name = cleanName(payload?.name);
      const roomCode = cleanRoom(payload?.roomCode);
      if (name.length < 2) return ack({ ok: false, error: '이름을 두 글자 이상 입력하세요.' });
      if (!isValidClassCode(roomCode)) return ack({ ok: false, error: '학급 코드는 교사가 만든 숫자 6자리 코드입니다.' });

      let room = rooms.get(roomCode);
      if (!room) {
        room = new Map();
        rooms.set(roomCode, room);
      }
      if (store.room(roomCode).settings.locked) return ack({ ok: false, error: '교사가 현재 수업방 입장을 잠갔습니다.' });
      if (room.size >= MAX_ROOM_PLAYERS) return ack({ ok: false, error: '이 반은 현재 정원이 찼습니다.' });
      if ([...room.values()].some((p) => p.name === name)) return ack({ ok: false, error: '같은 반에 동일한 이름이 이미 접속 중입니다.' });

      const classMinutes = classGameMinutes(roomCode);
      const activeMission = store.room(roomCode).activeMission;
      const savedProgress = activeMission ? progressFor(roomCode, name, activeMission.id, true) : null;
      const savedMission = selectedMission(activeMission, savedProgress);
      const savedRaceStart = isArrivalRace(activeMission) && savedProgress?.selectedStartPlaceId
        ? activeMission.startOptions.find((option) => option.startPlace?.id === savedProgress.selectedStartPlaceId)?.startPlace
        : null;
      const spawnOrigin = savedRaceStart?.point || savedMission?.startPlace?.point || START;
      const spawn = safeSpawn(room, spawnOrigin, 'sea');
      const player = {
        id: socket.id,
        name,
        roomCode,
        x: spawn.x,
        y: spawn.y,
        dir: 2,
        moving: false,
        mode: 'sea',
        mission: savedMission ? (activeMission?.phase === 'running' ? savedMission.title : '교사 출발 신호 대기') : activeMission ? '출발 도시 4곳 중 선택 대기 중' : '교사의 미션 대기 중',
        activeMissionId: activeMission?.id || null,
        missionStatus: savedProgress?.status || 'assigned',
        transition: null,
        terrain: 'sea',
        input: { up: false, down: false, left: false, right: false },
        target: null,
        lastInputAt: Date.now(),
        lastSeen: Date.now(),
        noticeSeq: 0,
        noticeText: '',
        noticeAt: 0,
        stageArrivalKey: null,
        currentCityId: null,
        lastCityId: savedRaceStart?.id || null,
        fatigue: 0,
        money: STARTING_MONEY,
        water: MAX_WATER,
        food: MAX_FOOD,
        waterBand: 100,
        foodBand: 100,
        lastSupplyGameMinutes: classMinutes
      };
      room.set(socket.id, player);
      socket.data.roomCode = roomCode;
      socket.join(`class:${roomCode}`);
      ack({ ok: true, self: publicPlayer(player, classMinutes), classGameMinutes: classMinutes, roomCode, nearbyRadiusTiles: NEARBY_RADIUS / TILE, settings: store.room(roomCode).settings, ...activeMissionState(roomCode, name, player) });
      io.to(`teacher:${roomCode}`).emit('teacherEvent', { type: 'join', name, at: Date.now() });
    } catch (error) {
      console.error(error);
      ack({ ok: false, error: '입장 처리 중 오류가 발생했습니다.' });
    }
  });

  socket.on('input', (payload) => {
    const p = playerForSocket(socket);
    if (!p || p.transition || (p.mode !== 'sea' && p.mode !== 'land')) return;
    if (!arrivalRaceTravelGate(p).ok) { stopPlayer(p); return; }
    p.input = {
      up: payload?.up === true,
      down: payload?.down === true,
      left: payload?.left === true,
      right: payload?.right === true
    };
    if (p.input.up || p.input.down || p.input.left || p.input.right) p.target = null;
    p.lastInputAt = Date.now();
    p.lastSeen = Date.now();
  });

  socket.on('setTarget', (payload) => {
    const p = playerForSocket(socket);
    if (!p || p.transition || (p.mode !== 'sea' && p.mode !== 'land')) return;
    if (!arrivalRaceTravelGate(p).ok) { stopPlayer(p); return; }
    const x = Number(payload?.x);
    const y = Number(payload?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    p.target = { x: wrapX(x), y: Math.max(TILE, Math.min(WORLD_PIXEL_H - TILE, y)) };
    p.input = { up: false, down: false, left: false, right: false };
    p.lastInputAt = Date.now();
    p.lastSeen = Date.now();
  });

  socket.on('stop', () => {
    const p = playerForSocket(socket);
    if (!p) return;
    stopPlayer(p);
    p.lastSeen = Date.now();
  });

  socket.on('enterPort', (_payload, ack = () => {}) => ack({ ok:false, error:'도시 화면 기능은 현재 사용하지 않습니다. 항구에서 상륙·승선을 이용하세요.' }));

  socket.on('departPort', (_payload, ack = () => {}) => ack({ ok:false, error:'도시 화면 기능은 현재 사용하지 않습니다. 항구에서 상륙·승선을 이용하세요.' }));

  socket.on('resupply', (_payload, ack = () => {}) => ack({ ok:false, error:'도시 화면 기능은 현재 사용하지 않습니다. 항구에서 상륙·승선을 이용하세요.' }));

  socket.on('startLandExpedition', (_payload, ack = () => {}) => ack({ ok:false, error:'도시 화면 기능은 현재 사용하지 않습니다. 항구에서 상륙·승선을 이용하세요.' }));

  socket.on('returnToCity', (_payload, ack = () => {}) => ack({ ok:false, error:'도시 화면 기능은 현재 사용하지 않습니다. 항구에서 상륙·승선을 이용하세요.' }));

  socket.on('missionUpdate', (payload) => {
    const p = playerForSocket(socket);
    if (!p) return;
    p.mission = String(payload?.mission || '').slice(0, 60) || p.mission;
    p.lastSeen = Date.now();
  });


  socket.on('missionInteract', (_payload, ack = () => {}) => {
    const p = playerForSocket(socket);
    if (!p) return ack({ ok:false, error:'학생 접속 상태가 아닙니다.' });
    const { mission, progress } = missionContext(p.roomCode, p.name, true);
    const stage = currentMissionStage(mission, progress);
    if (!mission || !progress || !stage) return ack({ ok:false, error:'진행 중인 단계형 미션이 없습니다.' });
    if (!stage.actionRequired) return ack({ ok:false, error:'이 단계는 도착하면 자동으로 완료됩니다.' });
    if (stage.mode !== 'any' && stage.mode !== p.mode) return ack({ ok:false, error:`현재는 ${stage.mode === 'land' ? '육상 탐험대' : '배'} 상태가 필요합니다.` });
    if (distanceXY(p.x, p.y, stage.point.x, stage.point.y) > (stage.radiusTiles || 2.5) * TILE) return ack({ ok:false, error:`${stage.placeName}에 더 가까이 이동하세요.` });
    try {
      const result = advanceStagedMission(p.roomCode, p, mission, progress, stage, `${stage.label} 완료`);
      ack({ ok:true, self:publicPlayer(p), mission:missionForStudent(mission), progress:result });
    } catch (error) {
      ack({ ok:false, error:error.message || '미션 행동을 처리하지 못했습니다.' });
    }
  });

  socket.on('chooseStartCity', (payload, ack = () => {}) => {
    const p = playerForSocket(socket);
    if (!p) return ack({ ok:false, error:'학생 접속 상태가 아닙니다.' });
    const activeMission = store.room(p.roomCode).activeMission;
    if (!isArrivalRace(activeMission) && !isStartChoiceSet(activeMission)) return ack({ ok:false, error:'현재 선택할 출발 도시가 없습니다.' });
    if (isArrivalRace(activeMission) && activeMission.phase !== 'selecting') return ack({ ok:false, error:'이미 출발한 미션입니다. 교사에게 다시 시작해 달라고 하세요.' });
    const progress = progressFor(p.roomCode, p.name, activeMission.id, true);
    if (progress.selectedStartPlaceId || progress.selectedMissionId) return ack({ ok:false, error:'출발 도시는 한 번 선택하면 변경할 수 없습니다.' });
    const optionId = String(payload?.optionId || '');
    let mission = activeMission;
    let startPlace = null;
    if (isArrivalRace(activeMission)) {
      const option = activeMission.startOptions.find((item) => item.id === optionId || item.startPlace?.id === optionId);
      startPlace = option?.startPlace || null;
      if (!startPlace?.point) return ack({ ok:false, error:'배포된 출발 도시 네 곳 중 하나를 선택하세요.' });
      progress.selectedStartPlaceId = startPlace.id;
      progress.selectedMissionId = null;
      progress.status = 'assigned';
      progress.completedAt = null;
      progress.completedGameMinutes = null;
      progress.finishRank = null;
    } else {
      mission = activeMission.startOptions.find((option) => option.id === optionId);
      startPlace = mission?.startPlace || null;
      if (!startPlace?.point) return ack({ ok:false, error:'배포된 출발 도시 중 하나를 선택하세요.' });
      progress.selectedMissionId = mission.id;
      progress.status = 'assigned';
      progress.stageIndex = 0;
      progress.cargoItemId = null;
      progress.completedAt = null;
    }
    p.stageArrivalKey = null;
    const room = rooms.get(p.roomCode);
    const spawn = safeSpawn(room, startPlace.point, 'sea');
    setModeAt(p, 'sea', spawn);
    p.fatigue = 0;
    p.water = MAX_WATER;
    p.food = MAX_FOOD;
    p.waterBand = 100;
    p.foodBand = 100;
    p.lastSupplyGameMinutes = classGameMinutes(p.roomCode);
    p.activeMissionId = activeMission.id;
    p.mission = isArrivalRace(activeMission) ? `${activeMission.targetPlace.name} 도착` : `${mission.title} · ${mission.stages?.[0]?.label || '출발 준비'}`;
    p.missionStatus = progress.status;
    setNotice(p, `${startPlace.name} 선택 완료. 교사의 출발 신호를 기다리세요.`);
    store.scheduleSave();
    const publicState = publicProgress(progress, isArrivalRace(activeMission) ? activeMission : mission);
    io.to(p.id).emit('missionProgress', { mission:missionForStudent(isArrivalRace(activeMission) ? activeMission : mission), progress:publicState });
    io.to(`teacher:${p.roomCode}`).emit('teacherMissionProgress', { name:p.name, progress:publicState, missionId:activeMission.id });
    ack({ ok:true, mission:missionForStudent(isArrivalRace(activeMission) ? activeMission : mission), progress:publicState, self:publicPlayer(p) });
  });

  socket.on('useCatalogPort', (payload, ack = () => {}) => {
    const room = roomForSocket(socket);
    const p = playerForSocket(socket);
    if (!p || (p.mode !== 'sea' && p.mode !== 'land')) return ack({ ok:false, error:'현재 항구를 이용할 수 없습니다.' });
    const travel = arrivalRaceTravelGate(p); if (!travel.ok) return ack({ ok:false, error:travel.error });
    if (p.transition) return ack({ ok:false, error:'이동 수단 전환이 이미 진행 중입니다.' });
    const place = RESOLVED_PLACES.get(String(payload?.placeId || ''));
    if (!place || !place.isOriginalCity) return ack({ ok:false, error:'원작 도시 정보를 찾지 못했습니다.' });
    const fromSea = p.mode === 'sea';
    const entryPoints = fromSea ? place.originalSeaEntryPoints : place.originalLandEntryPoints;
    if (!Array.isArray(entryPoints) || !entryPoints.length) return ack({ ok:false, error:fromSea?'원작에서 이 도시는 바다로 접근할 수 없습니다.':'원작에서 이 도시를 통해 승선할 수 없습니다.' });
    const near = entryPoints.some((point) => distanceXY(p.x, p.y, point.x, point.y) <= 3.2 * TILE);
    if (!near) return ack({ ok:false, error:`${place.name}에 더 가까이 이동하세요.` });
    const destinationMode = fromSea ? 'land' : 'sea';
    const destinationPoint = fromSea ? safeLandSpawn(room, place) : safeHarborSpawn(room, place);
    beginTimedTransition(p, {
      kind:fromSea?'directDisembark':'directEmbark',
      label:fromSea?`${place.name} 상륙 준비 중`:`${place.name} 승선 준비 중`,
      durationGameMinutes:fromSea?LAND_PREP_GAME_MINUTES:PORT_EXIT_GAME_MINUTES,
      destinationMode, destinationPoint, lastCityIdAfter:place.id,
      missionAfter:fromSea?`${place.name}에서 육상 탐험`:`${place.name}에서 항해`,
      noticeAfter:fromSea?`${place.name}에서 육상 탐험을 시작합니다.`:`${place.name}에서 승선했습니다.`
    });
    ack({ ok:true, started:true, self:publicPlayer(p), port:place.name });
  });

  socket.on('teacherPublishArrivalRace', (payload, ack = () => {}) => {
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok:false, error:'교사 인증이 필요합니다.' });
    try {
      const mission = buildArrivalRace(payload, roomCode);
      clearMissionRuntime(roomCode);
      store.setActiveMission(roomCode, mission);
      const room = rooms.get(roomCode);
      if (room) {
        for (const p of room.values()) {
          const progress = progressFor(roomCode, p.name, mission.id, true);
          progress.selectedMissionId = null;
          progress.selectedStartPlaceId = null;
          progress.status = 'assigned';
          progress.stageIndex = 0;
          progress.cargoItemId = null;
          progress.completedAt = null;
          progress.completedGameMinutes = null;
          progress.finishRank = null;
          p.activeMissionId = mission.id;
          p.mission = '출발 도시 선택 후 교사 출발 대기';
          p.missionStatus = 'assigned';
          stopPlayer(p);
          setNotice(p, `새 미션: ${mission.targetPlace.name}에 도착하세요.`);
        }
      }
      io.to(`class:${roomCode}`).emit('missionPublished', { mission:missionForStudent(mission) });
      io.to(`teacher:${roomCode}`).emit('teacherMissionChanged', { mission:missionForTeacher(mission) });
      ack({ ok:true, mission:missionForTeacher(mission), progress:missionProgressList(roomCode, mission.id) });
    } catch (error) {
      ack({ ok:false, error:error.message || '도착 미션을 만들지 못했습니다.' });
    }
  });

  socket.on('teacherStartArrivalRace', (_payload, ack = () => {}) => {
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok:false, error:'교사 인증이 필요합니다.' });
    const mission = store.room(roomCode).activeMission;
    if (!isArrivalRace(mission)) return ack({ ok:false, error:'먼저 도착지와 출발 도시 4곳을 배포하세요.' });
    if (mission.phase === 'running') return ack({ ok:false, error:'이미 출발한 미션입니다.' });
    const room = rooms.get(roomCode);
    const connected = room ? [...room.values()] : [];
    if (!connected.length) return ack({ ok:false, error:'현재 접속한 학생이 없습니다.' });
    const notReady = connected.filter((p) => !progressFor(roomCode, p.name, mission.id, false)?.selectedStartPlaceId);
    if (notReady.length) {
      const names = notReady.slice(0, 6).map((p) => p.name).join(', ');
      const more = notReady.length > 6 ? ` 외 ${notReady.length - 6}명` : '';
      return ack({ ok:false, error:`출발 도시를 고르지 않은 학생이 있습니다: ${names}${more}` });
    }
    const startMinutes = classGameMinutes(roomCode);
    mission.phase = 'running';
    mission.startedAtGameMinutes = startMinutes;
    mission.startedAt = Date.now();
    for (const p of connected) {
      const progress = progressFor(roomCode, p.name, mission.id, true);
      if (progress.status !== 'completed') progress.status = 'inProgress';
      p.missionStatus = progress.status;
      p.mission = `${mission.targetPlace.name} 도착`;
      p.lastSupplyGameMinutes = startMinutes;
      stopPlayer(p);
      setNotice(p, `출발! ${mission.targetPlace.name}을 향해 이동하세요.`);
      io.to(p.id).emit('missionProgress', { mission:missionForStudent(mission), progress:publicProgress(progress, mission) });
    }
    store.scheduleSave();
    io.to(`class:${roomCode}`).emit('missionStarted', { mission:missionForStudent(mission), classGameMinutes:startMinutes });
    io.to(`teacher:${roomCode}`).emit('teacherMissionChanged', { mission:missionForTeacher(mission) });
    ack({ ok:true, mission:missionForTeacher(mission), progress:missionProgressList(roomCode, mission.id), classGameMinutes:startMinutes });
  });

  socket.on('teacherPublishStartChoices', (payload, ack = () => {}) => {
    return ack({ ok:false, error:'v23에서는 도착지 1곳과 출발 도시 4곳을 선택하는 도착 미션만 사용합니다.' });
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok:false, error:'교사 인증이 필요합니다.' });
    try {
      const mission = buildStartChoiceSet(payload, roomCode);
      clearMissionRuntime(roomCode);
      store.setActiveMission(roomCode, mission);
      const room = rooms.get(roomCode);
      if (room) {
        for (const p of room.values()) {
          const progress = progressFor(roomCode, p.name, mission.id, true);
          progress.selectedMissionId = null;
          progress.status = 'assigned';
          progress.stageIndex = 0;
          progress.cargoItemId = null;
          progress.completedAt = null;
          p.activeMissionId = mission.id;
          p.mission = '출발 도시 4곳 중 한 곳 선택';
          p.missionStatus = 'assigned';
          stopPlayer(p);
        }
      }
      io.to(`class:${roomCode}`).emit('missionPublished', { mission:missionForStudentWithProgress(mission, null) });
      io.to(`teacher:${roomCode}`).emit('teacherMissionChanged', { mission:missionForTeacher(mission) });
      ack({ ok:true, mission:missionForTeacher(mission), progress:missionProgressList(roomCode, mission.id) });
    } catch (error) {
      ack({ ok:false, error:error.message || '공통 미션과 출발 도시를 만들지 못했습니다.' });
    }
  });

  socket.on('teacherPublishGeneratedMission', (payload, ack = () => {}) => {
    return ack({ ok:false, error:'v23에서는 도착지 1곳과 출발 도시 4곳을 선택하는 도착 미션만 사용합니다.' });
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok:false, error:'교사 인증이 필요합니다.' });
    try {
      const mission = buildGeneratedMission(payload, roomCode);
      clearMissionRuntime(roomCode);
      store.setActiveMission(roomCode, mission);
      const room = rooms.get(roomCode);
      if (room) {
        for (const p of room.values()) {
          const progress = progressFor(roomCode, p.name, mission.id, true);
          p.activeMissionId = mission.id;
          p.mission = `${mission.title} · ${mission.stages[0].label}`;
          p.missionStatus = progress.status;
        }
      }
      io.to(`class:${roomCode}`).emit('missionPublished', { mission:missionForStudent(mission) });
      io.to(`teacher:${roomCode}`).emit('teacherMissionChanged', { mission:missionForTeacher(mission) });
      ack({ ok:true, mission:missionForTeacher(mission), progress:missionProgressList(roomCode, mission.id) });
    } catch (error) {
      ack({ ok:false, error:error.message || '자동 미션을 만들지 못했습니다.' });
    }
  });

  socket.on('teacherPublishMission', (payload, ack = () => {}) => {
    return ack({ ok:false, error:'v23에서는 도착지 1곳과 출발 도시 4곳을 선택하는 도착 미션만 사용합니다.' });
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok: false, error: '교사 인증이 필요합니다.' });
    try {
      const mission = sanitizeMission(payload, roomCode);
      clearMissionRuntime(roomCode);
      store.setActiveMission(roomCode, mission);
      const room = rooms.get(roomCode);
      if (room) {
        for (const p of room.values()) {
          const progress = progressFor(roomCode, p.name, mission.id, true);
          p.activeMissionId = mission.id;
          p.mission = mission.title;
          p.missionStatus = progress.status;
        }
      }
      io.to(`class:${roomCode}`).emit('missionPublished', { mission: missionForStudent(mission) });
      io.to(`teacher:${roomCode}`).emit('teacherMissionChanged', { mission: missionForTeacher(mission) });
      ack({ ok: true, mission: missionForTeacher(mission), progress: missionProgressList(roomCode, mission.id) });
    } catch (error) {
      ack({ ok: false, error: error.message || '미션을 만들지 못했습니다.' });
    }
  });

  socket.on('teacherClearMission', (_payload, ack = () => {}) => {
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok: false, error: '교사 인증이 필요합니다.' });
    clearMissionRuntime(roomCode);
    store.clearActiveMission(roomCode);
    const room = rooms.get(roomCode);
    if (room) for (const p of room.values()) {
      p.activeMissionId = null;
      p.mission = '교사의 다음 미션을 기다리는 중';
      p.missionStatus = 'assigned';
    }
    io.to(`class:${roomCode}`).emit('missionCleared');
    io.to(`teacher:${roomCode}`).emit('teacherMissionChanged', { mission: null });
    ack({ ok: true });
  });

  socket.on('teacherSetPaused', (payload, ack = () => {}) => {
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok: false, error: '교사 인증이 필요합니다.' });
    const clock = clockForRoom(roomCode);
    if (clock.ownerSocketId !== socket.id) return ack({ ok:false, error:'이 교사 화면은 현재 반 시간의 기준 화면이 아닙니다.' });
    const reported = Number(payload?.gameMinutes);
    if (Number.isFinite(reported)) syncTeacherClock(roomCode, socket.id, reported);
    const paused = payload?.paused === true;
    const currentMinutes = freezeClassClock(roomCode);
    const settings = store.setRoomSettings(roomCode, { paused });
    clock.baseGameMinutes = currentMinutes;
    clock.baseServerMs = Date.now();
    clock.lastTeacherSyncAt = Date.now();
    if (paused) {
      const room = rooms.get(roomCode);
      if (room) for (const p of room.values()) stopPlayer(p);
    }
    io.to(`class:${roomCode}`).emit('classControl', settings);
    ack({ ok: true, settings, classGameMinutes: currentMinutes });
  });

  socket.on('teacherSetLocked', (payload, ack = () => {}) => {
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok: false, error: '교사 인증이 필요합니다.' });
    const settings = store.setRoomSettings(roomCode, { locked: payload?.locked === true });
    io.to(`class:${roomCode}`).emit('classControl', settings);
    ack({ ok: true, settings });
  });

  socket.on('teacherCreateClass', (payload, ack = () => {}) => {
    if (String(payload?.pin || '') !== TEACHER_PIN) return ack({ ok:false, error:'교사 PIN이 맞지 않습니다.' });
    try {
      const roomCode = generateClassCode();
      const previousRoom = teachers.get(socket.id);
      if (previousRoom) socket.leave(`teacher:${previousRoom}`);
      teachers.set(socket.id, roomCode);
      socket.join(`teacher:${roomCode}`);
      const cleanSettings = store.setRoomSettings(roomCode, { paused:false, locked:false });
      const classMinutes = claimTeacherClock(roomCode, socket.id);
      ack({ ok:true, roomCode, classGameMinutes:classMinutes, clockRateHoursPerSecond:GAME_HOURS_PER_REAL_SECOND, mission:null, progress:[], settings:cleanSettings });
    } catch (error) {
      ack({ ok:false, error:error.message || '학급 코드를 만들지 못했습니다.' });
    }
  });

  socket.on('teacherJoin', (payload, ack = () => {}) => {
    const roomCode = cleanRoom(payload?.roomCode);
    if (!isValidClassCode(roomCode) || String(payload?.pin || '') !== TEACHER_PIN) return ack({ ok:false, error:'숫자 6자리 학급 코드 또는 교사 PIN이 맞지 않습니다.' });
    const previousRoom = teachers.get(socket.id);
    if (previousRoom) socket.leave(`teacher:${previousRoom}`);
    teachers.set(socket.id, roomCode);
    socket.join(`teacher:${roomCode}`);
    const cleanSettings = store.setRoomSettings(roomCode, { paused: false, locked: false });
    io.to(`class:${roomCode}`).emit('classControl', cleanSettings);
    const classMinutes = claimTeacherClock(roomCode, socket.id);
    const activeMission = store.room(roomCode).activeMission;
    ack({ ok: true, roomCode, classGameMinutes: classMinutes, clockRateHoursPerSecond: GAME_HOURS_PER_REAL_SECOND, mission: missionForTeacher(activeMission), progress: missionProgressList(roomCode, activeMission?.id), settings: cleanSettings });
  });

  socket.on('teacherClockSync', (payload, ack = () => {}) => {
    const roomCode = teachers.get(socket.id);
    if (!roomCode) return ack({ ok:false, error:'교사 인증이 필요합니다.' });
    const synced = syncTeacherClock(roomCode, socket.id, payload?.gameMinutes);
    if (synced == null) return ack({ ok:false, error:'반 시간 동기화 권한이 없습니다.' });
    ack({ ok:true, classGameMinutes:synced });
  });

  socket.on('disconnect', () => {
    removePlayer(socket);
    releaseTeacherClock(socket.id);
    teachers.delete(socket.id);
  });
});

function missionModeMatches(mission, playerMode) {
  return mission.mode === 'any' || mission.mode === playerMode;
}

function updateMissionProgress(roomCode, p) {
  const { activeMission, mission, progress } = missionContext(roomCode, p.name, true);
  if (!activeMission || !mission || !progress) return;
  if (p.activeMissionId !== activeMission.id) {
    p.activeMissionId = activeMission.id;
    p.mission = mission.title;
  }
  p.missionStatus = progress.status;
  if (progress.status === 'completed') return;

  if (isArrivalRace(activeMission)) {
    if (!progress.selectedStartPlaceId) {
      p.mission = '출발 도시 4곳 중 한 곳 선택';
      return;
    }
    if (activeMission.phase !== 'running') {
      p.mission = '교사 출발 신호 대기';
      return;
    }
    const target = activeMission.targetPlace;
    p.mission = `${target.name} 도착`;
    const resolvedTarget = RESOLVED_PLACES.get(target.id);
    const arrived = resolvedTarget?.isOriginalCity
      ? arrivedAtOriginalCity(p, resolvedTarget)
      : ArrivalZones.containsPlayer(
          p,
          resolvedTarget,
          ARRIVAL_ZONES[target.id] || null,
          { worldPixelWidth: WORLD_PIXEL_W, worldPixelHeight: WORLD_PIXEL_H, tile: TILE }
        );
    if (arrived) completeMission(roomCode, p, activeMission, progress, target.name);
    return;
  }

  if (mission.kind === 'staged') {
    const stage = currentMissionStage(mission, progress);
    if (!stage) return completeMission(roomCode, p, mission, progress, '모든 단계 완료');
    p.mission = `${mission.title} · ${stage.label}`;
    const inMode = stage.mode === 'any' || stage.mode === p.mode;
    const distanceTiles = inMode ? distanceXY(p.x, p.y, stage.point.x, stage.point.y) / TILE : Infinity;
    const arrivalRadius = Math.max(stage.radiusTiles || 2.5, stage.arrivalRadiusTiles || stage.radiusTiles || 2.5);
    const arrivalKey = `${mission.id}:${progress.stageIndex}`;
    if (distanceTiles <= arrivalRadius && p.stageArrivalKey !== arrivalKey) {
      p.stageArrivalKey = arrivalKey;
      setNotice(p, `${stage.placeName}에 도착했습니다.`);
    }
    if (!stage.actionRequired && distanceTiles <= (stage.radiusTiles || arrivalRadius)) {
      advanceStagedMission(roomCode, p, mission, progress, stage, `${stage.placeName} 도착`);
    }
    return;
  }

  if (mission.kind === 'location') {
    if (!mission.target || !missionModeMatches(mission, p.mode)) return;
    if (distanceXY(p.x, p.y, mission.target.x, mission.target.y) <= mission.target.radiusTiles * TILE) {
      completeMission(roomCode, p, mission, progress, `${mission.target.label} 도착`);
    }
    return;
  }

  const runtime = runtimeProgressFor(roomCode, p.name, activeMission.id, false);
  if (!runtime) return;

  if (mission.kind === 'terrain') {
    const terrainType = mission.criteria?.terrainType;
    const required = mission.criteria?.minDistanceTiles || 1;
    const current = runtime.terrainDistanceTiles[terrainType] || 0;
    if (current >= required) completeMission(roomCode, p, mission, progress, `${Terrain.LABEL[terrainType] || terrainType} 조사`);
    return;
  }

  if (mission.kind === 'exploration') {
    if (mission.criteria?.requireReturnToCity && runtime.started && p.mode === 'city') runtime.returnCompleted = true;
    const distanceOk = runtime.distanceTiles >= (mission.criteria?.minDistanceTiles || 1);
    const terrainTypes = [...runtime.visitedTerrains].filter((t) => t !== 'sea' || mission.mode !== 'land');
    const terrainOk = terrainTypes.length >= (mission.criteria?.minTerrainTypes || 1);
    const returnOk = !mission.criteria?.requireReturnToCity || runtime.returnCompleted;
    if (distanceOk && terrainOk && returnOk) completeMission(roomCode, p, mission, progress, '자유 탐험 완료');
  }
}

function movePlayer(p, dt) {
  if (store.room(p.roomCode).settings.paused || p.transition) { p.moving = false; return; }
  const travel = arrivalRaceTravelGate(p);
  if (!travel.ok) { p.moving = false; stopPlayer(p); return; }
  if (p.mode !== 'sea' && p.mode !== 'land') {
    p.moving = false;
    return;
  }

  let vx = (p.input.right ? 1 : 0) - (p.input.left ? 1 : 0);
  let vy = (p.input.down ? 1 : 0) - (p.input.up ? 1 : 0);
  let targetDistance = Infinity;

  if (p.target) {
    const dx = wrapDx(p.target.x, p.x);
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);
    targetDistance = dist;
    if (dist < 4) {
      p.target = null;
      p.moving = false;
      return;
    }
    vx = dx / dist;
    vy = dy / dist;
  }

  const len = Math.hypot(vx, vy);
  if (!len) {
    p.moving = false;
    p.terrain = p.mode === 'sea' ? 'sea' : terrainAtPixel(p.x, p.y).type;
    return;
  }

  vx /= len;
  vy /= len;
  const currentTerrain = terrainAtPixel(p.x, p.y);
  p.terrain = p.mode === 'sea' ? 'sea' : currentTerrain.type;
  const multiplier = p.mode === 'sea' ? TERRAIN_SPEED.sea : currentTerrain.multiplier;
  const baseSpeed = p.mode === 'sea' ? SEA_BASE_SPEED : LAND_BASE_SPEED;
  const fatigueMultiplier = Fatigue.speedMultiplier(p.fatigue);
  const completionMultiplier = travel.completed ? COMPLETION_SPEED_MULTIPLIER : 1;
  const step = Math.min(baseSpeed * multiplier * fatigueMultiplier * completionMultiplier * dt, targetDistance);
  const ox = p.x;
  const oy = p.y;
  let driftX = 0;
  let driftY = 0;
  if (p.mode === 'sea') {
    const current = OceanCurrent.currentAtPixel(ox, oy);
    const alignment = vx * current.x + vy * current.y;
    const factor = OceanCurrent.movementFactor(alignment, CURRENT_TAIL_FACTOR, CURRENT_HEAD_FACTOR, CURRENT_CROSS_FACTOR);
    const driftSpeed = SEA_BASE_SPEED * factor * current.strength * completionMultiplier;
    driftX = current.x * driftSpeed * dt;
    driftY = current.y * driftSpeed * dt;
    p.currentName = current.name;
    p.currentStrength = current.strength;
    p.currentAssistPercent = Math.round(factor * current.strength * alignment * 100);
  }
  const candidates = [[ox + vx * step + driftX, oy + vy * step + driftY]];
  if (Math.abs(vx) > 0.001 && Math.abs(vy) > 0.001) candidates.push([ox + vx * step + driftX, oy + driftY], [ox + driftX, oy + vy * step + driftY]);
  let moved = false;
  let blockedTerrain = null;

  for (const [rawX, rawY] of candidates) {
    const nx = wrapX(rawX);
    const ny = Math.max(TILE, Math.min(WORLD_PIXEL_H - TILE, rawY));
    const nextTerrain = terrainAtPixel(nx, ny);
    const allowed = p.mode === 'sea' ? nextTerrain.type === 'sea' : nextTerrain.type !== 'sea' && nextTerrain.passable;
    if (allowed) {
      p.x = nx;
      p.y = ny;
      p.terrain = p.mode === 'sea' ? 'sea' : nextTerrain.type;
      moved = true;
      break;
    }
    blockedTerrain = nextTerrain;
  }

  if (!moved) {
    if (p.target) p.target = null;
    if (p.mode === 'land' && blockedTerrain?.type === 'highMountain') setNotice(p, '높은 산맥은 통과할 수 없습니다. 고개나 우회로를 찾으세요.');
    else if (p.mode === 'land' && blockedTerrain?.type === 'sea') setNotice(p, '탐험대는 바다를 건널 수 없습니다. 항구로 돌아가 배를 이용하세요.');
    else if (p.mode === 'sea' && blockedTerrain?.type !== 'sea') setNotice(p, '육지입니다. 가까운 항구를 통해 입항하세요.');
  }

  p.moving = moved;
  if (moved) {
    p.dir = vectorToDir(vx, vy);
    recordMovement(p, distanceXY(ox, oy, p.x, p.y));
  }
}

setInterval(() => {
  const dt = 1 / TICK_HZ;
  for (const [roomCode, room] of rooms) {
    const classMinutes = classGameMinutes(roomCode);
    for (const p of room.values()) {
      updateTimedTransition(p, classMinutes);
      updateSupplies(p, classMinutes);
      movePlayer(p, dt);
      updateFatigue(p, dt);
      updateMissionProgress(roomCode, p);
    }
  }
}, 1000 / TICK_HZ).unref();

setInterval(() => {
  const now = Date.now();
  for (const [roomCode, room] of rooms) {
    const classMinutes = classGameMinutes(roomCode, now);
    for (const p of room.values()) {
      const nearby = [];
      for (const other of room.values()) {
        if (other.id === p.id) continue;
        if (distance(p, other) <= NEARBY_RADIUS) nearby.push(publicPlayer(other, classMinutes));
      }
      const missionState = activeMissionState(roomCode, p.name, p);
      io.to(p.id).emit('snapshot', { serverTime: now, classGameMinutes: classMinutes, you: publicPlayer(p, classMinutes), nearby, online: room.size, settings: store.room(roomCode).settings, ...missionState });
    }
    const activeMission = store.room(roomCode).activeMission;
    io.to(`teacher:${roomCode}`).emit('teacherSnapshot', { serverTime: now, classGameMinutes: classMinutes, roomCode, players: [...room.values()].map((p) => publicPlayer(p, classMinutes)), mission: missionForTeacher(activeMission), progress: missionProgressList(roomCode, activeMission?.id), settings: store.room(roomCode).settings });
  }
}, 1000 / SNAPSHOT_HZ).unref();

setInterval(() => store.saveNow(), 5000).unref();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CDS95 실시간 학습 서버 v35: http://localhost:${PORT}`);
  console.log(`교사 관찰 화면: http://localhost:${PORT}/teacher.html`);
});
