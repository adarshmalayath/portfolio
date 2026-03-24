package com.portfolio.auth.service;

import com.portfolio.auth.config.AuthProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final SecretKey signingKey;
  private final long tokenMinutes;

  public JwtService(AuthProperties authProperties) {
    String secret = authProperties.getJwtSecret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException("auth.jwt-secret is required for auth-service startup");
    }
    this.signingKey = Keys.hmacShaKeyFor(normalizeSecret(secret));
    this.tokenMinutes = authProperties.getTokenMinutes();
  }

  public JwtIssueResult issueToken(String email) {
    Instant now = Instant.now();
    Instant expiresAt = now.plusSeconds(tokenMinutes * 60);

    String token =
        Jwts.builder()
            .subject(email)
            .claim("email", email)
            .issuedAt(Date.from(now))
            .expiration(Date.from(expiresAt))
            .signWith(signingKey)
            .compact();

    return new JwtIssueResult(token, expiresAt.getEpochSecond());
  }

  private byte[] normalizeSecret(String secret) {
    byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
    if (raw.length >= 32) {
      return raw;
    }

    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return digest.digest(raw);
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("Missing SHA-256 algorithm", ex);
    }
  }

  public record JwtIssueResult(String token, long expiresAtEpochSeconds) {}
}
