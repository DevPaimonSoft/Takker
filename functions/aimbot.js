let aimbot = false;

let playerPitch;
let playerYaw;
let playerX;
let playerY;
let playerZ;
const entityIds = [];
const entityX = [];
const entityY = [];
const entityZ = [];


function aimbotLogic(client, meta, data, mc) {
    if (meta.state === mc.states.PLAY && client.state === mc.states.PLAY && aimbot) {
        if (data.x && data.entityId) {
            const index = entityIds.indexOf(data.entityId);
            if (index === -1) { // Новая сущность
                entityIds.push(data.entityId);
                entityX.push(data.x);
                entityY.push(data.y);
                entityZ.push(data.z);
            } else { // Обновление сущности
                entityX[index] = data.x;
                entityY[index] = data.y;
                entityZ[index] = data.z;
            }
        }

        if (data.dX) {
            const index = entityIds.indexOf(data.entityId);
            if (index !== -1) {
                entityX[index] += data.dX / 4096.0;
                entityY[index] += data.dY / 4096.0;
                entityZ[index] += data.dZ / 4096.0;

                const enemyX = entityX[index];
                const enemyY = entityY[index];
                const enemyZ = entityZ[index];

                const diffX = enemyX - playerX;
                const diffY = enemyY - playerY;
                const diffZ = enemyZ - playerZ;

                const squaredDistance = diffX * diffX + diffY * diffY + diffZ * diffZ;
                //console.log(squaredDistance)

                if (squaredDistance <= 9) {
                    const horizontalDistance = Math.sqrt(diffX * diffX + diffZ * diffZ);

                    const horizontalAngle = Math.atan2(diffZ, diffX) - Math.PI / 2;
                    const verticalAngle = -Math.atan2(diffY, horizontalDistance);

                    const desiredYaw = horizontalAngle * (180 / Math.PI);
                    const desiredPitch = verticalAngle * (180 / Math.PI);

                    client.write('position', {
                        x: playerX,
                        y: playerY,
                        z: playerZ,
                        yaw: desiredYaw,
                        pitch: desiredPitch,
                        flags: 0,
                        teleportId: 11,
                        dismountVehicle: true
                    });
                }
            }
        }




        // client
        if (meta.name == 'position') {
            playerX = data.x;
            playerY = data.y;
            playerZ = data.z;
        }

        if (meta.name == 'look') {
            playerYaw = data.yaw;
            playerPitch = data.pitch;
        }

        if (meta.name == 'look') {
            for (let i = 0; i < entityIds.length; i++) {
                const enemyX = entityX[i];
                const enemyY = entityY[i];
                const enemyZ = entityZ[i];

                const diffX = enemyX - playerX;
                const diffY = enemyY - (playerY + 1.62); // учтем высоту глаз игрока
                const diffZ = enemyZ - playerZ;

                const squaredDistance = diffX * diffX + diffY * diffY + diffZ * diffZ;
                //console.log(squaredDistance +"xx");

                if (squaredDistance <= 9) {
                    const horizontalDistance = Math.sqrt(diffX * diffX + diffZ * diffZ);

                    const horizontalAngle = Math.atan2(diffZ, diffX) - Math.PI / 2;
                    const verticalAngle = -Math.atan2(diffY, horizontalDistance);

                    const desiredYaw = horizontalAngle * (180 / Math.PI);
                    const desiredPitch = verticalAngle * (180 / Math.PI);

                    //console.log(`Желаемый yaw: ${desiredYaw}`);
                    //console.log(`Желаемый pitch: ${desiredPitch}`);

                    client.write('position', {
                        x: playerX,
                        y: playerY,
                        z: playerZ,
                        yaw: desiredYaw,
                        pitch: desiredPitch,
                        flags: 0,
                        teleportId: 11,
                        dismountVehicle: true
                    });
                }
            }
        }
    }
}

function toggleAimbot(client) {
    aimbot = !aimbot;

    //client.write('game_state_change', {
    //    reason: 3, 
    //    gameMode: 1 
    //});
}

module.exports = {
    aimbotLogic,
    toggleAimbot
};