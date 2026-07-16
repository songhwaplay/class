'use strict';

const fs = require('node:fs');
const path = require('node:path');

function emptyRoom() {
  return {
    activeMission: null,
    progress: {},
    settings: { paused: false, locked: false },
    clock: { gameMinutes: 0 }
  };
}

function minimalProgress(value) {
  const status = ['assigned', 'inProgress', 'completed'].includes(value?.status)
    ? value.status
    : 'assigned';
  const stageIndex = Math.max(0, Math.min(20, Number.isFinite(value?.stageIndex) ? Math.floor(value.stageIndex) : 0));
  const cargoItemId = typeof value?.cargoItemId === 'string' ? value.cargoItemId.slice(0, 40) : null;
  const selectedMissionId = typeof value?.selectedMissionId === 'string' ? value.selectedMissionId.slice(0, 80) : null;
  const selectedStartPlaceId = typeof value?.selectedStartPlaceId === 'string' ? value.selectedStartPlaceId.slice(0, 80) : null;
  const shipPortId = typeof value?.shipPortId === 'string' ? value.shipPortId.slice(0, 80) : selectedStartPlaceId;
  return {
    status,
    stageIndex,
    cargoItemId,
    selectedMissionId,
    selectedStartPlaceId,
    shipPortId,
    completedAt: status === 'completed' && Number.isFinite(value?.completedAt) ? value.completedAt : null,
    completedGameMinutes: status === 'completed' && Number.isFinite(value?.completedGameMinutes) ? Math.max(0, value.completedGameMinutes) : null,
    finishRank: status === 'completed' && Number.isFinite(value?.finishRank) ? Math.max(1, Math.floor(value.finishRank)) : null
  };
}

class ClassroomStore {
  constructor(options = {}) {
    const dataDir = options.dataDir || process.env.DATA_DIR || path.join(process.cwd(), 'runtime');
    fs.mkdirSync(dataDir, { recursive: true });
    this.filePath = path.join(dataDir, 'classroom-state.json');
    this.state = { version: 9, rooms: {} };
    this.saveTimer = null;
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const parsed = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (!parsed || !parsed.rooms || typeof parsed.rooms !== 'object') return;

      const rooms = {};
      for (const [roomCode, source] of Object.entries(parsed.rooms)) {
        const room = emptyRoom();
        room.activeMission = source?.activeMission || null;
        room.settings = { paused: false, locked: false, ...(source?.settings || {}) };
        room.clock = { gameMinutes: Number.isFinite(source?.clock?.gameMinutes) ? Math.max(0, source.clock.gameMinutes) : 0 };

        const activeMissionId = room.activeMission?.id;
        if (activeMissionId && source?.progress && typeof source.progress === 'object') {
          for (const [studentName, missions] of Object.entries(source.progress)) {
            const value = missions?.[activeMissionId];
            if (!value) continue;
            room.progress[studentName] = { [activeMissionId]: minimalProgress(value) };
          }
        }
        rooms[roomCode] = room;
      }
      this.state = { version: 9, rooms };
    } catch (error) {
      console.error('수업 상태 불러오기 실패:', error.message);
    }
  }

  room(roomCode) {
    if (!this.state.rooms[roomCode]) this.state.rooms[roomCode] = emptyRoom();
    const room = this.state.rooms[roomCode];
    room.activeMission ??= null;
    room.progress = room.progress && typeof room.progress === 'object' ? room.progress : {};
    room.settings = { paused: false, locked: false, ...(room.settings || {}) };
    room.clock = { gameMinutes: Number.isFinite(room.clock?.gameMinutes) ? Math.max(0, room.clock.gameMinutes) : 0 };
    delete room.missionHistory;
    delete room.journals;
    return room;
  }

  studentProgress(roomCode, studentName, missionId, create = true) {
    const room = this.room(roomCode);
    if (!missionId) return null;
    if (!room.progress[studentName] && create) room.progress[studentName] = {};
    if (!room.progress[studentName]) return null;
    if (!room.progress[studentName][missionId] && create) {
      room.progress[studentName][missionId] = {
        status: 'assigned',
        stageIndex: 0,
        cargoItemId: null,
        selectedMissionId: null,
        selectedStartPlaceId: null,
        shipPortId: null,
        completedAt: null,
        completedGameMinutes: null,
        finishRank: null
      };
    }
    return room.progress[studentName][missionId] || null;
  }

  setActiveMission(roomCode, mission) {
    const room = this.room(roomCode);
    room.activeMission = mission;
    room.progress = {};
    this.scheduleSave();
    return room;
  }

  clearActiveMission(roomCode) {
    const room = this.room(roomCode);
    room.activeMission = null;
    room.progress = {};
    this.scheduleSave();
    return room;
  }


  setRoomClock(roomCode, gameMinutes) {
    const room = this.room(roomCode);
    room.clock = { gameMinutes: Math.max(0, Number(gameMinutes) || 0) };
    this.scheduleSave(500);
    return room.clock;
  }

  setRoomSettings(roomCode, patch) {
    const room = this.room(roomCode);
    room.settings = { ...room.settings, ...patch };
    this.scheduleSave();
    return room.settings;
  }

  scheduleSave(delay = 180) {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveNow(), delay);
    this.saveTimer.unref?.();
  }

  saveNow() {
    clearTimeout(this.saveTimer);
    this.saveTimer = null;
    const tmp = `${this.filePath}.tmp`;
    try {
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
      fs.renameSync(tmp, this.filePath);
    } catch (error) {
      console.error('수업 상태 저장 실패:', error.message);
      try { fs.rmSync(tmp, { force: true }); } catch {}
    }
  }
}

module.exports = ClassroomStore;
