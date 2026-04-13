<?php
// proxy.php - Forward requests to backend API service with debugging

// Configuration
$target_url = 'http://172.32.0.11:8080/api'; // Backend API URL
$allowed_methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
$timeout = 30;

// Set response headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the request path from query parameter
$path = isset($_GET['path']) ? $_GET['path'] : '';

if (empty($path)) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['error' => 'Missing path parameter']);
    exit;
}

// Build full URL with query parameters (properly handle path)
$query_string = http_build_query(array_diff_key($_GET, ['path' => '']));
$full_url = $target_url . '/' . ltrim($path, '/');
if (!empty($query_string)) {
    $full_url .= '?' . $query_string;
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if (!in_array($method, $allowed_methods)) {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Prepare headers to forward
$headers = [];
if (function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        $name_lower = strtolower($name);
        // Skip headers that shouldn't be forwarded
        if (!in_array($name_lower, ['host', 'connection'])) {
            $headers[] = $name . ': ' . $value;
        }
    }
}

// Ensure Content-Type is set for JSON requests
$has_content_type = false;
foreach ($headers as $header) {
    if (stripos($header, 'content-type') === 0) {
        $has_content_type = true;
        break;
    }
}

// Get request body
$body = file_get_contents('php://input');

// If there's a body but no Content-Type, set it to JSON
if (!empty($body) && !$has_content_type) {
    $headers[] = 'Content-Type: application/json';
}

// Prepare cURL options
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $full_url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

if (!empty($headers)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
}

if (!empty($body) && in_array($method, ['POST', 'PUT', 'PATCH'])) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($curl_error) {
    header('Content-Type: application/json');
    http_response_code(502);
    echo json_encode([
        'error' => 'Backend service error',
        'details' => $curl_error,
        'debug' => [
            'called_url' => $full_url,
            'method' => $method,
            'body_sent' => $body ? json_decode($body, true) : null
        ]
    ]);
    exit;
}

// Forward HTTP status code
http_response_code($http_code);
header('Content-Type: application/json');

// If error response, add debug info
if ($http_code >= 400) {
    $response_data = json_decode($response, true);
    if (is_array($response_data)) {
        $response_data['debug'] = [
            'called_url' => $full_url,
            'method' => $method,
            'body_sent' => $body ? json_decode($body, true) : null,
            'http_code' => $http_code
        ];
        echo json_encode($response_data);
    } else {
        echo json_encode([
            'error' => $response,
            'debug' => [
                'called_url' => $full_url,
                'method' => $method,
                'body_sent' => $body ? json_decode($body, true) : null,
                'http_code' => $http_code
            ]
        ]);
    }
} else {
    // Success response - output as is
    if (!empty($response) || $http_code === 204) {
        echo $response;
    }
}
?>
