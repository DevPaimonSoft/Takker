let glow = false;

function applyGlow(client, meta, data, mc) {
    if (meta.state === mc.states.PLAY && client.state === mc.states.PLAY) {
        if (glow) {
            client.write('entity_metadata', {
                entityId: data.entityId,
                metadata: [{
                    key: 0,
                    value: 0x40,  // значение для глоу
                    type: 0
                }]
            });
        }


        // elytra bug fix
        /*
        else {
            client.write('entity_metadata', {
                entityId: data.entityId,
                metadata: [{
                    key: 0,
                    value: 0x00,  // значение для отмены глоу
                    type: 0
                }]
            });
        }
        */
    }
}

function toggleGlow() {
    glow = !glow;
}

function isGlowing() {
    return glow;
}

module.exports = {
    applyGlow,
    toggleGlow,
    isGlowing
};