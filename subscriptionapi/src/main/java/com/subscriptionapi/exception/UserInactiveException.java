package com.subscriptionapi.exception;

public class UserInactiveException extends RuntimeException {
    public UserInactiveException(String message) {
        super(message);
    }
}