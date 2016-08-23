/* globals handleBroadcast */
/* exported taskCompleted, sendTo */
let teams = localStorage.getItem('rallyTeams');
if (teams) {
	teams = JSON.parse(teams);
} else {
	teams = [
		{ id: 0, color: 'red', name: 'Red Sky At Night', tasksCompleted: [0, 1, 2], currentTask: 3 },
		{ id: 1, color: 'orangered', name: 'Orange & Mango', tasksCompleted: [], currentTask: 0 },
		{ id: 2, color: 'gold', name: 'Yellow Submarine', tasksCompleted: [], currentTask: 1 },
		{ id: 3, color: 'green', name: 'Green Dragon', tasksCompleted: [], currentTask: 2 },
		{ id: 4, color: 'blue', name: 'Blue Moon', tasksCompleted: [], currentTask: 4 },
		{ id: 5, color: 'purple', name: 'Purple Heart', tasksCompleted: [], currentTask: 5 },
		{ id: 6, color: '#b50', name: 'Brown Sugar', tasksCompleted: [], currentTask: 6 }
	];
	localStorage.setItem('rallyTeams', JSON.stringify(teams));
}

let tasks = localStorage.getItem('rallyTasks');
if (tasks) {
	tasks = JSON.parse(tasks);
} else {
	tasks = [
		{ id: -1, name: 'Church', points: 0, x: 362, y: 358 },
		{ id: 0, name: 'Stockade Hill Trig', points: 25, x: 464, y: 82 },
		{ id: 1, name: 'Mangemangeroa Reserve Trig', points: 25, x: 501, y: 293 },
		{ id: 2, name: 'Point View Reserve Trig', points: 25, x: 444, y: 516 },
		{ id: 3, name: 'Ormiston Road Bridge', points: 10, x: 338, y: 639 },
		{ id: 4, name: 'Mitre 10 Mega', points: 10, x: 308, y: 589 },
		{ id: 5, name: 'Pakuranga Library', points: 10, x: 121, y: 241 },
		{ id: 6, name: 'Old House', points: 10, x: 365, y: 472 },
		{ id: 7, name: 'Golf Club', points: 10, x: 367, y: 294 },
		{ id: 8, name: 'Picton Street', points: 10, x: 482, y: 92 },
		{ id: 10, name: 'Elm Park', points: 10, x: 224, y: 211 },
		/* ... */
	];
	localStorage.setItem('rallyTasks', JSON.stringify(tasks));
}
let homebase = getTask(-1);

function getTeam(teamID) {
	for (let t of teams) {
		if (t.id == teamID) {
			return t;
		}
	}
}

function getTask(taskID) {
	for (let t of tasks) {
		if (t.id == taskID) {
			return t;
		}
	}
}

function findDirection(fromTask, toTask) {
	let dx = toTask.x - fromTask.x;
	let dy = fromTask.y - toTask.y;	// using graph coords not svg
	let angle = Math.atan(dx / dy) * 180 / Math.PI;
	if (dy < 0) {
		if (angle < -67.5) return 'East';
		if (angle < -22.5) return 'South-East';
		if (angle <  22.5) return 'South';
		if (angle <  67.5) return 'South-West';
		return 'West';
	} else {
		if (angle < -67.5) return 'West';
		if (angle < -22.5) return 'North-West';
		if (angle <  22.5) return 'North';
		if (angle <  67.5) return 'North-East';
		return 'East';
	}
}

function findDistance(fromTask, toTask) {
	let dx = toTask.x - fromTask.x;
	let dy = fromTask.y - toTask.y;	// using graph coords not svg
	return Math.round(Math.sqrt(dx * dx + dy * dy) / 69 / 0.5) * 0.5;
}

function taskCompleted(teamID) {
	let team = getTeam(teamID);
	let task = getTask(team.currentTask);
	if (team.tasksCompleted.indexOf(task.id) >= 0) {
		console.error('This task has already been completed by this team.');
		return;
	}

	team.tasksCompleted.push(task.id);

	broadcast({
		action: 'taskCompleted',
		teamID
	});
}

function sendTo(teamID, nextTaskID) {
	let team = getTeam(teamID);
	let nextTask = getTask(nextTaskID);
	let lastTask;
	if (team.tasksCompleted.length > 0) {
		lastTask = getTask(team.tasksCompleted[team.tasksCompleted.length - 1]);
	} else {
		lastTask = homebase;
	}

	team.currentTask = nextTask.id;

	broadcast({
		action: 'taskAssigned',
		teamID
	});

	let direction = findDirection(lastTask, nextTask);
	let distance = findDistance(lastTask, nextTask);
	return {distance, direction};
}

function broadcast(messageData) {
	localStorage.setItem('rallyTeams', JSON.stringify(teams));
	messageData.broadcastName = 'rally';
	navigator.serviceWorker.controller.postMessage(messageData);
	handleBroadcast({data: messageData});
}
