let freecam = false;

function toggleFreecam(client, mc) {
    if (client && client.state === mc.states.PLAY) {
        if (!freecam) {
            freecam = true;
            client.write('game_state_change', {
                reason: 3,
                gameMode: 3
            });
        } else {
            freecam = false;
            client.write('game_state_change', {
                reason: 3,
                gameMode: 0
            });
        }
    }
}

function isFreecamEnabled() {
    return freecam;
}

module.exports = {
    toggleFreecam,
    isFreecamEnabled
};