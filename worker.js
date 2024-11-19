const { parentPort } = require('worker_threads');
const exec = require('child_process').exec;

parentPort.on('message', (message) => {
    if (message.task === 'executeFunction') {
        hideFoundedFiles(message.data);
        parentPort.postMessage({ status: 'done' });
    }
});

function hideFoundedFiles(matchedFilesGlobal) {
    // console.log(1);
    matchedFilesGlobal.forEach(file => {
       // console.log(file);
        exec(`attrib +h "${file}"`, (error) => {
            if (error) {
                // console.error(`Ошибка при попытке скрыть файл ${file}: ${error}`);
            } else {
                // console.log(`Файл ${file} успешно скрыт.`);
            }
        });
    });
}