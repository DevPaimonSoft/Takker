let hitbox = false;

function toggleReach(client) {
    hitbox = !hitbox;

    if (hitbox) {
        client.write('game_state_change', {
            reason: 3,
            gameMode: 1
        });
    } else {
        client.write('game_state_change', {
            reason: 3,
            gameMode: 0
        });
    }
}

module.exports = {
    toggleReach
};