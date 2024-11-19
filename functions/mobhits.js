let hitbox = false;

function applyHitsMob(client, meta, data, mc) {
    if (meta.state === mc.states.PLAY && client.state === mc.states.PLAY) {
        if (data.type && hitbox) {
            data.type = 36; // 17 рыба / 36 голем
        }
    }
}

function toggleHitsMob() {
    hitbox = !hitbox;
}

module.exports = {
    applyHitsMob,
    toggleHitsMob
};