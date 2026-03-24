package com.portfolio.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public Map<String, Object> handleStatusException(ResponseStatusException ex, HttpServletRequest request) {
    int status = ex.getStatusCode().value();
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("timestamp", Instant.now().toString());
    response.put("status", status);
    response.put("error", ex.getStatusCode().toString());
    response.put("message", ex.getReason() == null ? "Request failed" : ex.getReason());
    response.put("path", request.getRequestURI());
    return response;
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public Map<String, Object> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getDefaultMessage())
            .orElse("Invalid request payload.");

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("timestamp", Instant.now().toString());
    response.put("status", HttpStatus.BAD_REQUEST.value());
    response.put("error", HttpStatus.BAD_REQUEST.getReasonPhrase());
    response.put("message", message);
    response.put("path", request.getRequestURI());
    return response;
  }

  @ExceptionHandler(Exception.class)
  public Map<String, Object> handleUnexpected(Exception ex, HttpServletRequest request) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("timestamp", Instant.now().toString());
    response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
    response.put("error", HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
    response.put("message", "Internal server error");
    response.put("path", request.getRequestURI());
    return response;
  }
}
