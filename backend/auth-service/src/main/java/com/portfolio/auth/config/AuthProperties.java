package com.portfolio.auth.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth")
public class AuthProperties {

  private String googleClientId;
  private List<String> allowedEmails = new ArrayList<>();
  private String jwtSecret;
  private long tokenMinutes = 480;

  public String getGoogleClientId() {
    return googleClientId;
  }

  public void setGoogleClientId(String googleClientId) {
    this.googleClientId = googleClientId;
  }

  public List<String> getAllowedEmails() {
    return allowedEmails;
  }

  public void setAllowedEmails(List<String> allowedEmails) {
    this.allowedEmails = allowedEmails;
  }

  public String getJwtSecret() {
    return jwtSecret;
  }

  public void setJwtSecret(String jwtSecret) {
    this.jwtSecret = jwtSecret;
  }

  public long getTokenMinutes() {
    return tokenMinutes;
  }

  public void setTokenMinutes(long tokenMinutes) {
    this.tokenMinutes = tokenMinutes;
  }
}
