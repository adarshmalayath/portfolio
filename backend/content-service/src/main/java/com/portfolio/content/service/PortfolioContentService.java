package com.portfolio.content.service;

import com.portfolio.content.dto.PortfolioContent;
import com.portfolio.content.repository.PortfolioContentRepository;
import org.springframework.stereotype.Service;

@Service
public class PortfolioContentService {

  private final PortfolioContentRepository repository;

  public PortfolioContentService(PortfolioContentRepository repository) {
    this.repository = repository;
  }

  public PortfolioContent fetchPublicContent() {
    return repository.load();
  }

  public PortfolioContent fetchAdminContent() {
    return repository.load();
  }

  public PortfolioContent saveAdminContent(PortfolioContent content) {
    return repository.save(content);
  }
}
