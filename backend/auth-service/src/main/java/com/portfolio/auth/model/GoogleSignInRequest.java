package com.portfolio.auth.model;

import jakarta.validation.constraints.NotBlank;

public class GoogleSignInRequest {

  @NotBlank(message = "Google ID token is required")
  private String idToken;

  public String getIdToken() {
    return idToken;
  }

  public void setIdToken(String idToken) {
    this.idToken = idToken;
  }
}
