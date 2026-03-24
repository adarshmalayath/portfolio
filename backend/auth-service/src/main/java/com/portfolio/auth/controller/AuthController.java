package com.portfolio.auth.controller;

import com.portfolio.auth.model.AuthResponse;
import com.portfolio.auth.model.GoogleSignInRequest;
import com.portfolio.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/google")
  public AuthResponse signInWithGoogle(@Valid @RequestBody GoogleSignInRequest request) {
    return authService.signInWithGoogle(request.getIdToken());
  }
}
