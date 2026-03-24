package com.portfolio.content.controller;

import com.portfolio.content.dto.PortfolioContent;
import com.portfolio.content.service.PortfolioContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/content")
public class PortfolioContentController {

  private final PortfolioContentService contentService;

  public PortfolioContentController(PortfolioContentService contentService) {
    this.contentService = contentService;
  }

  @GetMapping("/public")
  public PortfolioContent getPublicContent() {
    return contentService.fetchPublicContent();
  }

  @GetMapping("/admin")
  public PortfolioContent getAdminContent(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
    ensureAdmin(adminEmail);
    return contentService.fetchAdminContent();
  }

  @PutMapping("/admin")
  public PortfolioContent saveAdminContent(
      @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail,
      @Valid @RequestBody PortfolioContent content) {
    ensureAdmin(adminEmail);
    return contentService.saveAdminContent(content);
  }

  private void ensureAdmin(String adminEmail) {
    if (adminEmail == null || adminEmail.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated admin context.");
    }
  }
}
