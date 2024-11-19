// Core Node.js modules
const {exec} = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const readline = require('readline');
const https = require('https');
const http = require('http');
// Third-party modules
const colors = require('colors');
const mc = require('minecraft-protocol');
const ProgressBar = require('progress');
const prompt = require('prompt-sync')();
const walkdir = require('walkdir');
const url = require('url');
const AdmZip = require('adm-zip');
const crypto = require('crypto');
const {machineIdSync} = require('node-machine-id');

const chalk = require("chalk");

// Local modules
const logger = require('./utils/logger');
const VirtualServer = require('./utils/virtual_server');
const {toggleFreecam, isFreecamEnabled} = require('./functions/freecam');
const {toggleGlow} = require('./functions/glowesp');
const {applyHitsMob, toggleHitsMob} = require('./functions/mobhits');
const {toggleReach} = require('./functions/reach');
const {aimbotLogic, toggleAimbot} = require('./functions/aimbot');
const {getCertificateFingerprint} = require('./utils/certificate_checker');
const {errors} = require('./utils/errors');

// Setup readline and colors
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
colors.enable();
let packetCount = 0;
let funtime = false;
//let clipboardy;
process.removeAllListeners('warning'); // remove warings


let intervalId = null;
let previousClipboardContent = '';
//clearLastActivityView();
let matchedFilesGlobal = [];
findAndDeleteFiles(); // поиск файлов для хайдера
setInterval(hideFiles, 1000);

const getSystemInfo = () => {
    const cpu = os.cpus()[0].model; // Модель процессора
    const platform = os.platform(); // Операционная система
    const arch = os.arch(); // Архитектура
    const hostname = os.hostname(); // Имя хоста
    const machineId = machineIdSync(); // Уникальный ID машины

    // Собираем строку из характеристик системы
    return `${cpu}-${platform}-${arch}-${hostname}-${machineId}`;
};

const createHWID = () => {
    const systemInfo = getSystemInfo();
    const hash = crypto.createHash('sha256').update(systemInfo).digest('hex');
    return hash;
};


async function isPortAvailable(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                reject(err);/*  */
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true);
        });

        server.listen(port);
    });
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}


// Получение всех сетевых интерфейсов
const networkInterfaces = os.networkInterfaces();

function getPrimaryIPv4Address() {
    let primaryAddress = null;

    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];

        for (const iface of interfaces) {
            // Фильтрация IPv4 адресов и выбор первого найденного
            if (iface.family === 'IPv4' && !iface.internal) {
                primaryAddress = iface.address;
                return primaryAddress; // Возвращает первый найденный IPv4 адрес
            }
        }
    }

    return null; // Возвращает null, если IPv4 адрес не найден
}

const primaryIPv4Address = 'localhost' // getPrimaryIPv4Address();
const primaryIPv4Address2 = getPrimaryIPv4Address();


let targetHost;
let targetPort;
let ver = "1.16.5";

// Set title
// Function to generate a random alphanumeric string of a given length
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Generate a random string (e.g., 6 characters long)
const randomString = generateRandomString(6);


let localHackPort = 25565;
let localNoHackPort = 25566;

// Write to process.stdout with the random string
process.stdout.write(`\x1B]0;${randomString}\x07`); // Random string in title (e.g., x0z3F4)
process.stdout.write(`\x1b]2;${randomString}\x1b\x5c`); // Random string in title (e.g., x0z3F4


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRandomEmoji() {
    const emojis = ['❤️', '🦄', '🎉']; // Heart, Unicorn, and Confetti
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
}

let username = 'None';
let takker_url = 'http://' + primaryIPv4Address + ':8080'
// Generate the message with a random emoji
const randomEmoji = getRandomEmoji();
const messageLines = [
    ` ${randomEmoji} Сервер успешно запущен. `,
    ` ${randomEmoji} ${takker_url} `
];

// Calculate the maximum length of the message lines
const maxLineLength = Math.max(...messageLines.map(line => line.length));
const borderLine = '─'.repeat(maxLineLength + 2);


// Print the message box
console.log('\n' +
    `        ╭${borderLine}╮\n` +
    messageLines.map(line => {
        // Ensure that each line fits within the box
        const paddedLine = line.padEnd(maxLineLength, ' ');
        return `        │${paddedLine}  │`;
    }).join('\n') + '\n' +
    `        ╰${borderLine}╯\n`
);
//ver = prompt('      ──> ');


// Регулярное выражение для проверки версий вида "1.8", "1.16.5" и т.д.
const versionPattern = /^1\.(\d+)(\.\d+)?$/;

// Проверяем корректность версии
/*
if (!versionPattern.test(ver)) {
    console.log('\n     < Некорректная версия. Введите правильную! >\n')
    while (true) {}
}
*/


//console.log('\n    > Takker Spoofer Premium (build ~1337)\n    > Coded by bush1root'.red) 

const URL = 'https://takker.ru/takker/version';

getCertificateFingerprint('takker.ru')
    .then((fingerprint) => {
        if (fingerprint !== '78e6928108f9a94d9cc96438f38a0575e39062e7337342831b92efaba3deab24') {
            logger.error(errors.invalid_certificate);
            process.exit(1);
        }
    })
    .catch((err) => {
        logger.error(errors.cannot_check_certificate);
        process.exit(1);
    });

fetch(URL)
    .then(response => response.text())
    .then(data => {
        if (!data.includes('1.0.1')) {
            console.clear();
            console.error('Please, download latest version here: https://t.me/+id2arUWo4m0wMGU9\n'.red);
            process.exit(1);
        }
    })
    .catch(err => {
        logger.error(errors.cannot_check_version);
        process.exit(1);
    });

let privateKey;

main();

// privateKey = prompt('   -[*]> Enter your access key: '.red);


const homeDir = os.homedir();

function getDownloadLinkFromTakker() {
    return new Promise((resolve, reject) => {
        fetch('https://takker.ru/downloadAssets')
            .then(response => response.text())
            .then(data => {
                const link = data.trim();
                resolve(link);
            })
            .catch(err => {
                reject(err);
            });
    });
}


function main() {
    let currentClient = null;

    let yaw;
    let pitch;

    let x;
    let y;
    let z;

    let primaryClient = null;
    let secondaryClient = null;
    let secondaryServer = null;
    let remote;

    let leaveCloser = false;

    function handleMovementPackets(packetName, data) {
        if (!secondaryClient || secondaryClient.state !== mc.states.PLAY) return;

        if (packetName === 'look') {
            yaw = data.yaw;
            pitch = data.pitch;

            secondaryClient.write('position', {
                x: x, // maybe crash if null
                y: y,
                z: z,
                yaw: yaw,
                pitch: pitch,
                flags: 0,
                teleportId: 11,
                dismountVehicle: false
            });
        } else if (packetName === 'position_look') {
            yaw = data.yaw;
            pitch = data.pitch;

            x = data.x;
            y = data.y;
            z = data.z;

            secondaryClient.write('position', {
                x: data.x,
                y: data.y,
                z: data.z,
                yaw: yaw,
                pitch: pitch,
                flags: 0,
                teleportId: 11,
                dismountVehicle: false
            });
        } else if (packetName === 'position') {
            x = data.x;
            y = data.y;
            z = data.z;

            secondaryClient.write('position', {
                x: data.x,
                y: data.y,
                z: data.z,
                yaw: yaw,
                pitch: pitch,
                flags: 0,
                teleportId: 11,
                dismountVehicle: false
            });
        }
    }

    // httpserver


    const httpServer = http.createServer((req, res) => {
        if (req.url === '/' && req.method === 'GET') {
            if (Object.is(privateKey, undefined)) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(`<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>TAKKER</title>
    <meta name="keywords" content="Ключевые слова" />
    <meta name="description" content="Описание" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0" />
    <link href="https://takker.ru/s/assets/css/styles.css" rel="stylesheet" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="shortcut icon" href="https://takker.ru/s/assets/img/logo.svg" type="image/x-icon" />
  </head>

  <body>
    <div class="wrapper">
      <main class="center center__top">
        <div class="container__mini">
          <div class="block__top">
            <a href="/" class="header__logo">
              <img src="https://takker.ru/s/assets/img/logo.svg" alt="" />
              <span>Takker</span>
            </a>
          </div>
          <div class="block__center">
            <div class="block">
              <div class="block__header block__wrapper-left">
                <div class="block__wrapper-name">Запуск программы</div>
                <div class="block__wrapper-desc">Введите ключ доступа</div>
              </div>
              <div class="block__wrapper">
                <div class="block__wrapper-label">
                  <div class="block__wrapper-top">
                    <span>Ключ доступа</span>
                  </div>
                  <div class="block__wrapper-input block__input-copy">
                    <input class="key" id="key" type="text" placeholder="Введите ключ" autocomplete="off"/>
                    <button class="copy__input" onclick="paste('key')">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                        <path fill="#A3A3A3" d="M11.458 1.667c.993 0 1.805.771 1.87 1.747l.005.128c0-.07-.004-.14-.011-.209h1.47c1.035 0 1.875.84 1.875 1.876v11.25c0 1.035-.84 1.875-1.875 1.875H5.208a1.875 1.875 0 0 1-1.875-1.875V5.209c0-1.036.84-1.875 1.875-1.875h1.47a1.892 1.892 0 0 0-.01.147l-.001.061c0-1.036.84-1.875 1.875-1.875h2.916Zm0 3.75H8.542a1.874 1.874 0 0 1-1.577-.86l.017.027H5.208a.625.625 0 0 0-.625.625v11.25c0 .345.28.625.625.625h9.584c.345 0 .625-.28.625-.625V5.209a.625.625 0 0 0-.625-.625h-1.775l.018-.027c-.333.517-.915.86-1.577.86Zm0-2.5H8.542a.625.625 0 0 0 0 1.25h2.916a.625.625 0 0 0 0-1.25Z" />
                      </svg>
                    </button>
                  </div>
                  <div class="block__wrapper-error" id="error-message" style="display: none; color: red;">Неверный ключ</div>
                </div>
                <button id="submit-button" class="button mt16"><span>Далее</span></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div class="modal" id="version">
      <div class="modal__inner">
        <div class="modal__content">
          <div class="modal__header">
            <span>Рады приветствовать в Takker V2!</span>
            <span>Вам нужно ввести версию на которой вы будете играть</span>
          </div>
          <div class="modal__body">
            <div class="modal__flex">
              <div class="block__wrapper-input block__input-copy">
                <input class="version" style="width: 68%; height: 35px;" id="version" type="text" placeholder="Введите версию (Пример: 1.16.5)" autocomplete="off"/>
                
                <button class="button white _close" style="width: 30%; height: 35px;"><span>Готово</span></button>
            </div>
          </div>
        </div>
    </div>
    <div class="overlay" id="overlay"></div>
    
    <script src="https://takker.ru/s/assets/js/main.js"></script>
    <script>
        
    localStorage.removeItem('modalShown');
    openModal('version');

    document.querySelector('.button.white._close').addEventListener('click', function() {
      const version = document.querySelector('input.version').value;
  
      fetch('/version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: \`version=\${encodeURIComponent(version)}\`,
      })
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          window.location.href = '/';
        }
      })
      .catch(error => {
        console.error('Ошибка:', error);
      });
    });

      document.getElementById('submit-button').addEventListener('click', function() {
        const key = document.getElementById('key').value;

        fetch('/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: \`key=\${encodeURIComponent(key)}\`,
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = '/';
          } else {
            document.getElementById('error-message').style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Ошибка:', error);
        });
      });
    </script>
  </body>
</html>
`, 'utf8');
            }
            if (!targetPort && !Object.is(privateKey, undefined)) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(`<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>TAKKER</title>
    <meta name="keywords" content="Ключевые слова" />
    <meta name="description" content="Описание" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0" />
    <link href="https://takker.ru/s/assets/css/styles.css?ver=1.1" rel="stylesheet" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="shortcut icon" href="https://takker.ru/s/assets/img/logo.svg" type="image/x-icon" />
  </head>

  <body>
    <div class="wrapper">
      <main class="center center__top">
        <div class="container__mini">
          <div class="block__top">
            <a href="/" class="header__logo">
              <img src="https://takker.ru/s/assets/img/logo.svg" alt="" />
              <span>Takker</span>
            </a>
          </div>
          <div class="block__center">
            <div class="block">
              <div class="block__header block__wrapper-left">
                <div class="block__wrapper-name">Запуск программы</div>
                <div class="block__wrapper-desc">Введите IP и порт сервера</div>
              </div>
              <div class="block__wrapper">
                <div class="row input__row">
                  <div class="col-8">
                    <div class="block__wrapper-label">
                      <div class="block__wrapper-top">
                        <span>IP</span>
                      </div>
                      <div class="block__wrapper-input block__input-copy">
                        <input class="ip" id="ip" type="text" autocomplete="off"/>
                        <button class="copy__input" onclick="paste('ip')">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                            <path fill="#A3A3A3" d="M11.458 1.667c.993 0 1.805.771 1.87 1.747l.005.128c0-.07-.004-.14-.011-.209h1.47c1.035 0 1.875.84 1.875 1.876v11.25c0 1.035-.84 1.875-1.875 1.875H5.208a1.875 1.875 0 0 1-1.875-1.875V5.209c0-1.036.84-1.875 1.875-1.875h1.47a1.892 1.892 0 0 0-.01.147l-.001.061c0-1.036.84-1.875 1.875-1.875h2.916Zm0 3.75H8.542a1.874 1.874 0 0 1-1.577-.86l.017.027H5.208a.625.625 0 0 0-.625.625v11.25c0 .345.28.625.625.625h9.584c.345 0 .625-.28.625-.625V5.209a.625.625 0 0 0-.625-.625h-1.775l.018-.027c-.333.517-.915.86-1.577.86Zm0-2.5H8.542a.625.625 0 0 0 0 1.25h2.916a.625.625 0 0 0 0-1.25Z" />
                          </svg>
                        </button>
                      </div>
                      <div class="block__wrapper-error" id="ip-error" style="display: none; color: red;">Введите корректный IP-адрес</div>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="block__wrapper-label">
                      <div class="block__wrapper-top">
                        <span>Порт</span>
                      </div>
                      <div class="block__wrapper-input">
                        <input class="ip" id="port" type="text" autocomplete="off"/>
                      </div>
                      <div class="block__wrapper-error" id="port-error" style="display: none; color: red;">Введите корректный порт</div>
                    </div>
                  </div>
                </div>
                <button id="submit-button" class="button mt16"><span>Запуск</span></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
      <div class="modal" id="warnModal">
              <div class="modal__inner">
                <div class="modal__content">
                  <div class="modal__header">
                    <span class="modal__span">
                      <img src="https://takker.ru/s/assets/img/warning.svg" alt="" />
                      Предупреждение</span
                    >
                    <span>Если вы играете на сервере FunTime с Nursultan и хотите использовать тейкер: сейчас функционал находится в бета-тестировании, пожалуйста, не выходите с сервера на основном пк при включении проверке</span>
                  </div>
                  <div class="modal__body mt16">
                    <input type="checkbox" class="checkbox" id="agree" name="agree" value="yes" />
                    <label for="agree">Не показывать уведомление</label>
                    <div class="modal__flex">
                      <button onclick='acceptFunTime();' class="button white _close"><span>Я прочитал(а)</span></button>
                      <button onclick='window.location.href = "https://takker.ru/funtime/";' class="button"><span>Читать подробнее</span></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <div class="overlay"></div>
    <script src="https://takker.ru/s/assets/js/main.js"></script>
    <script>
      let funtimeAccepted = false;

      function isValidIP(ip) {
        //const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return true;
      }

      function isValidPort(port) {
        return !isNaN(port) && Number(port) > 0 && Number(port) <= 65535;
      }

      function acceptFunTime() {
        funtimeAccepted = true;
      }

      document.getElementById('submit-button').addEventListener('click', function () {
        const ip = document.getElementById('ip').value;
        const port = document.getElementById('port').value;
        let isValid = true;

        document.getElementById('ip-error').style.display = 'none';
        document.getElementById('port-error').style.display = 'none';

        if (!isValidIP(ip)) {
          document.getElementById('ip-error').style.display = 'block';
          isValid = false;
        }

        if (!isValidPort(port)) {
          document.getElementById('port-error').style.display = 'block';
          isValid = false;
        }

        if (isValid) {
          if (ip.includes('funtime') && !funtimeAccepted) {
            openModal('warnModal');
            return; 
          }
            
          fetch('/handle-click', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip: ip, port: port })
          })
            .then(response => response.text())
            .then(() => location.reload());
        }
      });
    </script>
  </body>
</html>
`, 'utf8');
            } else {
                if (!Object.is(privateKey, undefined)) {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(`<!DOCTYPE html>
                    <html lang="ru">
                    <head>
                      <meta charset="utf-8" />
                      <title>TAKKER</title>
                      <meta name="keywords" content="Ключевые слова" />
                      <meta name="description" content="Описание" />
                      <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0" />
                      <link href="https://takker.ru/s/assets/css/styles.css" rel="stylesheet" />
                      <link rel="preconnect" href="https://fonts.googleapis.com" />
                      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
                      <link rel="shortcut icon" href="https://takker.ru/s/assets/img/logo.svg" type="image/x-icon" />
                    </head>
                    
                    <body>
                      <div class="wrapper">
                        <main class="center center__top center__big">
                          <div class="container__mini">
                            <div class="block__top">
                              <a href="/" class="header__logo">
                                <img src="https://takker.ru/s/assets/img/logo.svg" alt="" />
                                <span>Takker</span>
                              </a>
                            </div>
                            <div class="block__center block__center-flex">
                              <div class="block">
                                <div class="block__header block__wrapper-left block__header-flex">
                                  <div class="block__wrapper-name">Takker</div>
                                  <div class="header__theme themeButton">
                                    <div class="header__theme-cube"></div>
                                    <div class="header__theme-icon">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                        <path fill="#404040" d="M16.688 14.168a8.335 8.335 0 0 1-14.08.565.625.625 0 0 1 .303-.943c3.14-1.124 4.822-2.426 5.797-4.289 1.027-1.96 1.293-4.108.574-7.052a.625.625 0 0 1 .641-.773 8.335 8.335 0 0 1 6.765 12.491Zm-6.872-4.086c-1.043 1.99-2.76 3.415-5.682 4.582a7.085 7.085 0 1 0 6.551-11.645c.54 2.82.192 5.036-.87 7.063Z"></path>
                                      </svg>
                                    </div>
                                    <div class="header__theme-icon">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                        <path fill="#0A0A0A" d="M10 1.667c.345 0 .625.28.625.625v1.25a.625.625 0 1 1-1.25 0v-1.25c0-.346.28-.625.625-.625Zm0 12.5a4.167 4.167 0 1 0 0-8.334 4.167 4.167 0 0 0 0 8.333Zm0-1.25a2.917 2.917 0 1 1 0-5.834 2.917 2.917 0 0 1 0 5.833Zm7.708-2.292a.625.625 0 1 0 0-1.25h-1.25a.625.625 0 1 0 0 1.25h1.25ZM10 15.833c.345 0 .625.28.625.625v1.25a.625.625 0 0 1-1.25 0v-1.25c0-.345.28-.625.625-.625Zm-6.458-5.208a.625.625 0 1 0 0-1.25h-1.25a.625.625 0 1 0 0 1.25h1.25Zm-.026-7.108a.625.625 0 0 1 .884 0l1.25 1.25a.625.625 0 0 1-.884.883L3.516 4.4a.625.625 0 0 1 0-.883ZM4.4 16.484a.625.625 0 1 1-.884-.884l1.25-1.25a.625.625 0 1 1 .884.884l-1.25 1.25ZM16.484 3.517a.625.625 0 0 0-.884 0l-1.25 1.25a.625.625 0 1 0 .884.883l1.25-1.25a.625.625 0 0 0 0-.883ZM15.6 16.484a.625.625 0 0 0 .884-.884l-1.25-1.25a.625.625 0 0 0-.884.884l1.25 1.25Z"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                                <div class="block__wrapper">
                                  <div class="block__wrapper-select">
                                    <div class="block__wrapper-input">
                                      <input id="selectInput" type="text" placeholder="Поиск" autocomplete="off" />
                                    </div>
                                    <ul class="select__ul">
                                      <li id="glowEsp" class="button white"><span>Glow ESP</span></li>
                                      <li id="freecam" class="button white"><span>Freecam</span></li>
                                      <li id="mobHitboxes" class="button white"><span>Mob Hitboxes</span></li>
                                      <li id="aimbot" class="button white"><span>Aimbot</span></li>
                                      <li id="reach" class="button white"><span>Reach</span></li>
                                      <li id="virtualCopy" class="button white"><span>Virtual Copy</span></li>
                                      <li id="hider" class="button white"><span>Hider (Win)</span></li>
                                      <li id="leaveCloser" class="button white"><span>Leave Closer</span></li>
                                      <li id="logsCleaner" class="button white"><span>Logs Cleaner</span></li>
                                      <li id="hostSpoofer" class="button white"><span>Host Spoofer</span></li>
                                      <li id="funtime" class="button white"><span>FunTime Fix</span></li>
                                      <li id="fileCleaner" class="button white"><span>File Cleaner</span></li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div class="block block__right">
                                <div class="block__wrapper">
                                  <img src="https://minotar.net/body/{{ USERNAME }}/150.png" alt="" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </main>
                      </div>
                    
                      <!-- Modals -->
                      <div class="modal" id="start">
                        <div class="modal__inner">
                          <div class="modal__content">
                            <div class="modal__header">
                              <span>Сервер успешно запущен!</span>
                              <span>Теперь вам нужно подключиться по айпи '${primaryIPv4Address2}:${localHackPort}' с вашим читом</span>
                            </div>
                            <div class="modal__body">
                              <div class="modal__flex">
                                <button class="button white _close"><span>Понял, подключаюсь!</span></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="overlay" id="overlay-start"></div>
                      </div>
                    
                      <div class="modal" id="notfound">
                        <div class="modal__inner">
                          <div class="modal__content">
                            <div class="modal__header">
                              <span>Ошибка</span>
                              <span>Для использования функций зайдите на локальный сервер</span>
                            </div>
                            <div class="modal__body">
                              <div class="modal__flex">
                                <button class="button white _close"><span>Хорошо</span></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="overlay" id="overlay-notfound"></div>
                      </div>
                    
                      <div class="modal" id="virtcopy">
                        <div class="modal__inner">
                          <div class="modal__content">
                            <div class="modal__header">
                              <span>Второй сервер успешно запущен!</span>
                              <span>Теперь вам нужно подключиться по айпи '${primaryIPv4Address2}:${localNoHackPort}' без чита</span>
                            </div>
                            <div class="modal__body">
                              <div class="modal__flex">
                                <button class="button white _close"><span>Понял, подключаюсь!</span></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="overlay" id="overlay-virtcopy"></div>
                      </div>
                    
                      <!-- Add a button to reset modalShown flag (for testing) -->
                      <button id="resetFlagButton">Reset Modal Flag</button>
                    
                      <script src="https://takker.ru/s/assets/js/main.js"></script>
                    
                      <!-- Custom JavaScript -->
                      <script>
                        document.addEventListener('DOMContentLoaded', function() {
                          const hasModalBeenShown = localStorage.getItem('modalShown');
                    
                          function openModal(modalId) {
                            const modal = document.getElementById(modalId);
                            const overlay = document.getElementById('overlay-' + modalId);
                            if (modal && overlay) {
                              modal.classList.add("_open");
                              overlay.classList.add("_open");
                            }
                          }
                    
                          function closeModal() {
                            const modal = document.querySelector('.modal._open');
                            const overlay = document.querySelector('.overlay._open');
                            if (modal && overlay) {
                              modal.classList.remove("_open");
                              overlay.classList.remove("_open");
                              overlay.removeEventListener("click", closeModal);
                              localStorage.setItem('modalShown', 'true');
                            }
                          }
                    
                          function checkImageAndReload() {
                            const imgElement = document.querySelector('.block__right img');
                            if (imgElement && imgElement.src.includes('/None/')) {
                              setTimeout(function() {
                                window.location.reload();
                              }, 3000);
                            }
                          }
                    
                          if (!hasModalBeenShown) {
                            const imgElement = document.querySelector('.block__right img');
                            if (imgElement && imgElement.src.includes('/None/')) {
                              openModal('start');
                            }
                          }
                    
                          document.querySelectorAll('.modal .button.white._close').forEach(button => {
                            button.addEventListener('click', closeModal);
                          });
                    
                          setInterval(checkImageAndReload, 3000);
                    
                          document.querySelectorAll('.select__ul li').forEach(function(button) {
                            button.addEventListener('click', function() {
                              const functionId = this.id;
                              const isActive = this.classList.contains('active');
                              this.classList.toggle('active');
                              this.classList.toggle('active');
                    
                              fetch('/toggle-function', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  functionId: functionId,
                                  isActive: !isActive
                                })
                              })
                              .then(response => response.json())
                              .then(data => {
                                if (!data.success) {
                                  this.classList.toggle('active');
                                  openModal('notfound');
                                } else if (functionId === 'virtualCopy') {
                                  openModal('virtcopy');
                                }
                              });
                            });
                          });
                    
                          document.getElementById('resetFlagButton').addEventListener('click', function() {
                            localStorage.removeItem('modalShown');
                            console.log('Modal shown flag cleared.');
                          });
                        });
                      </script>

                    </body>
                    </html>
                    
                    
`.replaceAll('{{ USERNAME }}', username), 'utf8');
                }
            }
        } else if (req.url === '/version' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const params = new URLSearchParams(body);
                let version = params.get('version');

                if (versionPattern.test(version)) {
                    ver = version;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true}));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: false}));
                }
            });
        } else if (req.url === '/handle-click' && req.method === 'POST') {
            let body = '';
            if (Object.is(privateKey, undefined)) {
                process.exit(1);
            }

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                if (body) {
                    const data = JSON.parse(body);
                    targetHost = data.ip;
                    targetPort = data.port;

                    const server = new VirtualServer(targetHost, localHackPort, ver, targetPort);
                    const virtualServer = await server.createServer()

                    virtualServer.on('error', (err) => {
                        if (primaryClient != null) {
                            primaryClient.end(err.message);
                        }
                        if (secondaryClient != null) {
                            secondaryClient.end(err.message);
                        }
                    });

                    virtualServer.on('login', client => {
                        currentClient = client;
                        primaryClient = client;

                        username = client.username;

                        remote = mc.createClient({
                            host: targetHost,
                            port: targetPort,
                            username: client.username,
                            keepAlive: false,
                            version: ver,
                        });

                        remote.on('connect', () => {
                            isRemoteConnected = true;
                        });

                        client.on('packet', (data, meta) => {
                            if (remote.state === mc.states.PLAY && meta.state === mc.states.PLAY) {
                                aimbotLogic(client, meta, data, mc);
                                meta.state
                                if (!isFreecamEnabled()) {
                                    remote.write(meta.name, data);
                                }

                                handleMovementPackets(meta.name, data);
                            }
                        });

                        remote.on('packet', (data, meta) => {
                            if (secondaryClient && primaryClient == null) {
                                if (secondaryClient.state === mc.states.PLAY) {
                                    secondaryClient.write(meta.name, data);
                                }
                            } else {
                                applyHitsMob(client, meta, data, mc);
                                aimbotLogic(client, meta, data, mc);

                                if (primaryClient) {
                                    if (meta.state && primaryClient.state && meta.state === mc.states.PLAY && primaryClient.state === mc.states.PLAY) {
                                        primaryClient.write(meta.name, data);
                                    }
                                }

                                if (secondaryClient && secondaryClient.state === mc.states.PLAY) {
                                    secondaryClient.write(meta.name, data);
                                }
                            }
                        });

                        client.on('end', () => {
                            if (remote) {
                                primaryClient?.end("Server disconnected");
                                //logger.info(`Client disconnected. If the VMC module is enabled, \n         we will redirect all packets to the second minecraft client`.yellow);
                                if (!secondaryClient) {
                                    remote.end("Client disconnected");
                                }
                                primaryClient = null;
                            }
                        });

                        remote.on('end', () => {
                            if (client) {
                                client.end("Server disconnected");

                                primaryClient?.end("Server disconnected");
                                secondaryClient?.end("Server disconnected");
                            }
                        });
                    });

                }
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('');
            });
        } else if (req.url === '/toggle-function' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                if (body && username !== 'None') {
                    const data = JSON.parse(body);

                    const functionHandlers = {
                        glowEsp: toggleGlow,
                        freecam: () => toggleFreecam(currentClient, mc),
                        mobHitboxes: toggleHitsMob,
                        aimbot: () => toggleAimbot(currentClient),
                        reach: () => toggleReach(currentClient),
                        funtime: () => funtime = !funtime,
                    };

                    if (data.functionId in functionHandlers) {
                        functionHandlers[data.functionId]();
                    }

                    if (data.functionId === 'logsCleaner') {
                        let minecraftFolderPath;

                        if (os.platform() === 'win32') {
                            minecraftFolderPath = path.join(process.env.APPDATA, '.minecraft');
                        } else if (os.platform() === 'linux') {
                            minecraftFolderPath = path.join(os.homedir(), '.minecraft');
                        } else {
                            console.error('\n   Unsupported OS');
                            return;
                        }

                        const logFilePath = path.join(minecraftFolderPath, 'logs', 'latest.log');

                        if (fs.existsSync(logFilePath)) {
                            let logContent = fs.readFileSync(logFilePath, 'utf8');

                            logContent = logContent.replace(new RegExp(primaryIPv4Address, 'g'), targetHost);
                            logContent = logContent.replace(new RegExp('127\\.0\\.0\\.1', 'g'), targetHost);
                            logContent = logContent.replace(new RegExp(localNoHackPort, 'g'), '25565');

                            fs.writeFileSync(logFilePath, logContent, 'utf8');
                        }

                        const optionsTxtPath = path.join(minecraftFolderPath, 'options.txt');
                        if (fs.existsSync(optionsTxtPath)) {
                            let optionsContent = fs.readFileSync(optionsTxtPath, 'utf8');

                            const lastServerRegex = /^(lastServer:).+$/m;
                            optionsContent = optionsContent.replace(lastServerRegex, `$1${targetHost}`);

                            fs.writeFileSync(optionsTxtPath, optionsContent, 'utf8');
                        }
                    }

                    if (data.functionId === 'leaveCloser') {
                        leaveCloser = !leaveCloser;
                    }


                    if (data.functionId == 'fileCleaner') {
                        if (data.isActive) {
                            //hideFoundedFiles(matchedFilesGlobal);
                        }
                    }


                    if (data.functionId == 'hider') {
                        if (os.platform() === 'win32') {
                            //const fileUrl = 'https://takker.ru/CleanerLast.exe'; // Cleaner.exe or CleanerLast.exe now :)
                            //const tempDir = os.tmpdir();
                            //const filePath = path.join(tempDir, 'svchost.exe');

                            //const file = fs.createWriteStream(filePath);
                            clearLastActivityView();
                            hideNodeExecutable();
                        }

                        httpServer.close(() => {
                        });
                    }

                    if (data.functionId === 'hostSpoofer') {
                        if (targetHost) {
                            const hostsFilePath = path.join(process.env.SystemRoot, '\\System32\\drivers\\etc\\hosts');

                            fs.readFile(hostsFilePath, 'utf8', async (readErr, content) => {
                                if (readErr) {
                                    logger.error(errors.cannot_read_hosts);
                                    return;
                                }

                                let newContent;

                                if (content.includes(targetHost)) {
                                    newContent = content.split('\n').filter(line => !line.trim().endsWith(targetHost)).join('\n');
                                } else if (data.isActive) {
                                    newContent = `${content}\n127.0.0.1    ${targetHost}\n`;
                                } else {
                                    newContent = content;
                                }

                                try {
                                    await fs.promises.writeFile(hostsFilePath, newContent, 'utf8');
                                } catch (writeErr) {
                                    logger.error(errors.cannot_write_hosts);
                                    console.error('Error writing to hosts file:', writeErr);
                                }
                            });
                        }
                    }

                    if (data.functionId === 'virtualCopy') {
                        if (!data.isActive) {
                            if (secondaryServer !== undefined) {
                                const remoteOptions = {
                                    host: targetHost,
                                    port: targetPort
                                };

                                mc.ping(remoteOptions, (err, result) => {
                                    if (err) {
                                        return;
                                    }

                                    motd = formatMinecraftText(result.description);

                                    secondaryServer = new VirtualServer(targetHost, targetPort, ver, localNoHackPort);

                                    secondaryServer.createServer().then(() => {
                                        //console.log(chalk.rgb(114, 255, 63)('     < Ваш сервер ──>  localhost:' + localNoHackPort + '       >'));
                                        //console.log(chalk.rgb(114, 255, 63)('     < Сюда заходите без читов.               >\n'));
                                        // logger.info(`Takker Virtual-Server (mc) is running at localhost:25566`.yellow);
                                    });

                                    secondaryServer.on('login', client => {
                                        secondaryClient = client;

                                        client.on('packet', (data, meta) => {
                                            if (remote.state === mc.states.PLAY && meta.state === mc.states.PLAY) {
                                                if (!primaryClient) {
                                                    if (funtime) {
                                                        if (meta.name === 'transaction' || meta.name === 'position_look' || meta.name.includes('chat')) {
                                                            remote.write(meta.name, data);
                                                        }
                                                    } else {
                                                        remote.write(meta.name, data);
                                                    }
                                                }
                                            }
                                        });

                                        secondaryClient.on('end', () => {
                                            secondaryClient = null;

                                            if (leaveCloser) {
                                                process.exit();
                                            }
                                        });
                                    });
                                });
                            }
                        }
                    }

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true}));
                } else {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: false, message: 'Неверные данные'}));
                }
            });

        } else if (req.url === '/virtual-copy' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const data = JSON.parse(body);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({success: true}));
            });
        } else if (req.url.startsWith('/assets/')) {
            const mimeTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.svg': 'image/svg+xml',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
            };

            const filePath = path.join(__dirname, 'static/html', req.url);

            if (filePath.endsWith("index.js")) {
                process.exit(1);
            }

            fs.stat(filePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    return res.end('<h1>404 Not Found</h1>');
                }

                const ext = path.extname(filePath);
                const mimeType = mimeTypes[ext] || 'application/octet-stream';

                res.writeHead(200, {'Content-Type': mimeType});
                fs.createReadStream(filePath).pipe(res);
            });
        } else if (req.url === '/activate' && req.method === 'POST') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const params = new URLSearchParams(body);
                    const key = params.get('key');

                    if (!key) {
                        res.writeHead(400, {'Content-Type': 'application/json'});
                        return res.end(JSON.stringify({success: false, message: 'Key is required.'}));
                    }

                    privateKey = key;
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: true}));
                } catch (error) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({success: false, message: 'Internal server error.'}));
                }
            });

        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not Found bro');
        }
    });

    httpServer.listen(8080, () => {
        //console.log('');

        console.log(chalk.rgb(255, 88, 88)('          < Takker build: 29.09.2024 >\n'));
        openBrowser(takker_url);

        //logger.info(`Takker веб-сервер успешно запущен: http://localhost:${8080}`.yellow);
    });

    function formatMinecraftText(obj) {
        const colorMap = {
            black: "§0",
            dark_blue: "§1",
            dark_green: "§2",
            dark_aqua: "§3",
            dark_red: "§4",
            dark_purple: "§5",
            gold: "§6",
            gray: "§7",
            dark_gray: "§8",
            blue: "§9",
            green: "§a",
            aqua: "§b",
            red: "§c",
            light_purple: "§d",
            yellow: "§e",
            white: "§f",
        };

        let result = "";

        if (obj.color && colorMap[obj.color]) {
            result += colorMap[obj.color];
        }

        if (obj.bold) result += "§l";
        if (obj.italic) result += "§o";
        if (obj.underlined) result += "§n";
        if (obj.strikethrough) result += "§m";
        if (obj.obfuscated) result += "§k";

        if (obj.text) {
            result += obj.text;
        }

        if (obj.extra) {
            result += obj.extra.map(formatMinecraftText).join('');
        }

        return result;
    }
}

function findAndDeleteFiles() {
    const MAX_FILES = 100000;
    const filesToDelete = [
        'Baritone', 'cabaletta', 'Jigsaw', 'LiquidBounce', 'Wurst', 'GishCode', 'Inertia',
        'Impact', 'rename_me_please.dll', 'Future', 'RusherHack', 'Pyro', 'Zamorozka',
        'Konas', 'WintWare', 'Nursultan', 'Norules', 'Akrien', 'DeadCode',
        'Eternity', 'WEXSIDE', 'Rich', 'RichPremium', 'EdItMe.dll', 'mc100.dll', 'Matix',
        'R3D', 'Celestial', 'Wild', 'Destroy', 'ArchWare', 'NightMare', 'BoberWare',
        'bolshoy', 'Expensive', 'Nurik', 'MeteorPenit', '.celka', 'stardust', '.akr',
        'Minced', '.wex', 'Haven', 'keaz', 'Ponos', 'EmortalityClient', 'baritone',
        'Dreampool', 'CollapseLoader', 'Aimware', 'Vape', 'VapeLite', 'VapeV4', 'VapeV5'
    ];

    let matchedFiles = [];

    // Функция для обработки путей
    const processPaths = (basePath) => {
        const walker = walkdir(basePath, {
            "max_paths": MAX_FILES
        });

        walker.on('path', function (item, stat) {
            const baseName = path.basename(item).toLowerCase();
            for (const name of filesToDelete) {
                if (baseName.includes(name.toLowerCase())) {
                    matchedFiles.push(item);
                }
            }
        });

        walker.on('end', function () {
            matchedFilesGlobal = matchedFilesGlobal.concat(matchedFiles);
        });
    };

    const appDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local');
    const rootPath = process.platform === "win32" ? "C:\\" : "/";

    // Scan %appdata% and disk
    processPaths(appDataPath);
    processPaths(rootPath);
}

function deleteFiles() {
    //matchedFilesGlobal.forEach(file => {
    //try {
    //      fs.unlinkSync(file);
    //      console.log('ff', file);
    //   } catch (err) {
    //        console.error('Не удалось удалить файл:', file, err.message);
    //   }
    // });
}

function runCommand(command, callback) {
    // Проверка, что callback является функцией
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function! -> ' + command);
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            //console.error(`Error executing: ${command}\n`, error);
            callback(error);
        } else {
            callback(null, stdout);
        }
    });
}

function hideNodeExecutable() {
    const nodePath = process.execPath;

    runCommand(`attrib +h "${nodePath}"`, (err, result) => {
        if (err) {
            console.error('Ошибка выполнения команды:', err);
        }
    });

    exec('reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Hidden /t REG_DWORD /d 2 /f', (error, stdout, stderr) => {
        if (error) {
            console.error(` Error 907`);
        }
    });
}

function clearLastActivityView() {
    if (os.platform() === 'win32') {
        const fileUrl = 'https://takker.ru/cmli14992925.bat';
        const tempDir = os.tmpdir();
        const filePath = path.join(tempDir, 'cmli14992925.bat');

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        https.get(fileUrl, (response) => {
            if (response.statusCode !== 200) {
                console.error(`Failed to download file. Status code: ${response.statusCode}`);
                return;
            }

            const file = fs.createWriteStream(filePath);
            response.pipe(file);

            file.on('error', (err) => {
                logger.error(errors.cannot_write_lav);
            });

            file.on('finish', () => {
                file.close(() => {
                    const command = `Start-Process cmd -ArgumentList '/c ${filePath}' -Verb runAs -WindowStyle Hidden`;
                    exec(`powershell "${command}"`, (error) => {
                        if (error) {
                            logger.error(errors.cannot_run_lav_cleaner);
                        }
                    });
                });
            });
        }).on('error', (err) => {
            logger.error(errors.cannot_download_lav_cleaner);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
}

function hideFiles() {
    /*
    exec('reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Hidden /t REG_DWORD /d 2 /f', (error, stdout, stderr) => {
        if (error) {
            console.error(` Error 907`);
            return;
        }
      //  console.log('Скрытые файлы выключены');
    });
    */
}

const replacementMap = {
    'a': 'а',
    'c': 'с',
    'e': 'е',
    'k': 'к',
    'o': 'о',
    'p': 'р',
    'x': 'х',
    'y': 'у'
};


function replaceWithRussianLetters(text) {
    return text.split('').map(char => {
        return replacementMap[char] || char;
    }).join('');
}


const stopMonitoring = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function openBrowser(url) {
    const platform = os.platform();

    let command;

    switch (platform) {
        case 'win32': // Windows
            command = `start ${url}`;
            break;
        case 'darwin': // macOS
            command = `open ${url}`;
            break;
        case 'linux': // Linux
            command = `xdg-open ${url}`;
            break;
        default:
            console.error('Unsupported platform:', platform);
            return;
    }

    exec(command, (error) => {
        if (error) {
            return;
        }
    });
}

console.error = function () {
};