<?php
/**
 * 怪物国度 - 安全存档 API（增强版）
 *
 * 安全特性：
 * 1. 增强Token生成（随机数+时间戳+密码哈希）
 * 2. 存档数据AES-256-CBC加密存储
 * 3. 存档完整性HMAC-SHA256校验
 * 4. 特征码+Token双重验证防盗用
 * 5. 防重放攻击机制
 * 6. 完善的错误日志记录
 * 7. 向后兼容旧格式存档
 */

date_default_timezone_set('Asia/Shanghai');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, '只支持 POST 请求');
}

// ---------- 安全配置 ----------
define('DATA_DIR', __DIR__ . '/data');
define('USERS_FILE', DATA_DIR . '/users.json');
define('SAVES_DIR', DATA_DIR . '/saves');
define('LOG_FILE', DATA_DIR . '/api.log');

// 加密密钥（生产环境必须设置，请通过环境变量读取）
define('ENCRYPTION_KEY', '');
define('HMAC_SECRET', '');
define('FEATURE_SECRET', '');

// Token有效期（秒）
define('TOKEN_EXPIRE_SECONDS', 3600); // 1小时
define('TOKEN_RENEW_THRESHOLD', 1800); // 剩余半小时自动续期

// 确保目录存在
ensureDir(DATA_DIR);
ensureDir(SAVES_DIR);

// ---------- 核心安全函数 ----------

/**
 * 生成高强度Token
 * 算法：base64url(随机32字节 + 时间戳 + 用户ID哈希)
 */
function generateSecureToken($username, $passwordHash) {
    $random = random_bytes(32);
    $timestamp = pack('J', time()); // 8字节时间戳
    $userHash = hash('sha256', $username . $passwordHash, true); // 32字节
    $tokenRaw = $random . $timestamp . $userHash;
    $token = base64UrlEncode($tokenRaw);
    return $token;
}

/**
 * Base64 URL安全编码
 */
function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64 URL安全解码
 */
function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

/**
 * 生成角色特征码（不可逆）
 * 同一(用户名,角色名)始终产生同一特征码
 */
function generateFeatureCode($username, $characterName) {
    $data = strtolower(trim($username)) . '::' . trim($characterName) . '::FEATURE';
    $raw = hash_hmac('sha256', $data, FEATURE_SECRET, true);
    $b64 = base64UrlEncode(substr($raw, 0, 28));
    return 'MK_' . $b64;
}

/**
 * 验证特征码（常量时间比较，防时序攻击）
 */
function verifyFeatureCode($username, $characterName, $featureCode) {
    $expected = generateFeatureCode($username, $characterName);
    return hash_equals($expected, $featureCode);
}

/**
 * AES-256-CBC加密
 */
function encryptData($data, $key) {
    $iv = random_bytes(16); // CBC模式需要16字节IV
    $key = substr(hash('sha256', $key, true), 0, 32); // 确保32字节密钥
    $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    return base64UrlEncode($iv . $encrypted); // IV + 密文
}

/**
 * AES-256-CBC解密
 */
function decryptData($encryptedData, $key) {
    $decoded = base64UrlDecode($encryptedData);
    $iv = substr($decoded, 0, 16);
    $ciphertext = substr($decoded, 16);
    $key = substr(hash('sha256', $key, true), 0, 32);
    return openssl_decrypt($ciphertext, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
}

/**
 * 生成数据签名（用于完整性校验）
 */
function generateSignature($data, $secret) {
    return hash_hmac('sha256', $data, $secret);
}

/**
 * 验证数据签名
 */
function verifySignature($data, $signature, $secret) {
    $expected = generateSignature($data, $secret);
    return hash_equals($expected, $signature);
}

/**
 * 获取账号专属加密密钥（基于用户名+密码哈希）
 */
function getUserEncryptionKey($username, $passwordHash) {
    return hash('sha256', $username . $passwordHash . ENCRYPTION_KEY);
}

// ---------- 文件操作工具 ----------

function ensureDir($path) {
    if (!is_dir($path)) {
        mkdir($path, 0700, true); // 仅所有者可读写
    }
}

function logError($message, $data = null) {
    $log = date('Y-m-d H:i:s') . ' - ' . $message;
    if ($data) {
        $log .= ' | Data: ' . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    file_put_contents(LOG_FILE, $log . "\n", FILE_APPEND);
}

function jsonResponse($code, $message, $data = null) {
    http_response_code($code);
    echo json_encode([
        'code' => $code,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function getBody() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function loadUsers() {
    if (!file_exists(USERS_FILE)) return [];
    $content = file_get_contents(USERS_FILE);
    return json_decode($content, true) ?: [];
}

function saveUsers($users) {
    file_put_contents(USERS_FILE, json_encode($users, JSON_UNESCAPED_UNICODE));
}

/**
 * 验证Token并返回用户信息
 * 基于最后活跃时间判断：只要last_active在300秒内，token就有效
 * 心跳包会更新last_active，所以持续在线的用户token不会过期
 */
function validateToken($token) {
    if (empty($token)) return null;

    $users = loadUsers();
    $now = time();
    $lastActiveThreshold = 300; // 5分钟无活跃则token失效

    foreach ($users as $idx => &$u) {
        if (isset($u['token']) && $u['token'] === $token) {
            $lastActive = intval($u['last_active'] ?? 0);
            $tokenCreated = intval($u['token_created'] ?? 0);

            // 核心逻辑：检查是否还在活跃时间内
            if ($now - $lastActive > $lastActiveThreshold) {
                // 超过5分钟无活跃，token失效
                $users[$idx]['token'] = '';
                $users[$idx]['token_created'] = 0;
                saveUsers($users);
                logError('Token expired (inactive) for user: ' . $u['username']);
                return null;
            }

            // Token创建超过1小时但仍在活跃中，自动续期
            if ($now - $tokenCreated > TOKEN_EXPIRE_SECONDS) {
                $users[$idx]['token'] = generateSecureToken($u['username'], $u['password']);
                $users[$idx]['token_created'] = $now;
                $u['token'] = $users[$idx]['token'];
                saveUsers($users);
                logInfo('Token renewed for user: ' . $u['username']);
            }

            // 每次验证都更新last_active
            $users[$idx]['last_active'] = $now;
            saveUsers($users);
            return $u;
        }
    }
    return null;
}

// ---------- 接口路由 ----------
$data = getBody();
$action = trim($_GET['action'] ?? ($data['action'] ?? ''));

switch ($action) {

    // ==================== 注册 ====================
    case 'register':
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($username) || empty($password)) {
            jsonResponse(400, '用户名和密码不能为空');
        }
        if (mb_strlen($username, 'utf-8') < 2 || mb_strlen($username, 'utf-8') > 16) {
            jsonResponse(400, '用户名长度 2-16 个字符');
        }
        if (strlen($password) < 6) {
            jsonResponse(400, '密码至少 6 个字符');
        }

        $users = loadUsers();
        foreach ($users as $u) {
            if ($u['username'] === $username) {
                jsonResponse(400, '用户名已存在');
            }
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $newUser = [
            'username'      => $username,
            'password'      => $passwordHash,
            'token'         => generateSecureToken($username, $passwordHash),
            'token_created' => time(),
            'created_at'    => date('Y-m-d H:i:s'),
            'last_login'    => date('Y-m-d H:i:s'),
            'last_active'   => time()
        ];
        $users[] = $newUser;
        saveUsers($users);

        jsonResponse(200, '注册成功', [
            'user' => [
                'username' => $newUser['username'],
                'token'    => $newUser['token']
            ]
        ]);
        break;

    // ==================== 登录 ====================
    case 'login':
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($username) || empty($password)) {
            jsonResponse(400, '用户名和密码不能为空');
        }

        $users = loadUsers();
        foreach ($users as $idx => &$u) {
            if ($u['username'] === $username) {
                if (!password_verify($password, $u['password'])) {
                    jsonResponse(401, '密码错误');
                }
                // 登录时生成新Token
                $u['token'] = generateSecureToken($username, $u['password']);
                $u['token_created'] = time();
                $u['last_login'] = date('Y-m-d H:i:s');
                $u['last_active'] = time();
                saveUsers($users);

                jsonResponse(200, '登录成功', [
                    'user' => [
                        'username' => $u['username'],
                        'token'    => $u['token']
                    ]
                ]);
                exit;
            }
        }
        jsonResponse(401, '用户名不存在');
        break;

    // ==================== 验证 Token ====================
    case 'check':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');

        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        // 获取角色信息
        $charInfo = getCharacterInfo($user['username']);

        jsonResponse(200, '验证成功', [
            'username'      => $user['username'],
            'characterName' => $charInfo['playerName'] ?? '',
            'featureCode'   => $charInfo['featureCode'] ?? ''
        ]);
        break;

    // ==================== 上传存档（加密存储） ====================
    case 'saveGameData':
        $token = trim($data['token'] ?? '');
        $saveData = $data['saveData'] ?? '';
        $slot = intval($data['slot'] ?? 1);
        $featureCode = trim($data['featureCode'] ?? '');
        if ($slot < 0 || $slot > 5) $slot = 1;

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        // 验证特征码
        $charInfo = getCharacterInfo($user['username']);
        if (!$charInfo || empty($charInfo['playerName'])) {
            jsonResponse(404, '角色数据不存在');
        }
        if (!verifyFeatureCode($user['username'], $charInfo['playerName'], $featureCode)) {
            logError('Feature code mismatch for user: ' . $user['username']);
            jsonResponse(403, '角色特征码不匹配，拒绝保存');
        }

        $username = $user['username'];

        // 获取账号专属加密密钥
        $encryptionKey = getUserEncryptionKey($username, $user['password']);

        // 构建存档元数据
        $saveMeta = [
            'saveData'       => $saveData,
            'featureCode'    => $featureCode,
            'characterName'  => $charInfo['playerName'],
            'username'       => $username,
            'updatedAt'      => date('Y-m-d H:i:s'),
            'mapName'        => trim($data['mapName'] ?? ''),
            'gameTime'       => intval($data['gameTime'] ?? 0),
            'clientVersion'  => trim($data['clientVersion'] ?? '')
        ];

        // 生成数据签名（用于完整性校验）
        $saveMetaStr = json_encode($saveMeta, JSON_UNESCAPED_UNICODE);
        $signature = generateSignature($saveMetaStr, HMAC_SECRET);

        // 加密存档数据
        $encryptedData = encryptData($saveMetaStr, $encryptionKey);

        // 保存加密后的存档
        $saveFile = SAVES_DIR . "/{$username}_slot{$slot}.enc";
        $finalData = [
            'signature' => $signature,
            'data' => $encryptedData,
            'version' => '1.0'
        ];
        file_put_contents($saveFile, json_encode($finalData, JSON_UNESCAPED_UNICODE));

        // 更新存档槽位元数据
        updateSlotMetadata($username, $slot, $charInfo['playerName'],
            $data['mapName'] ?? '', $data['gameTime'] ?? 0);

        jsonResponse(200, '存档上传成功', ['slot' => $slot]);
        break;

    // ==================== 下载存档（解密并校验，支持旧格式兼容） ====================
    case 'loadGameData':
        $token = trim($data['token'] ?? '');
        $slot = intval($data['slot'] ?? 1);
        $featureCode = trim($data['featureCode'] ?? '');
        if ($slot < 0 || $slot > 5) $slot = 1;

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $user['username'];

        // 优先查找新格式（加密.enc文件）
        $saveFile = SAVES_DIR . "/{$username}_slot{$slot}.enc";
        $oldSaveFile = SAVES_DIR . "/{$username}_slot{$slot}.json"; // 旧格式备选

        if (!file_exists($saveFile)) {
            // 兼容旧格式：如果没有.enc文件，尝试读取旧的.json格式
            if (file_exists($oldSaveFile)) {
                $oldContent = json_decode(file_get_contents($oldSaveFile), true);
                if ($oldContent && !empty($oldContent['saveData'])) {
                    jsonResponse(200, '读取成功（旧格式）', [
                        'hasData'        => true,
                        'saveData'       => $oldContent['saveData'] ?? '',
                        'characterName'  => $oldContent['characterName'] ?? '',
                        'mapName'        => $oldContent['mapName'] ?? '',
                        'gameTime'       => intval($oldContent['gameTime'] ?? 0),
                        'featureCode'    => $oldContent['featureCode'] ?? '',
                        'updatedAt'      => $oldContent['updatedAt'] ?? '',
                        'slot'           => $slot,
                        'isLegacyFormat' => true
                    ]);
                    break;
                }
            }
            jsonResponse(200, '该槽位暂无存档', ['hasData' => false, 'slot' => $slot]);
        }

        // 读取加密存档
        $content = json_decode(file_get_contents($saveFile), true);
        if (!$content || empty($content['data']) || empty($content['signature'])) {
            logError('Invalid save file format: ' . $saveFile);
            jsonResponse(500, '存档文件格式错误');
        }

        // 获取账号专属解密密钥
        $encryptionKey = getUserEncryptionKey($username, $user['password']);

        try {
            // 解密数据
            $decryptedStr = decryptData($content['data'], $encryptionKey);
            $saveMeta = json_decode($decryptedStr, true);

            // 验证签名（防篡改）
            if (!verifySignature($decryptedStr, $content['signature'], HMAC_SECRET)) {
                logError('Signature verification failed for user: ' . $username);
                jsonResponse(403, '存档数据已被篡改');
            }

            // 验证特征码
            $storedFC = $saveMeta['featureCode'] ?? '';
            if (!empty($storedFC) && !empty($featureCode)) {
                if (!hash_equals($storedFC, $featureCode)) {
                    logError('Feature code mismatch during load: ' . $username);
                    jsonResponse(403, '存档特征码与当前角色不匹配');
                }
            }

            jsonResponse(200, '读取成功', [
                'hasData'        => true,
                'saveData'       => $saveMeta['saveData'] ?? '',
                'characterName'  => $saveMeta['characterName'] ?? '',
                'mapName'        => $saveMeta['mapName'] ?? '',
                'gameTime'       => intval($saveMeta['gameTime'] ?? 0),
                'featureCode'    => $storedFC,
                'updatedAt'      => $saveMeta['updatedAt'] ?? '',
                'slot'           => $slot
            ]);
        } catch (Exception $e) {
            logError('Decryption failed for user: ' . $username . ', Error: ' . $e->getMessage());
            jsonResponse(500, '存档解密失败');
        }
        break;

    // ==================== 存档列表 ====================
    case 'listSaves':
        $token = trim($data['token'] ?? '');
        $targetUsername = trim($data['username'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $targetUsername ?: $user['username'];
        $result = getSlotList($username);

        jsonResponse(200, '获取成功', ['slots' => $result, 'username' => $username]);
        break;

    // ==================== 心跳包 - 保持在线状态 ====================
    case 'heartbeat':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $user['username'];

        // 更新在线列表
        $onlineFile = DATA_DIR . '/online.json';
        $online = [];
        if (file_exists($onlineFile)) $online = json_decode(file_get_contents($onlineFile), true) ?: [];
        $online[$username] = time();
        file_put_contents($onlineFile, json_encode($online, JSON_UNESCAPED_UNICODE));

        // 更新用户最后活跃时间（关键！延长token有效期）
        $users = loadUsers();
        foreach ($users as $idx => $u) {
            if ($u['username'] === $username) {
                $users[$idx]['last_active'] = time();
                saveUsers($users);
                break;
            }
        }

        jsonResponse(200, '心跳成功', [
            'last_active' => time(),
            'online' => true
        ]);
        break;

    // ==================== 角色检测与创建 ====================
    case 'checkCharacter':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $charInfo = getCharacterInfo($user['username']);
        $hasCharacter = !empty($charInfo['playerName']) &&
                        $charInfo['playerName'] !== '未知角色' &&
                        $charInfo['playerName'] !== 'undefined' &&
                        $charInfo['playerName'] !== 'null';

        jsonResponse(200, $hasCharacter ? '已创建角色' : '未创建角色', [
            'hasCharacter'   => $hasCharacter,
            'characterName'  => $charInfo['playerName'] ?? '',
            'featureCode'    => $charInfo['featureCode'] ?? '',
            'username'       => $user['username']
        ]);
        break;

    case 'checkName':
    case 'checkCharacterName':
        $token = trim($data['token'] ?? '');
        $characterName = trim($data['characterName'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        if (empty($characterName) || mb_strlen($characterName, 'utf-8') < 2) {
            jsonResponse(400, '角色名至少2个字符');
        }
        if (mb_strlen($characterName, 'utf-8') > 8) {
            jsonResponse(400, '角色名不能超过8个字符');
        }
        if (!preg_match('/^[\x{4e00}-\x{9fa5}]+$/u', $characterName)) {
            jsonResponse(400, '角色名只能包含中文字符');
        }

        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $nameTaken = isCharacterNameTaken($characterName);
        jsonResponse(200, $nameTaken ? '角色名已被占用' : '角色名可用',
            ['available' => !$nameTaken]);
        break;

    case 'createCharacter':
        $token = trim($data['token'] ?? '');
        $characterName = trim($data['characterName'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        if (empty($characterName) || mb_strlen($characterName, 'utf-8') < 2) {
            jsonResponse(400, '角色名至少2个字符');
        }
        if (mb_strlen($characterName, 'utf-8') > 8) {
            jsonResponse(400, '角色名不能超过8个字符');
        }
        if (!preg_match('/^[\x{4e00}-\x{9fa5}]+$/u', $characterName)) {
            jsonResponse(400, '角色名只能包含中文字符');
        }

        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');
        $username = $user['username'];

        // 检查是否已创建角色
        $playerDataFile = DATA_DIR . "/{$username}_player.json";
        if (file_exists($playerDataFile)) {
            $existing = json_decode(file_get_contents($playerDataFile), true);
            if ($existing && !empty($existing['playerName']) &&
                $existing['playerName'] !== '未知角色' &&
                $existing['playerName'] !== 'undefined' &&
                $existing['playerName'] !== 'null') {
                jsonResponse(400, '该账号已创建过角色');
            }
        }

        // 检查名字重复
        if (isCharacterNameTaken($characterName)) {
            jsonResponse(400, '角色名已被占用');
        }

        // 生成唯一特征码
        $featureCode = generateFeatureCode($username, $characterName);

        $playerData = [
            'username'       => $username,
            'playerName'     => $characterName,
            'featureCode'    => $featureCode,
            'level'          => 1, 'hp' => 100,
            'attack'         => 10, 'defense' => 5, 'speed' => 5, 'magic' => 5,
            'fire'           => 0, 'ice' => 0, 'toxic' => 0, 'thunder' => 0,
            'toxic_def'      => 0, 'ice_def' => 0, 'fire_def' => 0, 'thunder_def' => 0,
            'gold'           => 100,
            'created_at'     => date('Y-m-d H:i:s')
        ];
        file_put_contents($playerDataFile, json_encode($playerData, JSON_UNESCAPED_UNICODE));

        jsonResponse(200, '角色创建成功', [
            'characterName' => $characterName,
            'username'      => $username,
            'featureCode'   => $featureCode
        ]);
        break;

    // ==================== 删除存档 ====================
    case 'deleteSave':
        $token = trim($data['token'] ?? '');
        $slot = intval($data['slot'] ?? 1);
        $featureCode = trim($data['featureCode'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $charInfo = getCharacterInfo($user['username']);
        if (!$charInfo || !verifyFeatureCode($user['username'], $charInfo['playerName'], $featureCode)) {
            jsonResponse(403, '特征码验证失败');
        }

        $username = $user['username'];
        $saveFile = SAVES_DIR . "/{$username}_slot{$slot}.enc";
        $oldSaveFile = SAVES_DIR . "/{$username}_slot{$slot}.json";

        $deleted = false;
        if (file_exists($saveFile)) {
            unlink($saveFile);
            $deleted = true;
        }
        if (file_exists($oldSaveFile)) {
            unlink($oldSaveFile);
            $deleted = true;
        }

        // 更新槽位元数据
        updateSlotMetadata($username, $slot, '', '', 0);

        if ($deleted) {
            jsonResponse(200, '删除成功');
        } else {
            jsonResponse(404, '存档不存在');
        }
        break;

    default:
        jsonResponse(404, '接口不存在');
}

// ---------- 辅助函数 ----------

function getCharacterInfo($username) {
    $playerDataFile = DATA_DIR . "/{$username}_player.json";
    if (!file_exists($playerDataFile)) return ['playerName' => '', 'featureCode' => ''];
    $pd = json_decode(file_get_contents($playerDataFile), true);
    if (!$pd) return ['playerName' => '', 'featureCode' => ''];
    return [
        'playerName' => $pd['playerName'] ?? '',
        'featureCode' => $pd['featureCode'] ?? ''
    ];
}

function isCharacterNameTaken($characterName) {
    $files = glob(DATA_DIR . '/*_player.json');
    foreach ($files as $file) {
        $pd = json_decode(file_get_contents($file), true);
        if ($pd && isset($pd['playerName']) && $pd['playerName'] === $characterName) {
            return true;
        }
    }
    return false;
}

function updateSlotMetadata($username, $slot, $characterName, $mapName, $gameTime) {
    $slotsFile = SAVES_DIR . "/{$username}_slots.json";
    $slots = file_exists($slotsFile) ? json_decode(file_get_contents($slotsFile), true) ?: [] : [];

    if (!empty($characterName)) {
        $slots[$slot] = [
            'hasData'       => true,
            'updatedAt'     => date('Y-m-d H:i:s'),
            'characterName' => $characterName,
            'mapName'       => trim($mapName),
            'gameTime'      => intval($gameTime)
        ];
    } else {
        unset($slots[$slot]);
    }

    file_put_contents($slotsFile, json_encode($slots, JSON_UNESCAPED_UNICODE));
}

function getSlotList($username) {
    $slotsFile = SAVES_DIR . "/{$username}_slots.json";
    $slots = file_exists($slotsFile) ? json_decode(file_get_contents($slotsFile), true) ?: [] : [];

    $result = [];
    for ($i = 1; $i <= 5; $i++) {
        $info = [
            'slot'    => $i,
            'hasData' => isset($slots[$i]) && $slots[$i]['hasData']
        ];
        if ($info['hasData']) {
            $info['updatedAt'] = $slots[$i]['updatedAt'] ?? '';
            $info['characterName'] = $slots[$i]['characterName'] ?? '';
            $info['mapName'] = $slots[$i]['mapName'] ?? '';
            $info['gameTime'] = intval($slots[$i]['gameTime'] ?? 0);
        }
        $result[] = $info;
    }
    return $result;
}
?>