package com.portfolio.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.portfolio.auth.config.AuthProperties;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class GoogleTokenVerifierService {

  private final AuthProperties authProperties;

  public GoogleTokenVerifierService(AuthProperties authProperties) {
    this.authProperties = authProperties;
  }

  public String verifyAndExtractEmail(String idToken) {
    String configuredClientId = authProperties.getGoogleClientId();
    if (configuredClientId == null || configuredClientId.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          "Google OAuth is not configured on auth-service (GOOGLE_CLIENT_ID missing).");
    }

    try {
      GoogleIdTokenVerifier.Builder verifierBuilder =
          new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance());

      verifierBuilder.setAudience(List.of(configuredClientId));

      GoogleIdTokenVerifier verifier = verifierBuilder.build();
      GoogleIdToken token = verifier.verify(idToken);

      if (token == null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token.");
      }

      GoogleIdToken.Payload payload = token.getPayload();
      Object emailVerified = payload.getEmailVerified();
      if (!(emailVerified instanceof Boolean) || !((Boolean) emailVerified)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified.");
      }

      String email = payload.getEmail();
      if (email == null || email.isBlank()) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account email missing in token.");
      }

      return email.toLowerCase(Locale.ROOT);
    } catch (GeneralSecurityException | IOException ex) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google token verification failed.", ex);
    }
  }
}
