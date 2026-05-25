<?php
/**
 * 怪物国度 - 云端存档 API
 *
 * 功能：账号注册/登录、存档上传/下载、存档列表
 * 所有接口仅接受 POST 请求，返回 JSON 格式
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

// ---------- 配置 ----------
define('DATA_DIR', __DIR__ . '/data');
define('USERS_FILE', DATA_DIR . '/users.json');
define('SAVES_DIR', DATA_DIR . '/saves');
define('BAD_WORDS_FILE', DATA_DIR . '/badwords.json');

// ---------- 管理员配置 ----------
// 管理员密码（生产环境请设置强密码并通过环境变量读取）
define('ADMIN_PASSWORD', '');
define('ADMIN_TOKEN_EXPIRE', 3600); // 管理员token有效期(秒)

// ---------- 违禁词配置 ----------
$GLOBALS['BAD_WORDS'] = [];

/**
 * 加载违禁词库
 */
function loadBadWords() {
    if (!empty($GLOBALS['BAD_WORDS'])) return;
    
    if (file_exists(BAD_WORDS_FILE)) {
        $content = file_get_contents(BAD_WORDS_FILE);
        $data = json_decode($content, true);
        if ($data && isset($data['words']) && is_array($data['words'])) {
            $GLOBALS['BAD_WORDS'] = $data['words'];
        }
    }
}

/**
 * 获取违禁词列表
 * @return array
 */
function getBadWords() {
    if (empty($GLOBALS['BAD_WORDS'])) {
        loadBadWords();
    }
    return $GLOBALS['BAD_WORDS'];
}

/**
 * 检查文本是否包含违禁词
 * @param string $text 要检查的文本
 * @return bool
 */
function hasBadWords($text) {
    if (empty($text)) return false;
    foreach (getBadWords() as $word) {
        if (strpos($text, $word) !== false) {
            return true;
        }
    }
    return false;
}

/**
 * 检查文本是否包含违禁词并返回详细信息
 * @param string $text 要检查的文本
 * @return array {hasBadWord: bool, message: string, foundWord: string|null}
 */
function checkBadWords($text) {
    if (empty($text)) return ['hasBadWord' => false, 'message' => '', 'foundWord' => null];
    foreach (getBadWords() as $word) {
        if (strpos($text, $word) !== false) {
            return [
                'hasBadWord' => true,
                'message' => '内容中包含不当内容："' . $word . '"，请更换其他内容',
                'foundWord' => $word
            ];
        }
    }
    return ['hasBadWord' => false, 'message' => '', 'foundWord' => null];
}

/**
 * 将文本中的违禁词替换为星号
 * @param string $text 要处理的文本
 * @return string
 */
function replaceBadWords($text) {
    if (empty($text)) return $text;
    foreach (getBadWords() as $word) {
        if (strpos($text, $word) !== false) {
            $text = str_replace($word, str_repeat('*', mb_strlen($word, 'UTF-8')), $text);
        }
    }
    return $text;
}

// ---------- 特征码 (Feature Code) 配置 ----------
// 每个角色拥有唯一加密特征码，用于身份验证防止存档盗用
// 更换设备时服务器据此判断是否同一角色
define('FEATURE_SECRET', 'M0nSt3rK1ngd0m_S3cr3t_K3y_2024_!#$%AbCdEfGhIjKlMnOpQrStUvWxYz123456');

/**
 * 生成角色特征码（HMAC-SHA256，不可逆）
 * 同一(用户名,角色名) 始终产生同一特征码
 * 不同用户即使角色名相同也产生不同特征码
 * 算法：sha256 取前 28 字节 → base64url 取前 38 字符 → 加版本前缀
 */
function generateFeatureCode($username, $characterName) {
    $data = strtolower(trim($username)) . '::' . trim($characterName) . '::' . strtolower(trim($characterName));
    $raw = hash_hmac('sha256', $data, FEATURE_SECRET, true);
    // 取前 28 字节，base64url 编码（去填充），得 38 字符左右
    $b64 = rtrim(strtr(base64_encode(substr($raw, 0, 28)), '+/', '-_'), '=');
    return 'MK1_' . $b64;
}

/**
 * 验证特征码是否匹配（常量时间比较，防时序攻击）
 */
function verifyFeatureCode($username, $characterName, $featureCode) {
    $expected = generateFeatureCode($username, $characterName);
    return hash_equals($expected, $featureCode);
}

/**
 * 从 Token 获取角色名和特征码
 */
function getCharacterInfo($username) {
    $playerDataFile = DATA_DIR . "/{$username}_player.json";
    if (!file_exists($playerDataFile)) return null;
    $pd = json_decode(file_get_contents($playerDataFile), true);
    if (!$pd || empty($pd['playerName'])) return null;
    return [
        'playerName' => $pd['playerName'],
        'featureCode' => $pd['featureCode'] ?? ''
    ];
}

// ---------- 工具函数 ----------
function jsonResponse($code, $message, $data = null) {
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

// 安全的多字节字符串长度检测（兼容 mbstring 未安装的情况）
function safeStrlen($str) {
    if (function_exists('mb_strlen')) {
        return mb_strlen($str, 'utf-8');
    }
    // 回退方案：使用正则按 Unicode 字符分割（避免 strlen 将中文字符按字节计数）
    return preg_match_all('/./u', $str, $matches);
}

// 检查字符串是否仅含中文字符
function isChineseName($str) {
    return preg_match('/^[\x{4e00}-\x{9fa5}]+$/u', $str);
}

function loadUsers() {
    if (!file_exists(USERS_FILE)) return [];
    $content = file_get_contents(USERS_FILE);
    return json_decode($content, true) ?: [];
}

function saveUsers($users) {
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0777, true);
    }
    return file_put_contents(USERS_FILE, json_encode($users, JSON_UNESCAPED_UNICODE));
}

function generateToken() {
    return md5(uniqid('mk_', true) . rand(100000, 999999));
}

/**
 * 获取客户端真实IP地址
 */
function getClientIP() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    
    // 检查代理IP
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
        $ip = $_SERVER['HTTP_X_REAL_IP'];
    } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }
    
    // 处理多个IP的情况
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }
    
    return $ip;
}

/**
 * 验证管理员token
 */
function validateAdminToken($token) {
    if (empty($token)) return false;
    
    $adminTokenFile = DATA_DIR . '/admin_token.json';
    if (!file_exists($adminTokenFile)) return false;
    
    $data = json_decode(file_get_contents($adminTokenFile), true);
    if (!$data || empty($data['token']) || empty($data['expire_time'])) {
        return false;
    }
    
    if ($data['token'] !== $token) return false;
    if (time() > $data['expire_time']) return false;
    
    return true;
}

function validateToken($token) {
    if (empty($token)) return null;
    $users = loadUsers();
    $now = time();
    foreach ($users as $idx => $u) {
        if (isset($u['token']) && $u['token'] === $token) {
            $lastActive = intval($u['last_active'] ?? 0);
            if ($now - $lastActive > 300) {
                $users[$idx]['token'] = '';
                saveUsers($users);
                return null;
            }
            $users[$idx]['last_active'] = $now;
            saveUsers($users);
            return $users[$idx];
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
        if (safeStrlen($username) < 2 || safeStrlen($username) > 16) {
            jsonResponse(400, '用户名长度 2-16 个字符');
        }
        if (strlen($password) < 6) {
            jsonResponse(400, '密码至少 6 个字符');
        }
        
        // 用户名违禁词检测（取名时出现违禁词警告并阻止）
        $badWordResult = checkBadWords($username);
        if ($badWordResult['hasBadWord']) {
            jsonResponse(400, $badWordResult['message']);
        }

        $users = loadUsers();
        foreach ($users as $u) {
            if ($u['username'] === $username) {
                jsonResponse(400, '用户名已存在');
            }
        }

        $newUser = [
            'username'   => $username,
            'password'   => password_hash($password, PASSWORD_DEFAULT),
            'token'      => generateToken(),
            'created_at' => date('Y-m-d H:i:s'),
            'last_login' => date('Y-m-d H:i:s'),
            'last_active'=> time(),
            'ip_address' => getClientIP()
        ];
        $users[] = $newUser;
        saveUsers($users);

        jsonResponse(200, '注册成功', [
            'user' => [
                'username' => $newUser['username'],
                'token'   => $newUser['token']
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
        $found = false;
        foreach ($users as $idx => $u) {
            if ($u['username'] === $username) {
                if (!password_verify($password, $u['password'])) {
                    jsonResponse(401, '密码错误');
                }
                $users[$idx]['token'] = generateToken();
                $users[$idx]['last_login'] = date('Y-m-d H:i:s');
                $users[$idx]['last_active'] = time();
                $users[$idx]['ip_address'] = getClientIP();
                // 先保存新 token 到文件，再返回给前端
                saveUsers($users);
                // 获取角色信息
                $charInfo = getCharacterInfo($users[$idx]['username']);
                $hasCharacter = !empty($charInfo);
                $characterName = $charInfo['playerName'] ?? '';
                
                jsonResponse(200, '登录成功', [
                    'user' => [
                        'username' => $users[$idx]['username'],
                        'token'    => $users[$idx]['token']
                    ],
                    'hasCharacter' => $hasCharacter,
                    'characterName' => $characterName
                ]);
                $found = true;
                break;
            }
        }
        if (!$found) {
            jsonResponse(401, '用户名不存在');
        }
        break;

    // ==================== 验证 Token ====================
    case 'check':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');

        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        jsonResponse(200, '验证成功', [
            'username' => $user['username']
        ]);
        break;

    // ==================== 上传存档 (需特征码验证) ====================
    case 'saveGameData':
        $token = trim($data['token'] ?? '');
        $saveData = $data['saveData'] ?? '';
        $slot = intval($data['slot'] ?? 1);
        $featureCode = trim($data['featureCode'] ?? '');
        if ($slot < 0 || $slot > 5) $slot = 1;

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        if ($slot > 0 && empty($featureCode)) jsonResponse(403, '缺少角色特征码，无法保存');

        // 验证特征码是否匹配当前账号的角色
        $charInfo = getCharacterInfo($user['username']);
        if (!$charInfo || empty($charInfo['playerName'])) {
            jsonResponse(404, '角色数据不存在');
        }
        if (!verifyFeatureCode($user['username'], $charInfo['playerName'], $featureCode)) {
            jsonResponse(403, '角色特征码不匹配，拒绝保存（可能账号已变更）');
        }

        $username = $user['username'];
        if (!is_dir(SAVES_DIR)) mkdir(SAVES_DIR, 0777, true);

        $saveFile = SAVES_DIR . "/{$username}_slot{$slot}.json";
        $saveMeta = [
            'saveData'     => $saveData,
            'featureCode'  => $featureCode,
            'characterName'=> $charInfo['playerName'],
            'username'     => $username,
            'updatedAt'    => date('Y-m-d H:i:s'),
            'mapName'      => trim($data['mapName'] ?? ''),
            'gameTime'     => intval($data['gameTime'] ?? 0)
        ];
        file_put_contents($saveFile, json_encode($saveMeta, JSON_UNESCAPED_UNICODE));

        $slotsFile = SAVES_DIR . "/{$username}_slots.json";
        $slots = [];
        if (file_exists($slotsFile)) {
            $slots = json_decode(file_get_contents($slotsFile), true) ?: [];
        }
        $slots[$slot] = [
            'hasData'   => true,
            'updatedAt' => date('Y-m-d H:i:s'),
            'characterName' => $charInfo['playerName'],
            'mapName'   => trim($data['mapName'] ?? ''),
            'gameTime'  => intval($data['gameTime'] ?? 0)
        ];
        file_put_contents($slotsFile, json_encode($slots, JSON_UNESCAPED_UNICODE));

        jsonResponse(200, '存档上传成功', ['slot' => $slot]);
        break;

    // ==================== 下载存档 (需特征码验证) ====================
    case 'loadGameData':
        $token = trim($data['token'] ?? '');
        $slot = intval($data['slot'] ?? 1);
        $featureCode = trim($data['featureCode'] ?? '');
        if ($slot < 0 || $slot > 5) $slot = 1;

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $user['username'];
        $saveFile = SAVES_DIR . "/{$username}_slot{$slot}.json";

        if (!file_exists($saveFile)) {
            jsonResponse(200, '该槽位暂无存档', ['hasData' => false, 'slot' => $slot]);
        }

        $content = json_decode(file_get_contents($saveFile), true);

        // 如果存档有特征码标记，验证匹配
        $storedFC = $content['featureCode'] ?? '';
        if (!empty($storedFC) && !empty($featureCode)) {
            if (!hash_equals($storedFC, $featureCode)) {
                jsonResponse(403, '存档特征码与当前角色不匹配，请联系客服');
            }
        }

        jsonResponse(200, '读取成功', [
            'hasData'      => true,
            'saveData'     => $content['saveData'] ?? '',
            'characterName'=> $content['characterName'] ?? '',
            'mapName'      => $content['mapName'] ?? '',
            'gameTime'     => intval($content['gameTime'] ?? 0),
            'featureCode'  => $storedFC,
            'characterName'=> $content['characterName'] ?? '',
            'updatedAt'    => $content['updatedAt'] ?? '',
            'slot'         => $slot
        ]);
        break;

    // ==================== 存档列表 ====================
    case 'listSaves':
        $token = trim($data['token'] ?? '');
        $targetUsername = trim($data['username'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $targetUsername ?: $user['username'];
        $slotsFile = SAVES_DIR . "/{$username}_slots.json";
        $slots = [];
        if (file_exists($slotsFile)) {
            $slots = json_decode(file_get_contents($slotsFile), true) ?: [];
        }

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
                // Fallback: if slots metadata is incomplete, read from the actual save file
                if (empty($slots[$i]['mapName']) && empty($slots[$i]['characterName'])) {
                    $sf = SAVES_DIR . "/{$username}_slot{$i}.json";
                    if (file_exists($sf)) {
                        $sc = json_decode(file_get_contents($sf), true);
                        if ($sc) {
                            if (!empty($sc['updatedAt'])) $info['updatedAt'] = $sc['updatedAt'];
                            if (!empty($sc['featureCode'])) $info['featureCode'] = $sc['featureCode'];
                            if (!empty($sc['characterName'])) $info['characterName'] = $sc['characterName'];
                            if (!empty($sc['mapName'])) $info['mapName'] = $sc['mapName'];
                            if (!empty($sc['gameTime'])) $info['gameTime'] = intval($sc['gameTime']);
                        }
                    }
                }
            }
            $result[] = $info;
        }

        jsonResponse(200, '获取成功', ['slots' => $result, 'username' => $username]);
        break;

    // ==================== 玩家数据保存（排行榜用） ====================
    case 'savePlayerData':
    case 'savePlayerData_new':
        $token = trim($data['token'] ?? '');
        $playerData = $data['playerData'] ?? [];

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $user['username'];
        
        // 获取当前账号在服务器上注册的角色名
        $serverCharInfo = getCharacterInfo($username);
        $serverCharName = $serverCharInfo['playerName'] ?? '';
        
        // 获取上传数据中的角色名
        $uploadCharName = $playerData['playerName'] ?? $playerData['character_name'] ?? '';
        
        // 校验角色名是否匹配当前账号（防止用别人高属性存档上传）
        if (!empty($serverCharName) && !empty($uploadCharName) && $serverCharName !== $uploadCharName) {
            jsonResponse(403, '小猎人请不要帮助他人比较数据哦，赛文会把你抓去帝都站岗哟');
        }
        
        $playerDataFile = DATA_DIR . "/{$username}_player.json";
        file_put_contents($playerDataFile, json_encode($playerData, JSON_UNESCAPED_UNICODE));

        // 提取统计信息用于排行榜
        $stats = [
            'level' => intval($playerData['level'] ?? 0),
            'hp' => intval($playerData['hp'] ?? 0),
            'attack' => intval($playerData['attack'] ?? 0),
            'defense' => intval($playerData['defense'] ?? 0),
            'gold' => intval($playerData['gold'] ?? 0),
            'fire' => intval($playerData['fire'] ?? 0),
            'ice' => intval($playerData['ice'] ?? 0),
            'toxic' => intval($playerData['toxic'] ?? 0),
            'thunder' => intval($playerData['thunder'] ?? 0),
            'toxic_def' => intval($playerData['toxic_def'] ?? 0),
            'ice_def' => intval($playerData['ice_def'] ?? 0),
            'fire_def' => intval($playerData['fire_def'] ?? 0),
            'thunder_def' => intval($playerData['thunder_def'] ?? 0),
        ];
        $charName = $playerData['playerName'] ?? $playerData['character_name'] ?? $username;
        $stats['playerName'] = $charName;

        // 更新排行榜
        $rankingFile = DATA_DIR . '/ranking.json';
        $ranking = [];
        if (file_exists($rankingFile)) {
            $ranking = json_decode(file_get_contents($rankingFile), true) ?: [];
        }

        $typeMap = [
            'level' => 'level', 'gold' => 'coin',
            'attack' => 'attack', 'fire' => 'attack_fire',
            'ice' => 'attack_ice', 'toxic' => 'attack_toxic',
            'thunder' => 'attack_thunder',
            'toxic_def' => 'defense_toxic', 'ice_def' => 'defense_ice',
            'fire_def' => 'defense_fire', 'thunder_def' => 'defense_thunder',
        ];

        foreach ($typeMap as $field => $type) {
            if (!isset($ranking[$type])) $ranking[$type] = [];
            $updated = false;
            foreach ($ranking[$type] as &$entry) {
                if ($entry['username'] === $username) {
                    $entry['value'] = $stats[$field] ?? 0;
                    $entry['level'] = $stats['level'] ?? 1;
                    $entry['character_name'] = $charName;
                    $updated = true;
                    break;
                }
            }
            if (!$updated) {
                $ranking[$type][] = [
                    'username' => $username,
                    'character_name' => $charName,
                    'value' => $stats[$field] ?? 0,
                    'level' => $stats['level'] ?? 1,
                ];
            }
            usort($ranking[$type], function($a, $b) {
                return ($b['value'] ?? 0) - ($a['value'] ?? 0);
            });
            $ranking[$type] = array_slice($ranking[$type], 0, 50);
        }
        file_put_contents($rankingFile, json_encode($ranking, JSON_UNESCAPED_UNICODE));

        jsonResponse(200, '保存成功', $stats);
        break;

    // ==================== 排行榜 ====================
    case 'getRanking':
        $type = trim($data['type'] ?? 'level');
        $limit = intval($data['limit'] ?? 10);

        $rankingFile = DATA_DIR . '/ranking.json';
        $ranking = [];
        if (file_exists($rankingFile)) {
            $ranking = json_decode(file_get_contents($rankingFile), true) ?: [];
        }

        $typeData = $ranking[$type] ?? [];
        $result = [];
        foreach (array_slice($typeData, 0, $limit) as $idx => $item) {
            $item['rank'] = $idx + 1;
            $item['value'] = $item['value'] ?? ($item[$type] ?? 0);
            $result[] = $item;
        }
        jsonResponse(200, '获取成功', $result);
        break;

    // ==================== 角色检测与创建 ====================
    case 'checkCharacter':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $playerDataFile = DATA_DIR . "/{$user['username']}_player.json";
        $playerName = '';
        $featureCode = '';
        $hasCharacter = false;
        if (file_exists($playerDataFile)) {
            $pd = json_decode(file_get_contents($playerDataFile), true);
            if ($pd && !empty($pd['playerName'])) {
                $playerName = $pd['playerName'];
                $featureCode = $pd['featureCode'] ?? '';
                $hasCharacter = $playerName !== '未知角色' && $playerName !== 'undefined' && $playerName !== 'null';
            }
        }
        jsonResponse(200, $hasCharacter ? '已创建角色' : '未创建角色', [
            'hasCharacter' => $hasCharacter,
            'characterName' => $playerName,
            'featureCode' => $featureCode,
            'username' => $user['username']
        ]);
        break;

    case 'checkCharacterName':
    case 'checkName':
        $token = trim($data['token'] ?? '');
        $characterName = trim($data['characterName'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        if (empty($characterName) || safeStrlen($characterName) < 2) jsonResponse(400, '角色名至少2个字符');
        if (safeStrlen($characterName) > 8) jsonResponse(400, '角色名不能超过8个字符');
        if (!isChineseName($characterName)) jsonResponse(400, '角色名只能包含中文字符');

        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        // 检查角色名是否重复
        $nameTaken = false;
        $files = glob(DATA_DIR . '/*_player.json');
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $pd = json_decode($content, true);
            if ($pd && isset($pd['playerName']) && $pd['playerName'] === $characterName) {
                $nameTaken = true;
                break;
            }
        }
        jsonResponse(200, $nameTaken ? '角色名已被占用' : '角色名可用', ['available' => !$nameTaken]);
        break;

    case 'createCharacter':
        $token = trim($data['token'] ?? '');
        $characterName = trim($data['characterName'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        if (empty($characterName) || safeStrlen($characterName) < 2) jsonResponse(400, '角色名至少2个字符');
        if (safeStrlen($characterName) > 8) jsonResponse(400, '角色名不能超过8个字符');
        if (!isChineseName($characterName)) jsonResponse(400, '角色名只能包含中文字符');
        
        // 角色名违禁词检测（取名时出现违禁词警告并阻止）
        $badWordResult = checkBadWords($characterName);
        if ($badWordResult['hasBadWord']) {
            jsonResponse(400, $badWordResult['message']);
        }

        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');
        $username = $user['username'];

        // 防止覆盖已有角色
        $playerDataFile = DATA_DIR . "/{$username}_player.json";
        if (file_exists($playerDataFile)) {
            $existing = json_decode(file_get_contents($playerDataFile), true);
            if ($existing && !empty($existing['playerName']) && $existing['playerName'] !== '未知角色' && $existing['playerName'] !== 'undefined' && $existing['playerName'] !== 'null') {
                jsonResponse(400, '该账号已创建过角色');
            }
        }

        // 检查名字重复
        $files = glob(DATA_DIR . '/*_player.json');
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $pd = json_decode($content, true);
            if ($pd && isset($pd['playerName']) && $pd['playerName'] === $characterName) {
                jsonResponse(400, '角色名已被占用');
            }
        }

        // 生成唯一特征码
        $featureCode = generateFeatureCode($username, $characterName);

        $playerData = [
            'username' => $username,
            'playerName' => $characterName,
            'featureCode' => $featureCode,
            'level' => 1, 'hp' => 100,
            'attack' => 10, 'defense' => 5, 'speed' => 5, 'magic' => 5,
            'fire' => 0, 'ice' => 0, 'toxic' => 0, 'thunder' => 0,
            'toxic_def' => 0, 'ice_def' => 0, 'fire_def' => 0, 'thunder_def' => 0,
            'gold' => 100,
            'created_at' => date('Y-m-d H:i:s')
        ];
        file_put_contents($playerDataFile, json_encode($playerData, JSON_UNESCAPED_UNICODE));

        jsonResponse(200, '角色创建成功', [
            'characterName' => $characterName,
            'username' => $username,
            'featureCode' => $featureCode
        ]);
        break;

    // ==================== 获取玩家数据 ====================
    case 'getPlayerData':
    case 'loadPlayerData':
        $token = trim($data['token'] ?? '');
        $targetUsername = trim($data['username'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $lookup = $targetUsername ?: $user['username'];
        $playerDataFile = DATA_DIR . "/{$lookup}_player.json";

        if (!file_exists($playerDataFile)) {
            jsonResponse(404, '玩家数据不存在');
        }

        $pd = json_decode(file_get_contents($playerDataFile), true);
        // 确保返回特征码
        if ($pd && empty($pd['featureCode'])) {
            $pd['featureCode'] = generateFeatureCode($lookup, $pd['playerName'] ?? '');
        }
        jsonResponse(200, '获取成功', $pd);
        break;

    // ==================== 在线用户（聊天用）- 心跳包 ====================
    case 'updateUserStatus':
        $token = trim($data['token'] ?? '');
        $username = trim($data['username'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');
        if ($user['username'] !== $username) jsonResponse(403, '只能更新自己的状态');

        // 更新在线列表
        $onlineFile = DATA_DIR . '/online.json';
        $online = [];
        if (file_exists($onlineFile)) $online = json_decode(file_get_contents($onlineFile), true) ?: [];
        $online[$username] = time();
        file_put_contents($onlineFile, json_encode($online, JSON_UNESCAPED_UNICODE));

        // 关键：更新用户最后活跃时间，延长token有效期
        $users = loadUsers();
        foreach ($users as $idx => $u) {
            if ($u['username'] === $username) {
                $users[$idx]['last_active'] = time();
                saveUsers($users);
                break;
            }
        }

        jsonResponse(200, '心跳更新成功', ['last_active' => time()]);
        break;

    // ==================== 获取统计数据（无需登录） ====================
    case 'getStats':
        $onlineFile = DATA_DIR . '/online.json';
        $online = [];
        if (file_exists($onlineFile)) $online = json_decode(file_get_contents($onlineFile), true) ?: [];
        $now = time();
        
        // 真实在线人数
        $onlineCount = 0;
        foreach ($online as $uname => $lastSeen) {
            if ($now - $lastSeen <= 300) {
                $onlineCount++;
            }
        }
        
        // 虚拟在线人数设置
        $virtualConfigFile = DATA_DIR . '/virtual_online.json';
        $virtualEnabled = false;
        $virtualMin = 0;
        $virtualMax = 0;
        $displayOnlineCount = $onlineCount;
        
        if (file_exists($virtualConfigFile)) {
            $vcfg = json_decode(file_get_contents($virtualConfigFile), true) ?: [];
            $virtualEnabled = $vcfg['enabled'] ?? false;
            $virtualMin = intval($vcfg['min'] ?? 0);
            $virtualMax = intval($vcfg['max'] ?? 0);
            
            if ($virtualEnabled && $virtualMax >= $virtualMin) {
                $displayOnlineCount = rand($virtualMin, $virtualMax);
            }
        }
        
        // 消息总数
        $messagesFile = DATA_DIR . '/messages.json';
        $messages = file_exists($messagesFile) ? json_decode(file_get_contents($messagesFile), true) : [];
        
        // 用户总数
        $usersFile = DATA_DIR . '/users.json';
        $users = file_exists($usersFile) ? json_decode(file_get_contents($usersFile), true) : [];
        
        jsonResponse(200, '获取成功', [
            'onlineUsers' => $onlineCount,
            'displayOnlineUsers' => $displayOnlineCount,
            'totalUsers' => count($users),
            'totalMessages' => count($messages),
            'virtualEnabled' => $virtualEnabled
        ]);
        break;

    case 'getChatUsers':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $onlineFile = DATA_DIR . '/online.json';
        $online = [];
        if (file_exists($onlineFile)) $online = json_decode(file_get_contents($onlineFile), true) ?: [];
        $now = time();
        $users = [];
        $onlineCount = 0;
        foreach ($online as $uname => $lastSeen) {
            if ($now - $lastSeen <= 300) {
                $users[] = ['username' => $uname, 'online' => true];
                $onlineCount++;
            }
        }
        
        // 虚拟在线人数
        $virtualConfigFile = DATA_DIR . '/virtual_online.json';
        $virtualEnabled = false;
        $virtualMin = 0;
        $virtualMax = 0;
        $displayOnlineCount = $onlineCount;
        
        if (file_exists($virtualConfigFile)) {
            $vcfg = json_decode(file_get_contents($virtualConfigFile), true) ?: [];
            $virtualEnabled = $vcfg['enabled'] ?? false;
            $virtualMin = intval($vcfg['min'] ?? 0);
            $virtualMax = intval($vcfg['max'] ?? 0);
            
            // 如果启用虚拟在线，随机生成显示人数
            if ($virtualEnabled && $virtualMax >= $virtualMin) {
                $displayOnlineCount = rand($virtualMin, $virtualMax);
            }
        }
        
        $result = [
            'users' => $users,
            'virtualEnabled' => $virtualEnabled,
            'virtualMin' => $virtualMin,
            'virtualMax' => $virtualMax,
            'displayOnlineCount' => $displayOnlineCount
        ];
        
        jsonResponse(200, '获取成功', $result);
        break;

    // ==================== 退出登录 ====================
    case 'logout':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(400, '参数错误');

        $users = loadUsers();
        foreach ($users as $idx => $u) {
            if (isset($u['token']) && $u['token'] === $token) {
                $users[$idx]['token'] = '';
                saveUsers($users);
                break;
            }
        }
        jsonResponse(200, '退出成功');
        break;

    // ==================== 发送消息（聊天） ====================
    case 'sendMessage':
        $token = trim($data['token'] ?? '');
        $fromUser = trim($data['from_user'] ?? '');
        $toUser = trim($data['to_user'] ?? '');
        $content = trim($data['content'] ?? '');
        $charName = trim($data['character_name'] ?? $fromUser);

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');
        if ($user['username'] !== $fromUser) jsonResponse(403, '只能以自己身份发送消息');
        if (empty($content)) jsonResponse(400, '消息不能为空');
        if (safeStrlen($content) > 200) jsonResponse(400, '消息不能超过200字');

        // 检查用户是否被禁言
        $isMuted = boolval($user['muted'] ?? false);
        $muteUntil = intval($user['mute_until'] ?? 0);
        if ($isMuted) {
            if ($muteUntil > 0 && time() > $muteUntil) {
                // 禁言已过期，自动解除
                $users = loadUsers();
                foreach ($users as $idx => $u) {
                    if ($u['username'] === $fromUser) {
                        $users[$idx]['muted'] = false;
                        $users[$idx]['mute_until'] = 0;
                        saveUsers($users);
                        break;
                    }
                }
            } else {
                if ($muteUntil > 0) {
                    $remaining = ceil(($muteUntil - time()) / 60);
                    jsonResponse(403, '您已被禁言，剩余 ' . $remaining . ' 分钟');
                } else {
                    jsonResponse(403, '您已被永久禁言');
                }
            }
        }

        // 消息内容违禁词检测（聊天中出现违禁词替换为星号）
        $content = replaceBadWords($content);

        $messagesFile = DATA_DIR . '/messages.json';
        $messages = [];
        if (file_exists($messagesFile)) {
            $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        }

        $msg = [
            'id'            => uniqid('msg_', true),
            'from_user'     => $fromUser,
            'to_user'       => $toUser ?: 'all',
            'content'       => $content,
            'character_name'=> $charName,
            'created_at'    => date('Y-m-d H:i:s')
        ];
        $messages[] = $msg;

        // 保留最近 500 条消息，防止文件无限膨胀
        if (count($messages) > 500) {
            $messages = array_slice($messages, -500);
        }

        file_put_contents($messagesFile, json_encode($messages, JSON_UNESCAPED_UNICODE));

        jsonResponse(200, '发送成功', $msg);
        break;

    // ==================== 获取公共消息 ====================
    case 'getPublicMessages':
        $token = trim($data['token'] ?? '');
        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $messagesFile = DATA_DIR . '/messages.json';
        if (!file_exists($messagesFile)) {
            jsonResponse(200, '获取成功', []);
        }

        $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        $publicMsgs = [];
        foreach ($messages as $m) {
            if ($m['to_user'] === 'all') {
                $publicMsgs[] = $m;
            }
        }
        // 取最近 50 条，按时间正序排列
        $publicMsgs = array_slice($publicMsgs, -50);
        $publicMsgs = array_values($publicMsgs);

        jsonResponse(200, '获取成功', $publicMsgs);
        break;

    // ==================== 获取私聊消息 ====================
    case 'getPrivateMessages':
        $token = trim($data['token'] ?? '');
        $fromUser = trim($data['from_user'] ?? '');
        $toUser = trim($data['to_user'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');
        if (empty($fromUser) || empty($toUser)) jsonResponse(400, '参数不完整');

        $messagesFile = DATA_DIR . '/messages.json';
        if (!file_exists($messagesFile)) {
            jsonResponse(200, '获取成功', []);
        }

        $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        $privateMsgs = [];
        foreach ($messages as $m) {
            if ($m['to_user'] === 'all') continue;
            // 两个用户之间的所有消息（双向）
            if (
                ($m['from_user'] === $fromUser && $m['to_user'] === $toUser) ||
                ($m['from_user'] === $toUser && $m['to_user'] === $fromUser)
            ) {
                $privateMsgs[] = $m;
            }
        }
        // 按时间正序排列
        $privateMsgs = array_values($privateMsgs);

        jsonResponse(200, '获取成功', $privateMsgs);
        break;

    // ==================== 服务器状态 ====================
    case 'serverStatus':
        jsonResponse(200, '服务器在线', [
            'time' => date('Y-m-d H:i:s'),
            'status' => 'online'
        ]);
        break;

    // ==================== 重新登录身份验证 ====================
    case 'verifyReconnectIdentity':
        $token = trim($data['token'] ?? '');
        $characterName = trim($data['characterName'] ?? '');
        $oldFeatureCode = trim($data['featureCode'] ?? '');

        if (empty($token)) jsonResponse(401, '请先登录');
        $user = validateToken($token);
        if (!$user) jsonResponse(401, '登录已过期，请重新登录');

        $username = $user['username'];

        // 用当前登录信息生成期望特征码
        $expectedCode = generateFeatureCode($username, $characterName);

        // 新账号(首次创建角色)或无需对比旧特征码
        if (empty($oldFeatureCode)) {
            jsonResponse(200, '身份验证成功', [
                'identityMatch' => true,
                'featureCode' => $expectedCode,
                'characterName' => $characterName,
                'username' => $username
            ]);
            break;
        }

        // 对比旧特征码与当前期望特征码
        $isMatch = hash_equals($expectedCode, $oldFeatureCode);

        jsonResponse(200, $isMatch ? '身份匹配，存档可继承' : '身份不匹配，存档不可继承', [
            'identityMatch' => $isMatch,
            'featureCode' => $expectedCode,
            'characterName' => $characterName,
            'username' => $username
        ]);
        break;

    // ==================== 诊断 ====================
    case 'diagnostic':
        jsonResponse(200, '云端存档服务运行正常', [
            'php_version'    => PHP_VERSION,
            'server_time'    => date('Y-m-d H:i:s'),
            'data_dir'       => DATA_DIR,
            'data_dir_exists'=> is_dir(DATA_DIR),
            'data_writable'  => is_dir(DATA_DIR) && is_writable(DATA_DIR)
        ]);
        break;

    // ==================== 管理员接口 ====================
    case 'adminLogin':
        $password = trim($data['password'] ?? '');
        if ($password !== ADMIN_PASSWORD) {
            jsonResponse(401, '管理员密码错误');
        }
        
        $adminToken = generateToken();
        $adminData = [
            'token' => $adminToken,
            'expire_time' => time() + ADMIN_TOKEN_EXPIRE
        ];
        file_put_contents(DATA_DIR . '/admin_token.json', json_encode($adminData));
        
        jsonResponse(200, '登录成功', ['token' => $adminToken]);
        break;

    case 'getAllUsers':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $search = trim($data['search'] ?? '');
        $page = intval($data['page'] ?? 1);
        $pageSize = 10;
        
        $users = loadUsers();
        
        // 搜索过滤
        if (!empty($search)) {
            $users = array_filter($users, function($u) use ($search) {
                return strpos($u['username'], $search) !== false;
            });
        }
        
        $users = array_values($users);
        $total = count($users);
        $totalPages = max(1, ceil($total / $pageSize));
        $offset = ($page - 1) * $pageSize;
        $pageUsers = array_slice($users, $offset, $pageSize);
        
        // 获取在线列表
        $onlineFile = DATA_DIR . '/online.json';
        $online = file_exists($onlineFile) ? json_decode(file_get_contents($onlineFile), true) : [];
        $now = time();
        
        // 统计数据
        $hasCharacter = 0;
        foreach ($users as $u) {
            $playerFile = DATA_DIR . "/{$u['username']}_player.json";
            if (file_exists($playerFile)) {
                $pd = json_decode(file_get_contents($playerFile), true);
                if ($pd && !empty($pd['playerName']) && $pd['playerName'] !== '未知角色') {
                    $hasCharacter++;
                }
            }
        }
        
        $onlineCount = 0;
        foreach ($online as $uname => $lastSeen) {
            if ($now - $lastSeen <= 300) {
                $onlineCount++;
            }
        }
        
        // 虚拟在线人数设置
        $virtualConfigFile = DATA_DIR . '/virtual_online.json';
        $virtualEnabled = false;
        $virtualMin = 0;
        $virtualMax = 0;
        $displayOnlineCount = $onlineCount;
        
        if (file_exists($virtualConfigFile)) {
            $vcfg = json_decode(file_get_contents($virtualConfigFile), true) ?: [];
            $virtualEnabled = $vcfg['enabled'] ?? false;
            $virtualMin = intval($vcfg['min'] ?? 0);
            $virtualMax = intval($vcfg['max'] ?? 0);
            
            if ($virtualEnabled && $virtualMax >= $virtualMin) {
                $displayOnlineCount = rand($virtualMin, $virtualMax);
            }
        }
        
        // 消息总数
        $messagesFile = DATA_DIR . '/messages.json';
        $messages = file_exists($messagesFile) ? json_decode(file_get_contents($messagesFile), true) : [];
        
        // 补充用户角色信息
        $resultUsers = [];
        foreach ($pageUsers as $u) {
            $characterName = '';
            $playerFile = DATA_DIR . "/{$u['username']}_player.json";
            if (file_exists($playerFile)) {
                $pd = json_decode(file_get_contents($playerFile), true);
                if ($pd && !empty($pd['playerName']) && $pd['playerName'] !== '未知角色') {
                    $characterName = $pd['playerName'];
                }
            }
            
            // 检查禁言状态
            $isMuted = boolval($u['muted'] ?? false);
            $muteUntil = intval($u['mute_until'] ?? 0);
            
            // 如果禁言已过期，自动解除
            if ($isMuted && $muteUntil > 0 && time() > $muteUntil) {
                $isMuted = false;
                $muteUntil = 0;
            }
            
            $resultUsers[] = [
                'username' => $u['username'],
                'password' => $u['password'] ?? '',
                'created_at' => $u['created_at'] ?? '',
                'last_login' => $u['last_login'] ?? '',
                'last_active' => $u['last_active'] ?? '',
                'ip_address' => $u['ip_address'] ?? '',
                'characterName' => $characterName,
                'isOnline' => isset($online[$u['username']]) && ($now - $online[$u['username']] <= 300),
                'muted' => $isMuted,
                'mute_until' => $muteUntil
            ];
        }
        
        jsonResponse(200, '获取成功', [
            'users' => $resultUsers,
            'total' => $total,
            'totalPages' => $totalPages,
            'currentPage' => $page,
            'virtualEnabled' => $virtualEnabled,
            'virtualMin' => $virtualMin,
            'virtualMax' => $virtualMax,
            'stats' => [
                'totalUsers' => $total,
                'onlineUsers' => $onlineCount,
                'displayOnlineUsers' => $displayOnlineCount,
                'hasCharacter' => $hasCharacter,
                'totalMessages' => count($messages)
            ]
        ]);
        break;

    case 'getUserDetail':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $username = trim($data['username'] ?? '');
        if (empty($username)) {
            jsonResponse(400, '用户名不能为空');
        }
        
        $users = loadUsers();
        $user = null;
        foreach ($users as $u) {
            if ($u['username'] === $username) {
                $user = $u;
                break;
            }
        }
        
        if (!$user) {
            jsonResponse(404, '用户不存在');
        }
        
        // 获取角色数据
        $playerFile = DATA_DIR . "/{$username}_player.json";
        $playerData = [];
        if (file_exists($playerFile)) {
            $playerData = json_decode(file_get_contents($playerFile), true) ?? [];
        }
        
        $result = array_merge($user, [
            'characterName' => $playerData['playerName'] ?? '',
            'level' => $playerData['level'] ?? '',
            'gold' => $playerData['gold'] ?? '',
            'attack' => $playerData['attack'] ?? '',
            'defense' => $playerData['defense'] ?? ''
        ]);
        
        jsonResponse(200, '获取成功', $result);
        break;

    case 'deleteUser':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $username = trim($data['username'] ?? '');
        if (empty($username)) {
            jsonResponse(400, '用户名不能为空');
        }
        
        $users = loadUsers();
        $found = false;
        foreach ($users as $idx => $u) {
            if ($u['username'] === $username) {
                array_splice($users, $idx, 1);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            jsonResponse(404, '用户不存在');
        }
        
        saveUsers($users);
        
        // 删除用户相关数据文件
        @unlink(DATA_DIR . "/{$username}_player.json");
        @unlink(SAVES_DIR . "/{$username}_slots.json");
        for ($i = 0; $i <= 5; $i++) {
            @unlink(SAVES_DIR . "/{$username}_slot{$i}.json");
        }
        
        jsonResponse(200, '删除成功');
        break;

    // ==================== 获取所有聊天消息（管理员） ====================
    case 'getAllMessages':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $messagesFile = DATA_DIR . '/messages.json';
        $messages = [];
        if (file_exists($messagesFile)) {
            $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        }
        
        // 倒序返回（最新在前）
        $messages = array_reverse($messages);
        
        // 搜索过滤
        $search = trim($data['search'] ?? '');
        if (!empty($search)) {
            $messages = array_filter($messages, function($m) use ($search) {
                return strpos($m['content'], $search) !== false ||
                       strpos($m['from_user'], $search) !== false ||
                       strpos($m['character_name'], $search) !== false;
            });
            $messages = array_values($messages);
        }
        
        // 分页
        $page = intval($data['page'] ?? 1);
        $pageSize = 20;
        $total = count($messages);
        $totalPages = max(1, ceil($total / $pageSize));
        $offset = ($page - 1) * $pageSize;
        $pageMessages = array_slice($messages, $offset, $pageSize);
        
        jsonResponse(200, '获取成功', [
            'messages' => $pageMessages,
            'total' => $total,
            'totalPages' => $totalPages,
            'currentPage' => $page
        ]);
        break;

    // ==================== 删除聊天消息（管理员） ====================
    case 'deleteMessage':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $messageId = trim($data['message_id'] ?? '');
        if (empty($messageId)) {
            jsonResponse(400, '消息ID不能为空');
        }
        
        $messagesFile = DATA_DIR . '/messages.json';
        $messages = [];
        if (file_exists($messagesFile)) {
            $messages = json_decode(file_get_contents($messagesFile), true) ?: [];
        }
        
        $found = false;
        foreach ($messages as $idx => $m) {
            if ($m['id'] === $messageId) {
                array_splice($messages, $idx, 1);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            jsonResponse(404, '消息不存在');
        }
        
        file_put_contents($messagesFile, json_encode($messages, JSON_UNESCAPED_UNICODE));
        jsonResponse(200, '删除成功');
        break;

    // ==================== 用户禁言管理 ====================
    case 'muteUser':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $username = trim($data['username'] ?? '');
        $duration = intval($data['duration'] ?? 0); // 分钟，0表示永久禁言
        
        if (empty($username)) {
            jsonResponse(400, '用户名不能为空');
        }
        
        $users = loadUsers();
        $found = false;
        foreach ($users as $idx => $u) {
            if ($u['username'] === $username) {
                $users[$idx]['muted'] = true;
                $users[$idx]['mute_until'] = $duration > 0 ? time() + ($duration * 60) : 0;
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            jsonResponse(404, '用户不存在');
        }
        
        saveUsers($users);
        jsonResponse(200, '禁言成功', [
            'username' => $username,
            'duration' => $duration,
            'mute_until' => $users[$idx]['mute_until']
        ]);
        break;

    case 'unmuteUser':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $username = trim($data['username'] ?? '');
        
        if (empty($username)) {
            jsonResponse(400, '用户名不能为空');
        }
        
        $users = loadUsers();
        $found = false;
        foreach ($users as $idx => $u) {
            if ($u['username'] === $username) {
                $users[$idx]['muted'] = false;
                $users[$idx]['mute_until'] = 0;
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            jsonResponse(404, '用户不存在');
        }
        
        saveUsers($users);
        jsonResponse(200, '解除禁言成功');
        break;

    case 'getMuteStatus':
        $username = trim($data['username'] ?? '');
        
        if (empty($username)) {
            jsonResponse(400, '用户名不能为空');
        }
        
        $users = loadUsers();
        foreach ($users as $u) {
            if ($u['username'] === $username) {
                $isMuted = boolval($u['muted'] ?? false);
                $muteUntil = intval($u['mute_until'] ?? 0);
                
                // 检查禁言是否已过期
                if ($isMuted && $muteUntil > 0 && time() > $muteUntil) {
                    $isMuted = false;
                    $muteUntil = 0;
                }
                
                jsonResponse(200, '获取成功', [
                    'muted' => $isMuted,
                    'mute_until' => $muteUntil
                ]);
                return;
            }
        }
        
        jsonResponse(404, '用户不存在');
        break;

    // ==================== 系统通知/公告 ====================
    case 'sendSystemNotice':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $content = trim($data['content'] ?? '');
        $color = trim($data['color'] ?? '#ff0000'); // 默认红色
        $duration = intval($data['duration'] ?? 4); // 显示时长（秒），默认4秒
        
        if (empty($content)) {
            jsonResponse(400, '公告内容不能为空');
        }
        
        $notice = [
            'id' => uniqid('notice_'),
            'content' => $content,
            'color' => $color,
            'duration' => $duration, // 新增：显示时长
            'created_at' => date('Y-m-d H:i:s'),
            'timestamp' => time()
        ];
        
        // 保存公告到文件
        $noticesFile = DATA_DIR . '/system_notices.json';
        $notices = [];
        if (file_exists($noticesFile)) {
            $notices = json_decode(file_get_contents($noticesFile), true) ?: [];
        }
        // 保持最近10条公告
        array_unshift($notices, $notice);
        if (count($notices) > 10) {
            $notices = array_slice($notices, 0, 10);
        }
        file_put_contents($noticesFile, json_encode($notices, JSON_UNESCAPED_UNICODE));
        
        jsonResponse(200, '公告发送成功', $notice);
        break;

    case 'getSystemNotices':
        $noticesFile = DATA_DIR . '/system_notices.json';
        $notices = [];
        if (file_exists($noticesFile)) {
            $notices = json_decode(file_get_contents($noticesFile), true) ?: [];
        }
        jsonResponse(200, '获取成功', $notices);
        break;

    case 'deleteNotice':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $noticeId = trim($data['notice_id'] ?? '');
        
        if (empty($noticeId)) {
            jsonResponse(400, '公告ID不能为空');
        }
        
        $noticesFile = DATA_DIR . '/system_notices.json';
        $notices = [];
        if (file_exists($noticesFile)) {
            $notices = json_decode(file_get_contents($noticesFile), true) ?: [];
        }
        
        $found = false;
        foreach ($notices as $idx => $n) {
            if ($n['id'] === $noticeId) {
                array_splice($notices, $idx, 1);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            jsonResponse(404, '公告不存在');
        }
        
        file_put_contents($noticesFile, json_encode($notices, JSON_UNESCAPED_UNICODE));
        jsonResponse(200, '删除成功');
        break;

    // ==================== 怪物击败通知 ====================
    case 'monsterDefeated':
        // 支持两种方式：带token验证或直接传player_name
        $token = trim($data['token'] ?? '');
        $playerName = trim($data['player_name'] ?? '');
        
        if (!empty($token)) {
            $user = validateToken($token);
            if (!$user) jsonResponse(401, '登录已过期，请重新登录');
            if (empty($playerName)) {
                $playerName = $user['username'];
            }
        }
        
        if (empty($playerName)) {
            jsonResponse(400, '玩家名称不能为空');
        }
        
        $monsterName = trim($data['monster_name'] ?? '');
        if (empty($monsterName)) {
            jsonResponse(400, '怪物名称不能为空');
        }
        
        // 获取掉落道具列表
        $droppedItems = $data['dropped_items'] ?? [];
        
        // 获取自定义公告标题
        $noticeTitle = trim($data['notice_title'] ?? '');
        
        // 创建击败通知
        $notice = [
            'id' => uniqid('defeat_'),
            'type' => 'monster_defeat',
            'player_name' => $playerName,
            'monster_name' => $monsterName,
            'dropped_items' => $droppedItems,
            'notice_title' => $noticeTitle,
            'created_at' => date('Y-m-d H:i:s'),
            'timestamp' => time()
        ];
        
        // 保存到公告文件
        $noticesFile = DATA_DIR . '/system_notices.json';
        $notices = [];
        if (file_exists($noticesFile)) {
            $notices = json_decode(file_get_contents($noticesFile), true) ?: [];
        }
        array_unshift($notices, $notice);
        if (count($notices) > 10) {
            $notices = array_slice($notices, 0, 10);
        }
        file_put_contents($noticesFile, json_encode($notices, JSON_UNESCAPED_UNICODE));
        
        jsonResponse(200, '通知发送成功', $notice);
        break;

    // ==================== 获取/设置虚拟在线人数（管理员） ====================
    case 'getVirtualOnline':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $configFile = DATA_DIR . '/virtual_online.json';
        $config = ['enabled' => false, 'min' => 0, 'max' => 0];
        if (file_exists($configFile)) {
            $config = json_decode(file_get_contents($configFile), true) ?: $config;
        }
        
        jsonResponse(200, '获取成功', $config);
        break;

    case 'setVirtualOnline':
        $adminToken = trim($data['admin_token'] ?? '');
        if (!validateAdminToken($adminToken)) {
            jsonResponse(401, '管理员未登录或权限不足');
        }
        
        $enabled = boolval($data['enabled'] ?? false);
        $min = intval($data['min'] ?? 0);
        $max = intval($data['max'] ?? 0);
        
        if ($enabled && $max < $min) {
            jsonResponse(400, '最大值不能小于最小值');
        }
        
        $config = [
            'enabled' => $enabled,
            'min' => max(0, $min),
            'max' => max(0, $max)
        ];
        
        file_put_contents(DATA_DIR . '/virtual_online.json', json_encode($config, JSON_UNESCAPED_UNICODE));
        jsonResponse(200, '设置成功', $config);
        break;

    default:
        jsonResponse(404, '未知操作: ' . $action);
        break;
}
