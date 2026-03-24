package com.portfolio.auth.model;

public class AuthResponse {

  private final String token;
  private final String email;
  private final long expiresAtEpochSeconds;

  public AuthResponse(String token, String email, long expiresAtEpochSeconds) {
    this.token = token;
    this.email = email;
    this.expiresAtEpochSeconds = expiresAtEpochSeconds;
  }

  public String getToken() {
    return token;
  }

  public String getEmail() {
    return email;
  }

  public long getExpiresAtEpochSeconds() {
    return expiresAtEpochSeconds;
  }
}
