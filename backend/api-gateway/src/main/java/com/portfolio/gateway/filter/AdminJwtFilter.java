package com.portfolio.gateway.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AdminJwtFilter implements GlobalFilter, Ordered {

  private static final String ADMIN_PREFIX = "/api/content/admin";

  private final SecretKey signingKey;
  private final ObjectMapper objectMapper;

  public AdminJwtFilter(
      @Value("${gateway.jwt-secret:change-me-super-secret-key-change-me-super-secret-key}") String jwtSecret,
      ObjectMapper objectMapper) {
    if (jwtSecret == null || jwtSecret.isBlank()) {
      throw new IllegalStateException("gateway.jwt-secret must be configured");
    }
    this.signingKey = Keys.hmacShaKeyFor(normalizeSecret(jwtSecret));
    this.objectMapper = objectMapper;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();
    if (!path.startsWith(ADMIN_PREFIX)) {
      return chain.filter(exchange);
    }

    String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return unauthorized(exchange, "Missing Bearer token.");
    }

    String token = authHeader.substring(7).trim();
    if (token.isEmpty()) {
      return unauthorized(exchange, "Missing Bearer token.");
    }

    try {
      Claims claims =
          Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();

      String email = claims.get("email", String.class);
      if (email == null || email.isBlank()) {
        email = claims.getSubject();
      }

      if (email == null || email.isBlank()) {
        return unauthorized(exchange, "Invalid token payload.");
      }

      ServerHttpRequest request =
          exchange.getRequest().mutate().header("X-Admin-Email", email.trim()).build();
      return chain.filter(exchange.mutate().request(request).build());
    } catch (Exception ex) {
      return unauthorized(exchange, "Invalid or expired token.");
    }
  }

  @Override
  public int getOrder() {
    return -100;
  }

  private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
    ServerHttpResponse response = exchange.getResponse();
    response.setStatusCode(HttpStatus.UNAUTHORIZED);
    response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("timestamp", Instant.now().toString());
    payload.put("status", HttpStatus.UNAUTHORIZED.value());
    payload.put("error", "Unauthorized");
    payload.put("message", message);
    payload.put("path", exchange.getRequest().getURI().getPath());

    try {
      byte[] bytes = objectMapper.writeValueAsBytes(payload);
      return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    } catch (Exception ex) {
      return response.setComplete();
    }
  }

  private byte[] normalizeSecret(String secret) {
    byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
    if (raw.length >= 32) {
      return raw;
    }

    try {
      return MessageDigest.getInstance("SHA-256").digest(raw);
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("Missing SHA-256 algorithm", ex);
    }
  }
}
