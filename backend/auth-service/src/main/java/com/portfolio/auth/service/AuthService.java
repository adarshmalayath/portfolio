package com.portfolio.auth.service;

import com.portfolio.auth.config.AuthProperties;
import com.portfolio.auth.model.AuthResponse;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final GoogleTokenVerifierService googleTokenVerifierService;
  private final JwtService jwtService;
  private final Set<String> allowedEmails;

  public AuthService(
      GoogleTokenVerifierService googleTokenVerifierService,
      JwtService jwtService,
      AuthProperties authProperties) {
    this.googleTokenVerifierService = googleTokenVerifierService;
    this.jwtService = jwtService;
    this.allowedEmails =
        authProperties.getAllowedEmails().stream()
            .map(value -> value == null ? "" : value.trim().toLowerCase(Locale.ROOT))
            .filter(value -> !value.isBlank())
            .collect(Collectors.toSet());
  }

  public AuthResponse signInWithGoogle(String idToken) {
    String email = googleTokenVerifierService.verifyAndExtractEmail(idToken);

    if (!allowedEmails.isEmpty() && !allowedEmails.contains(email)) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "This Google account is not authorized for admin access.");
    }

    JwtService.JwtIssueResult result = jwtService.issueToken(email);
    return new AuthResponse(result.token(), email, result.expiresAtEpochSeconds());
  }
}
