package com.subscriptionapi.exception;

import java.time.LocalDateTime;

public class ErrorResponse {
    private int status;
    private String message;
    private String path;
    private String timestamp;
    private Object data;

    public ErrorResponse(int status, String message, String path, Object data) {
        this.status = status;
        this.message = message;
        this.path = path;
        this.data = data;
        this.timestamp = LocalDateTime.now().toString();
    }

    // Getters and setters
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
    public String getTimestamp() { return timestamp; }
    public Object getData() { return data; }
}
